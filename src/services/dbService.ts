import {
  LeadRequest,
  CustomerUser,
  Product,
  SiteSettings,
  ResendEmailSettings,
  VirtualPosSettings,
} from '../types';
import { isLegacyDemoProductId } from '../data/initialProducts';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabaseClient';

export interface AdminSecrets {
  adminPassword?: string;
  notificationWebhookUrl?: string;
  telegramConfig?: {
    botToken?: string;
    chatId?: string;
    enabled?: boolean;
  };
  resendConfig?: ResendEmailSettings;
  posConfig?: VirtualPosSettings;
}

export interface CatalogSnapshot {
  products: Product[];
  settings: Partial<SiteSettings> | null;
  catalogInitialized: boolean;
}

const ADMIN_KEY_STORAGE = 'rvoba_admin_key';
const CUSTOMER_TOKEN_STORAGE = 'rvoba_customer_token_v1';

class DatabaseService {
  /**
   * Read/write authenticated admin password key for Supabase admin RPCs
   */
  getStoredAdminKey(): string {
    try {
      return (
        sessionStorage.getItem(ADMIN_KEY_STORAGE) ||
        localStorage.getItem(ADMIN_KEY_STORAGE) ||
        ''
      );
    } catch {
      return '';
    }
  }

  setStoredAdminKey(key: string, rememberMe = true): void {
    const clean = key.trim();
    if (!clean) return;
    try {
      sessionStorage.setItem(ADMIN_KEY_STORAGE, clean);
      if (rememberMe || localStorage.getItem('rvoba_admin_auth') === 'true') {
        localStorage.setItem(ADMIN_KEY_STORAGE, clean);
      }
    } catch (e) {
      console.warn('Admin key storage error:', e);
    }
  }

