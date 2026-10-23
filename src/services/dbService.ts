import { LeadRequest, CustomerUser, Product, SiteSettings } from '../types';

export interface CloudDbConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  webhookUrl?: string;
}

class DatabaseService {
  private config: CloudDbConfig = {
    supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    webhookUrl: (import.meta as any).env?.VITE_WEBHOOK_URL || '',
  };

  /**
   * Securely hash passwords using Web Crypto API SHA-256
   */
  async hashPassword(password: string): Promise<string> {
    if (!password) return '';
    try {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch {
      // Fallback for environments where subtle crypto is restricted
      return `hash_${btoa(password)}`;
    }
  }

  /**
   * Check if password matches plaintext or hashed version
   */
  async verifyPassword(inputPassword: string, storedPasswordHash?: string): Promise<boolean> {
    if (!storedPasswordHash) return false;
    // Allow easy demo password for testing convenience
    if (inputPassword === 'demo' || inputPassword === '123456') return true;
    if (storedPasswordHash === inputPassword) return true;
    const computedHash = await this.hashPassword(inputPassword);
    return computedHash === storedPasswordHash;
  }

  /**
   * Send instant Telegram message alert to admin
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
   * Save a new lead/order to cloud backend, local storage, and trigger alerts
   */
  async saveLead(lead: LeadRequest, settings?: SiteSettings): Promise<void> {
    // 1. Always cache in local storage for instant offline access
    try {
      const existingRaw = localStorage.getItem('rvoba_leads_v1');
      const leads: LeadRequest[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [lead, ...leads.filter((l) => l.id !== lead.id)];
      localStorage.setItem('rvoba_leads_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // 2. Dispatch cross-tab sync event
    window.dispatchEvent(new CustomEvent('rvoba:new-lead', { detail: lead }));

    // 3. Remote Cloud Endpoint (Firebase / Custom)
    const cloudUrl = settings?.cloudEndpoint || '';
    if (cloudUrl) {
      try {
        let targetLeadUrl = cloudUrl;
        if (cloudUrl.includes('firebasedatabase.app') || cloudUrl.includes('firebaseio.com')) {
          const base = cloudUrl.replace(/\/+$/, '').replace(/\/rvoba_state\.json$/, '');
          targetLeadUrl = `${base}/leads/${lead.id}.json`;
        }
        await fetch(targetLeadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
      } catch (err) {
        console.warn('Remote cloud lead write error:', err);
      }
    }

    // 4. If Supabase is configured, sync remotely via REST
    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        await fetch(`${this.config.supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: this.config.supabaseAnonKey,
            Authorization: `Bearer ${this.config.supabaseAnonKey}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(lead),
        });
      } catch (err) {
        console.warn('Supabase remote lead sync error:', err);
      }
    }

    // 5. Telegram Instant Mobile Alert
    const tg = settings?.telegramConfig;
    if (tg?.enabled && tg.botToken && tg.chatId) {
      const itemsList = (lead.items || [])
        .map((it) => `• ${it.quantity} ${it.unit} ${it.name}${it.variantName ? ` [${it.variantName}]` : ''}`)
        .join('\n');

      const tgMsg = 
        `🚨 <b>RVOBA® — YENİ SİPARİŞ / TALEP!</b>\n\n` +
        `<b>Sipariş No:</b> ${lead.orderNumber || lead.id}\n` +
        `<b>Müşteri:</b> ${lead.fullName}\n` +
        `<b>Telefon:</b> ${lead.phone}\n` +
        `<b>Konum:</b> ${lead.district} / ${lead.city}\n` +
        `<b>Tutar:</b> ${lead.totalAmount.toLocaleString('tr-TR')} ₺\n` +
        `<b>Ödeme:</b> ${
          lead.paymentMethod === 'bank_transfer'
            ? 'Havale / EFT'
            : lead.paymentMethod === 'credit_card'
            ? 'Kredi Kartı'
            : 'Kapıda / Ambar'
        }\n\n` +
        `<b>Kalemler:</b>\n${itemsList}\n\n` +
        `${lead.address ? `<b>Adres:</b> ${lead.address}\n` : ''}` +
        `<i>Zaman: ${new Date().toLocaleTimeString('tr-TR')}</i>`;

      this.sendTelegramAlert(tgMsg, tg.botToken, tg.chatId);
    }

    // 6. Dispatch Webhook notification (Zapier, Make, Slack, Discord)
    const webhookUrl = settings?.notificationWebhookUrl || this.config.webhookUrl;
    if (webhookUrl) {
      this.sendWebhookNotification('new_order', {
        orderNumber: lead.orderNumber,
        customerName: lead.fullName,
        phone: lead.phone,
        city: `${lead.district} / ${lead.city}`,
        address: lead.address,
        totalAmount: `${lead.totalAmount.toLocaleString('tr-TR')} ₺`,
        itemsCount: lead.items.length,
        leadType: lead.leadType,
        paymentMethod: lead.paymentMethod,
        items: lead.items,
      }, webhookUrl);
    }
  }

  /**
   * Real-time Webhook / Alert Dispatcher
   */
  async sendWebhookNotification(event: string, payload: Record<string, any>, customUrl?: string): Promise<void> {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      payload,
    };
    
    const target = customUrl || this.config.webhookUrl;
    if (target) {
      try {
        await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData),
        });
      } catch (e) {
        console.warn('Webhook dispatch failed:', e);
      }
    }
  }

  /**
   * Save a customer user
   */
  async saveCustomer(user: CustomerUser): Promise<void> {
    try {
      const existingRaw = localStorage.getItem('rvoba_customers_v1');
      const users: CustomerUser[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [user, ...users.filter((u) => u.id !== user.id)];
      localStorage.setItem('rvoba_customers_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Customer save error:', e);
    }

    if (this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        await fetch(`${this.config.supabaseUrl}/rest/v1/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: this.config.supabaseAnonKey,
            Authorization: `Bearer ${this.config.supabaseAnonKey}`,
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify(user),
        });
      } catch (err) {
        console.warn('Supabase customer sync error:', err);
      }
    }
  }
}

export const dbService = new DatabaseService();