  clearStoredAdminKey(): void {
    try {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      localStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch (e) {
      console.warn('Admin key clear error:', e);
    }
  }

  /**
   * Read/write customer session token for authenticated profile updates
   */
  getCustomerSessionToken(): string {
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_STORAGE) || '';
    } catch {
      return '';
    }
  }

  setCustomerSessionToken(token?: string): void {
    if (!token) return;
    try {
      localStorage.setItem(CUSTOMER_TOKEN_STORAGE, token);
    } catch (e) {
      console.warn('Customer token storage error:', e);
    }
  }

  clearCustomerSessionToken(): void {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE);
    } catch (e) {
      console.warn('Customer token clear error:', e);
    }
  }

  /**
   * Securely hash customer passwords using Web Crypto API SHA-256
   */
  async hashPassword(password: string): Promise<string> {
    if (!password) return '';
    try {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return `hash_${btoa(password)}`;
    }
  }

  /**
   * Verify plaintext password against stored hash (local fallback helper)
   */
  async verifyPassword(inputPassword: string, storedPasswordHash?: string): Promise<boolean> {
    if (!storedPasswordHash) return false;
    if (storedPasswordHash === inputPassword) return true;
    const computedHash = await this.hashPassword(inputPassword);
    return computedHash === storedPasswordHash;
  }

  /**
   * Fetch live public catalog products and site settings from Supabase
   */
  async fetchCatalogAndSettings(): Promise<CatalogSnapshot | null> {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        supabase
          .from('products')
          .select('data')
          .eq('is_deleted', false)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('site_settings')
          .select('data, catalog_initialized')
          .eq('id', 1)
          .maybeSingle(),
      ]);

      if (productsRes.error) {
        console.warn('Supabase products fetch warning:', productsRes.error.message);
        return null;
      }

      const products: Product[] = (productsRes.data || [])
        .map((row: { data: Product }) => row.data)
        .filter((p): p is Product => !!p && !!p.id && !isLegacyDemoProductId(p.id));

      const rawSettings = settingsRes.data?.data as Partial<SiteSettings> | undefined;
      const hasSettingsKeys =
        rawSettings && typeof rawSettings === 'object' && Object.keys(rawSettings).length > 0;

      return {
        products,
        settings: hasSettingsKeys ? rawSettings : null,
        catalogInitialized: Boolean(settingsRes.data?.catalog_initialized),
      };
    } catch (e) {
      console.warn('Supabase catalog fetch failed:', e);
      return null;
    }
  }

  /**
   * Subscribe to real-time Postgres changes on products and site_settings
   * so all open browsers/devices update immediately when admin makes edits.
   */
  subscribeToRealtimeCatalog(onRefreshNeeded: () => void): () => void {
    const channel = supabase
      .channel('rvoba-live-catalog')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          onRefreshNeeded();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          onRefreshNeeded();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Verify admin password against Supabase app_private.admin_config (rate-limited)
   */
  async verifyAdminLogin(
    password: string
  ): Promise<{ ok: boolean; secrets?: AdminSecrets; error?: string; networkError?: boolean }> {
    try {
      const { data, error } = await supabase.rpc('admin_verify_login', {
        p_password: password.trim(),
      });
      if (error) {
        console.warn('Admin login RPC error:', error.message);
        return { ok: false, networkError: true };
      }
      const res = data as { ok?: boolean; secrets?: AdminSecrets; error?: string } | null;
      if (res?.ok) {
        return { ok: true, secrets: res.secrets };
      }
      return { ok: false, error: res?.error };
    } catch (e) {
      console.warn('Admin login network error:', e);
      return { ok: false, networkError: true };
    }
  }

  /**
   * Save public site settings + private admin secrets (password, Telegram, webhook, Resend, POS)
   */
  async saveSettings(adminPassword: string, settings: SiteSettings): Promise<boolean> {
    if (!adminPassword) return false;
    try {
      const { data, error } = await supabase.rpc('admin_save_settings', {
        p_admin_password: adminPassword,
        p_settings: settings,
      });
      if (error) {
        console.warn('Save settings RPC error:', error.message);
        return false;
      }
      const res = data as { ok?: boolean; newPassword?: string } | null;
      if (res?.ok && res.newPassword) {
        this.setStoredAdminKey(res.newPassword);
      }
      return Boolean(res?.ok);
    } catch (e) {
      console.warn('Save settings error:', e);
      return false;
    }
  }

  /**
   * Admin product mutations (add, update, delete, clear, replace)
   */
  async upsertProduct(adminPassword: string, product: Product): Promise<boolean> {
    if (!adminPassword || isLegacyDemoProductId(product.id)) return false;
    try {
      const { data, error } = await supabase.rpc('admin_upsert_product', {
        p_admin_password: adminPassword,
        p_product: product,
      });
      if (error) {
        console.warn('Upsert product RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Upsert product error:', e);
      return false;
    }
  }

  async deleteProduct(adminPassword: string, productId: string): Promise<boolean> {
    if (!adminPassword || !productId) return false;
    try {
      const { data, error } = await supabase.rpc('admin_delete_product', {
        p_admin_password: adminPassword,
        p_product_id: productId,
      });
      if (error) {
        console.warn('Delete product RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Delete product error:', e);
      return false;
    }
  }

  async clearAllProducts(adminPassword: string): Promise<boolean> {
    if (!adminPassword) return false;
    try {
      const { data, error } = await supabase.rpc('admin_clear_products', {
        p_admin_password: adminPassword,
      });
      if (error) {
        console.warn('Clear products RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Clear products error:', e);
      return false;
    }
  }

  async replaceAllProducts(adminPassword: string, products: Product[]): Promise<boolean> {
    if (!adminPassword) return false;
    const cleanProducts = products.filter((p) => p && p.id && !isLegacyDemoProductId(p.id));
    try {
      const { data, error } = await supabase.rpc('admin_replace_all_products', {
        p_admin_password: adminPassword,
        p_products: cleanProducts,
      });
      if (error) {
        console.warn('Replace all products RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Replace all products error:', e);
      return false;
    }
  }

  /**
   * Admin CRM Leads & Customers operations
   */
  async adminListLeads(adminPassword: string): Promise<LeadRequest[] | null> {
    if (!adminPassword) return null;
    try {
      const { data, error } = await supabase.rpc('admin_list_leads', {
        p_admin_password: adminPassword,
      });
      if (error) {
        console.warn('Admin list leads RPC error:', error.message);
        return null;
      }
      return Array.isArray(data) ? (data as LeadRequest[]) : [];
    } catch (e) {
      console.warn('Admin list leads error:', e);
      return null;
    }
  }

  async adminUpdateLeadStatus(
    adminPassword: string,
    leadId: string,
    status: LeadRequest['status'],
    adminNotes?: string
  ): Promise<boolean> {
    if (!adminPassword || !leadId) return false;
    try {
      const { data, error } = await supabase.rpc('admin_update_lead_status', {
        p_admin_password: adminPassword,
        p_lead_id: leadId,
        p_status: status || 'bekliyor',
        p_admin_notes: adminNotes ?? null,
      });
      if (error) {
        console.warn('Admin update lead status RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Admin update lead status error:', e);
      return false;
    }
  }

  async adminUpdateLeadTracking(
    adminPassword: string,
    leadId: string,
    status: LeadRequest['status'],
    adminNotes?: string,
    trackingCarrier?: string,
    trackingCode?: string
  ): Promise<LeadRequest | null> {
    if (!adminPassword || !leadId) return null;
    try {
      const { data, error } = await supabase.rpc('admin_update_lead_tracking', {
        p_admin_password: adminPassword,
        p_lead_id: leadId,
        p_status: status || 'bekliyor',
        p_admin_notes: adminNotes ?? null,
        p_tracking_carrier: trackingCarrier ?? null,
        p_tracking_code: trackingCode ?? null,
      });
      if (error) {
        console.warn('Admin update lead tracking RPC error:', error.message);
        return null;
      }
      const res = data as { ok?: boolean; lead?: LeadRequest } | null;
      return res?.ok && res.lead ? res.lead : null;
    } catch (e) {
      console.warn('Admin update lead tracking error:', e);
      return null;
    }
  }

  async adminDeleteLead(adminPassword: string, leadId: string): Promise<boolean> {
    if (!adminPassword || !leadId) return false;
    try {
      const { data, error } = await supabase.rpc('admin_delete_lead', {
        p_admin_password: adminPassword,
        p_lead_id: leadId,
      });
      if (error) {
        console.warn('Admin delete lead RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Admin delete lead error:', e);
      return false;
    }
  }

  async adminBulkUpsertLeads(adminPassword: string, leads: LeadRequest[]): Promise<boolean> {
    if (!adminPassword || leads.length === 0) return false;
    try {
      const { data, error } = await supabase.rpc('admin_bulk_upsert_leads', {
        p_admin_password: adminPassword,
        p_leads: leads,
      });
      if (error) {
        console.warn('Admin bulk upsert leads RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Admin bulk upsert leads error:', e);
      return false;
    }
  }

  async adminListCustomers(adminPassword: string): Promise<CustomerUser[] | null> {
    if (!adminPassword) return null;
    try {
      const { data, error } = await supabase.rpc('admin_list_customers', {
        p_admin_password: adminPassword,
      });
      if (error) {
        console.warn('Admin list customers RPC error:', error.message);
        return null;
      }
      return Array.isArray(data) ? (data as CustomerUser[]) : [];
    } catch (e) {
      console.warn('Admin list customers error:', e);
      return null;
    }
  }

  async adminDeleteCustomer(adminPassword: string, customerId: string): Promise<boolean> {
    if (!adminPassword || !customerId) return false;
    try {
      const { data, error } = await supabase.rpc('admin_delete_customer', {
        p_admin_password: adminPassword,
        p_customer_id: customerId,
      });
      if (error) {
        console.warn('Admin delete customer RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Admin delete customer error:', e);
      return false;
    }
  }

  async adminResetCustomerPassword(
    adminPassword: string,
    customerId: string,
    newPasswordPlain: string
  ): Promise<boolean> {
    if (!adminPassword || !customerId || !newPasswordPlain.trim()) return false;
    try {
      const passwordHash = await this.hashPassword(newPasswordPlain.trim());
      const { data, error } = await supabase.rpc('admin_reset_customer_password', {
        p_admin_password: adminPassword,
        p_customer_id: customerId,
        p_new_password_hash: passwordHash,
      });
      if (error) {
        console.warn('Admin reset customer password RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Admin reset customer password error:', e);
      return false;
    }
  }

  async adminBulkUpsertCustomers(adminPassword: string, customers: CustomerUser[]): Promise<boolean> {
    if (!adminPassword || customers.length === 0) return false;
    try {
      const { data, error } = await supabase.rpc('admin_bulk_upsert_customers', {
        p_admin_password: adminPassword,
        p_customers: customers,
      });
      if (error) {
        console.warn('Admin bulk upsert customers RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Admin bulk upsert customers error:', e);
      return false;
    }
  }

  /**
   * Customer Order Lookup (Account Drawer & Guest Order Tracking)
   */
  async lookupCustomerLeads(params: {
    customerId?: string;
    phone?: string;
    query?: string;
  }): Promise<LeadRequest[]> {
    try {
      const { data, error } = await supabase.rpc('lookup_customer_leads', {
        p_customer_id: params.customerId || null,
        p_phone: params.phone || null,
        p_query: params.query || null,
      });
      if (error) {
        console.warn('Lookup customer leads RPC error:', error.message);
        return [];
      }
      return Array.isArray(data) ? (data as LeadRequest[]) : [];
    } catch (e) {
      console.warn('Lookup customer leads error:', e);
      return [];
    }
  }

  /**
   * Customer Registration, Login, 6-Digit OTP Password Reset & Session-Protected Profile Sync
   */
  async registerCustomer(
    user: CustomerUser,
    passwordHash: string
  ): Promise<{ ok: boolean; user?: CustomerUser; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('register_customer', {
        p_user: user,
        p_password_hash: passwordHash,
      });
      if (error) {
        console.warn('Register customer RPC error:', error.message);
        return { ok: false, error: 'network_error' };
      }
      const res = data as {
        ok?: boolean;
        user?: CustomerUser;
        sessionToken?: string;
        error?: string;
      } | null;
      if (res?.ok && res.sessionToken) {
        this.setCustomerSessionToken(res.sessionToken);
      }
      return {
        ok: Boolean(res?.ok),
        user: res?.user,
        error: res?.error,
      };
    } catch (e) {
      console.warn('Register customer error:', e);
      return { ok: false, error: 'network_error' };
    }
  }

  async loginCustomer(
    identifier: string,
    passwordHash: string
  ): Promise<{ ok: boolean; user?: CustomerUser; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('login_customer', {
        p_identifier: identifier.trim(),
        p_password_hash: passwordHash,
      });
      if (error) {
        console.warn('Login customer RPC error:', error.message);
        return { ok: false, error: 'network_error' };
      }
      const res = data as {
        ok?: boolean;
        user?: CustomerUser;
        sessionToken?: string;
        error?: string;
      } | null;
      if (res?.ok && res.sessionToken) {
        this.setCustomerSessionToken(res.sessionToken);
      }
      return {
        ok: Boolean(res?.ok),
        user: res?.user,
        error: res?.error,
      };
    } catch (e) {
      console.warn('Login customer error:', e);
      return { ok: false, error: 'network_error' };
    }
  }

  async requestPasswordReset(
    identifier: string
  ): Promise<{ ok: boolean; emailSent?: boolean; maskedEmail?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('request_customer_password_reset', {
        p_identifier: identifier.trim(),
      });
      if (error) {
        console.warn('Password reset request RPC error:', error.message);
        return { ok: false, error: 'network_error' };
      }
      const res = data as {
        ok?: boolean;
        emailSent?: boolean;
        maskedEmail?: string;
        error?: string;
      } | null;
      return {
        ok: Boolean(res?.ok),
        emailSent: res?.emailSent,
        maskedEmail: res?.maskedEmail,
        error: res?.error,
      };
    } catch (e) {
      console.warn('Password reset request error:', e);
      return { ok: false, error: 'network_error' };
    }
  }

  async confirmPasswordReset(
    identifier: string,
    code: string,
    newPasswordPlain: string
  ): Promise<{ ok: boolean; user?: CustomerUser; error?: string }> {
    try {
      const newPasswordHash = await this.hashPassword(newPasswordPlain.trim());
      const { data, error } = await supabase.rpc('confirm_customer_password_reset', {
        p_identifier: identifier.trim(),
        p_code: code.trim(),
        p_new_password_hash: newPasswordHash,
      });
      if (error) {
        console.warn('Confirm password reset RPC error:', error.message);
        return { ok: false, error: 'network_error' };
      }
      const res = data as {
        ok?: boolean;
        user?: CustomerUser;
        sessionToken?: string;
        error?: string;
      } | null;
      if (res?.ok && res.sessionToken) {
        this.setCustomerSessionToken(res.sessionToken);
      }
      return {
        ok: Boolean(res?.ok),
        user: res?.user,
        error: res?.error,
      };
    } catch (e) {
      console.warn('Confirm password reset error:', e);
      return { ok: false, error: 'network_error' };
    }
  }

  async updateCustomerProfile(customerId: string, user: CustomerUser): Promise<boolean> {
    if (!customerId) return false;
    try {
      const token = this.getCustomerSessionToken();
      const payload = token ? { ...user, _sessionToken: token } : user;
      const { data, error } = await supabase.rpc('update_customer_profile', {
        p_customer_id: customerId,
        p_user: payload,
      });
      if (error) {
        console.warn('Update customer profile RPC error:', error.message);
        return false;
      }
      return Boolean((data as { ok?: boolean } | null)?.ok);
    } catch (e) {
      console.warn('Update customer profile error:', e);
      return false;
    }
  }

  /**
   * Legacy helper kept for backward compatibility
   */
  async saveCustomer(user: CustomerUser): Promise<void> {
    try {
      const existingRaw = localStorage.getItem('rvoba_customers_v1');
      const users: CustomerUser[] = existingRaw ? JSON.parse(existingRaw) : [];
      const cleanUser = { ...user };
      delete cleanUser.password;
      const updated = [cleanUser, ...users.filter((u) => u.id !== user.id)];
      localStorage.setItem('rvoba_customers_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Customer local cache error:', e);
    }
  }

  /**
   * Initialize PayTR 3D Secure iFrame checkout via Supabase Edge Function `payment-checkout`
   */
  async initPaytrCheckout(lead: LeadRequest): Promise<{
    ok: boolean;
    iframeUrl?: string;
    merchantOid?: string;
    totalAmount?: number;
    error?: string;
    reason?: string;
    productName?: string;
  }> {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/payment-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'init_paytr',
          lead,
        }),
      });
      const json = await resp.json();
      return json;
    } catch (e) {
      console.warn('PayTR checkout init error:', e);
      return { ok: false, error: 'network_error' };
    }
  }

  async checkPaytrOrderStatus(merchantOid: string): Promise<{
    ok: boolean;
    status?: string;
    failureReason?: string;
    lead?: LeadRequest | null;
  }> {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/payment-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: 'check_status',
          merchantOid,
        }),
      });
      return await resp.json();
    } catch (e) {
      console.warn('PayTR check status error:', e);
      return { ok: false };
    }
  }

  /**
   * Send instant Telegram message alert (used by AdminPortal Test Button & offline fallback)
   */
  async sendTelegramAlert(message: string, botToken?: string, chatId?: string): Promise<boolean> {
    if (!botToken || !chatId) return false;
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Telegram notification failed:', e);
      return false;
    }
  }

  /**
   * Real-time Webhook Dispatcher (used by AdminPortal Test Button & offline fallback)
   */
  async sendWebhookNotification(
    event: string,
    payload: Record<string, unknown>,
    customUrl?: string
  ): Promise<void> {
    if (!customUrl) return;
    try {
      await fetch(customUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          payload,
        }),
      });
    } catch (e) {
      console.warn('Webhook dispatch failed:', e);
    }
  }

  /**
   * Save a new lead/order to Supabase PostgreSQL:
   * - Server recalculates/verifies product prices, shipping & transfer discount
   * - Atomically decrements product stock_count
   * - Sends server-side Telegram + Webhook + Resend Customer Confirmation Email via pg_net
   */
  async saveLead(
    lead: LeadRequest,
    settings?: SiteSettings
  ): Promise<{ ok: boolean; lead: LeadRequest; error?: string }> {
    let savedToSupabase = false;
    let verifiedLead: LeadRequest = lead;

    try {
      const { data, error } = await supabase.rpc('submit_lead', {
        p_lead: lead,
      });

      if (error) {
        if (error.message && error.message.includes('Stok yetersiz')) {
          return { ok: false, lead, error: error.message };
        }
        console.warn('Supabase submit_lead RPC error:', error.message);
      } else {
        const res = data as { ok?: boolean; lead?: LeadRequest } | null;
        if (res?.ok) {
          savedToSupabase = true;
          if (res.lead) {
            verifiedLead = res.lead;
          }
        }
      }
    } catch (err) {
      console.warn('Supabase submit_lead network error:', err);
    }

    // Cache verified lead locally for instant responsiveness
    try {
      const existingRaw = localStorage.getItem('rvoba_leads_v1');
      const leads: LeadRequest[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [verifiedLead, ...leads.filter((l) => l.id !== verifiedLead.id)];
      localStorage.setItem('rvoba_leads_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Dispatch cross-tab sync event
    window.dispatchEvent(new CustomEvent('rvoba:new-lead', { detail: verifiedLead }));

    // Fallback client-side notification ONLY if Supabase call did not succeed
    if (!savedToSupabase) {
      const tg = settings?.telegramConfig;
      if (tg?.enabled && tg.botToken && tg.chatId) {
        const itemsList = (verifiedLead.items || [])
          .map(
            (it) =>
              `• ${it.quantity} ${it.unit} ${it.name}${it.variantName ? ` [${it.variantName}]` : ''}`
          )
          .join('\n');

        const tgMsg =
          `🚨 <b>RVOBA® — YENİ SİPARİŞ / TALEP!</b>\n\n` +
          `<b>Sipariş No:</b> ${verifiedLead.orderNumber || verifiedLead.id}\n` +
          `<b>Müşteri:</b> ${verifiedLead.fullName}\n` +
          `<b>Telefon:</b> ${verifiedLead.phone}\n` +
          `<b>Konum:</b> ${verifiedLead.district} / ${verifiedLead.city}\n` +
          `<b>Tutar:</b> ${verifiedLead.totalAmount.toLocaleString('tr-TR')} ₺\n\n` +
          `<b>Kalemler:</b>\n${itemsList}`;

        this.sendTelegramAlert(tgMsg, tg.botToken, tg.chatId);
      }

      if (settings?.notificationWebhookUrl) {
        this.sendWebhookNotification(
          'new_order',
          {
            orderNumber: verifiedLead.orderNumber,
            customerName: verifiedLead.fullName,
            phone: verifiedLead.phone,
            city: `${verifiedLead.district} / ${verifiedLead.city}`,
            totalAmount: `${verifiedLead.totalAmount.toLocaleString('tr-TR')} ₺`,
            items: verifiedLead.items,
          },
          settings.notificationWebhookUrl
        );
      }
    }

    return { ok: true, lead: verifiedLead };
  }
}

export const dbService = new DatabaseService();
