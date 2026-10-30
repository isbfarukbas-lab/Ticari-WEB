import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerStore } from './components/CustomerStore';
import { CustomerCartDrawer } from './components/CustomerCartDrawer';
import { CustomerTrustSection } from './components/CustomerTrustSection';
import { CustomerFooter } from './components/CustomerFooter';
import type { LegalTabKey } from './components/CustomerLegalModal';

// Lazy-loaded heavy routes & modals so storefront visitors download ~50% less initial JS
const CustomerLandingPage = lazy(() =>
  import('./components/CustomerLandingPage').then((m) => ({ default: m.CustomerLandingPage }))
);
const CustomerConfigurator = lazy(() =>
  import('./components/CustomerConfigurator').then((m) => ({ default: m.CustomerConfigurator }))
);
const CustomerCheckoutModal = lazy(() =>
  import('./components/CustomerCheckoutModal').then((m) => ({ default: m.CustomerCheckoutModal }))
);
const CustomerInspectionModal = lazy(() =>
  import('./components/CustomerInspectionModal').then((m) => ({ default: m.CustomerInspectionModal }))
);
const CustomerProformaModal = lazy(() =>
  import('./components/CustomerProformaModal').then((m) => ({ default: m.CustomerProformaModal }))
);
const CustomerCallbackModal = lazy(() =>
  import('./components/CustomerCallbackModal').then((m) => ({ default: m.CustomerCallbackModal }))
);
const CustomerLegalModal = lazy(() =>
  import('./components/CustomerLegalModal').then((m) => ({ default: m.CustomerLegalModal }))
);
const CustomerAuthModal = lazy(() =>
  import('./components/CustomerAuthModal').then((m) => ({ default: m.CustomerAuthModal }))
);
const CustomerAccountDrawer = lazy(() =>
  import('./components/CustomerAccountDrawer').then((m) => ({ default: m.CustomerAccountDrawer }))
);
const CustomerOrderLookupModal = lazy(() =>
  import('./components/CustomerOrderLookupModal').then((m) => ({ default: m.CustomerOrderLookupModal }))
);
const AdminPortal = lazy(() =>
  import('./components/AdminPortal').then((m) => ({ default: m.AdminPortal }))
);
const AdminLoginScreen = lazy(() =>
  import('./components/AdminLoginScreen').then((m) => ({ default: m.AdminLoginScreen }))
);

import { CATEGORIES, INITIAL_PRODUCTS, isLegacyDemoProductId } from './data/initialProducts';
import { INITIAL_SETTINGS } from './data/initialSettings';
import { CartItem, Product, ProductVariant, LeadRequest, CustomRequestItem, CategoryKey, SiteSettings, CustomerUser } from './types';
import { ShoppingBag, ArrowUpRight, ArrowLeft, Hammer, Calendar } from 'lucide-react';
import { syncToCloudAndTabs, subscribeToLiveSync } from './utils/cloudSync';
import { dbService, AdminSecrets } from './services/dbService';
import { migrateProductImagesToCdn, isBase64DataUrl } from './utils/imageOptimizer';
import {
  updatePageSeo,
  initAnalytics,
  trackEcommerceEvent,
  extractProductIdFromLocation,
} from './utils/seo';

const resolveViewFromLocation = (): 'landing' | 'configurator' | 'store' | 'admin' => {
  const hash = window.location.hash;
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (hash === '#admin' || pathname === '/admin' || pathname.endsWith('/admin')) return 'admin';
  if (
    hash === '#hesapla' ||
    hash === '#teklif' ||
    pathname === '/teklif' ||
    pathname === '/hesapla'
  ) {
    return 'configurator';
  }
  if (
    hash === '#tanitim' ||
    hash === '#hakkimizda' ||
    pathname === '/tanitim' ||
    pathname === '/hakkimizda'
  ) {
    return 'landing';
  }
  return 'store';
};

const normalizeLeadRecord = (l: LeadRequest): LeadRequest => {
  const rawStatus = l.status as string | undefined;
  const normalizedStatus: LeadRequest['status'] =
    rawStatus === 'sozlesme_imzalandi' || rawStatus === 'completed'
      ? 'sozlesme_imzalandi'
      : rawStatus === 'kesif_verildi' || rawStatus === 'scheduled'
      ? 'kesif_verildi'
      : rawStatus === 'arandi' || rawStatus === 'contacted'
      ? 'arandi'
      : 'bekliyor';
  return { ...l, status: normalizedStatus };
};

const mergePublicSettings = (prev: SiteSettings, incoming?: Partial<SiteSettings> | null): SiteSettings => {
  if (!incoming || typeof incoming !== 'object') return prev;
  const mergedContent = {
    ...INITIAL_SETTINGS.content,
    ...(prev.content || {}),
    ...(incoming.content || {}),
  };
  const paymentMethods = {
    ...INITIAL_SETTINGS.paymentMethods,
    ...(prev.paymentMethods || {}),
    ...(incoming.paymentMethods || {}),
    enableCreditCard:
      incoming.paymentMethods?.enableCreditCard ??
      prev.paymentMethods?.enableCreditCard ??
      false,
  };
  return {
    ...prev,
    ...incoming,
    // Keep private admin secrets in memory when public settings (which strip secrets) arrive
    adminPassword: incoming.adminPassword ?? prev.adminPassword,
    telegramConfig: incoming.telegramConfig ?? prev.telegramConfig,
    notificationWebhookUrl: incoming.notificationWebhookUrl ?? prev.notificationWebhookUrl,
    resendConfig: incoming.resendConfig ?? prev.resendConfig,
    posConfig: incoming.posConfig ?? prev.posConfig,
    analyticsConfig: incoming.analyticsConfig
      ? { ...(prev.analyticsConfig || {}), ...incoming.analyticsConfig }
      : prev.analyticsConfig,
    paymentMethods: paymentMethods as SiteSettings['paymentMethods'],
    content: mergedContent as SiteSettings['content'],
  };
};

export const App: React.FC = () => {
  // Navigation view: 'store' (Satış Vitrini & E-Ticaret) | 'configurator' (Komple Tadilat Teklifi) | 'landing' (Kurumsal Tanıtım) | 'admin' (Yönetici)
  const [currentView, setCurrentView] = useState<'landing' | 'configurator' | 'store' | 'admin'>(
    resolveViewFromLocation
  );

  // Synchronize clean URL paths & backward-compatible hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentView(resolveViewFromLocation());
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Products state: strips all 30 legacy demo products immediately and syncs live from Supabase
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_products_v1');
      if (saved !== null) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((p) => p && p.id && !isLegacyDemoProductId(p.id));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('rvoba_products_v1', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_products_v1', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Cart state with localStorage persistence (starts clean with 0 items & strips legacy demo products)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_cart_v1');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.filter(
          (item) =>
            item.id !== 'sample-1' &&
            item.id !== 'sample-2' &&
            !isLegacyDemoProductId(item.productId) &&
            !isLegacyDemoProductId(item.product?.id)
        );
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_cart_v1', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Leads state (starts clean without fake sample records; strictly respects deletions)
  const [leads, setLeads] = useState<LeadRequest[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_leads_v1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed
            .filter((l) => {
              if (!l || l.id === 'lead-sample-1' || seen.has(l.id)) return false;
              seen.add(l.id);
              return true;
            })
            .map((l) => {
              const rawStatus = l.status as string | undefined;
              const normalizedStatus: LeadRequest['status'] =
                rawStatus === 'sozlesme_imzalandi' || rawStatus === 'completed'
                  ? 'sozlesme_imzalandi'
                  : rawStatus === 'kesif_verildi' || rawStatus === 'scheduled'
                  ? 'kesif_verildi'
                  : rawStatus === 'arandi' || rawStatus === 'contacted'
                  ? 'arandi'
                  : 'bekliyor';
              return { ...l, status: normalizedStatus };
            });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_leads_v1', JSON.stringify(leads));
    } catch (e) {
      console.error(e);
    }
  }, [leads]);

  // Site settings state with localStorage persistence
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('rvoba_settings_v1') || localStorage.getItem('restolab_settings_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mergedContent = {
          ...INITIAL_SETTINGS.content,
          ...(parsed.content || {}),
        };
        // Automatically sanitize legacy texts containing "montaj"
        if (mergedContent.storeSubtitle && mergedContent.storeSubtitle.includes('montaj')) {
          mergedContent.storeSubtitle = INITIAL_SETTINGS.content?.storeSubtitle || '';
        }
        if (mergedContent.storePerk3 && mergedContent.storePerk3.includes('Montaj')) {
          mergedContent.storePerk3 = INITIAL_SETTINGS.content?.storePerk3 || '';
        }
        // Payment methods (credit card waits until company establishment)
        const paymentMethods = {
          ...INITIAL_SETTINGS.paymentMethods,
          ...(parsed.paymentMethods || {}),
          enableCreditCard: parsed.paymentMethods?.enableCreditCard ?? false,
        };
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          paymentMethods,
          cloudEndpoint: parsed.cloudEndpoint || INITIAL_SETTINGS.cloudEndpoint || '',
          notificationWebhookUrl: parsed.notificationWebhookUrl || INITIAL_SETTINGS.notificationWebhookUrl || '',
          telegramConfig: parsed.telegramConfig || INITIAL_SETTINGS.telegramConfig,
          content: mergedContent,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Initialize Google Analytics 4 (gtag.js) & Meta Pixel when configured in Admin Settings
  useEffect(() => {
    initAnalytics(settings.analyticsConfig);
  }, [settings.analyticsConfig]);

  // Dynamic SEO meta tags, Canonical URL & Structured JSON-LD per view
  useEffect(() => {
    if (currentView === 'store' && extractProductIdFromLocation()) {
      // CustomerStore manages product-specific SEO while a /urun/... preview is open
      return;
    }
    updatePageSeo({ view: currentView, settings });
  }, [currentView, settings]);

  // Customer room & sqM state
  const [activeRoom, setActiveRoom] = useState<string>('2+1 Komple Ev');
  const [defaultSqM, setDefaultSqM] = useState<number>(85);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isProformaOpen, setIsProformaOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTabKey | null>(null);
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('Kadıköy');

  // Customer User Authentication & Accounts (starts clean without fake demo customer)
  const [allUsers, setAllUsers] = useState<CustomerUser[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_customers_v1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((u) => u.id !== 'cust-demo-1');
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_customers_v1', JSON.stringify(allUsers));
    } catch (e) {
      console.error(e);
    }
  }, [allUsers]);

  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('rvoba_customer_user_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('rvoba_customer_user_v1', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('rvoba_customer_user_v1');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  const handleLoginSuccess = (user: CustomerUser) => {
    setCurrentUser(user);
    setAllUsers(prev => {
      const idx = prev.findIndex(u => u.id === user.id);
      const next = idx > -1 ? prev.map((u, i) => (i === idx ? user : u)) : [...prev, user];
      syncToCloudAndTabs({ customers: next });
      return next;
    });
  };

  const handleRegisterUser = (newUser: CustomerUser) => {
    setAllUsers(prev => {
      const next = [newUser, ...prev];
      syncToCloudAndTabs({ customers: next });
      return next;
    });
    setCurrentUser(newUser);
  };

  const handleUpdateUser = (updatedUser: CustomerUser) => {
    setCurrentUser(updatedUser);
    setAllUsers(prev => {
      const next = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      syncToCloudAndTabs({ customers: next });
      return next;
    });
    dbService.updateCustomerProfile(updatedUser.id, updatedUser).catch((err) => console.warn(err));
  };

  const handleCustomerLogout = () => {
    dbService.clearCustomerSessionToken();
    setCurrentUser(null);
    setIsAccountDrawerOpen(false);
  };

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('rvoba_admin_auth') === 'true' || localStorage.getItem('rvoba_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const getActiveAdminKey = useCallback((): string => {
    return dbService.getStoredAdminKey() || settings.adminPassword || 'rvoba2026';
  }, [settings.adminPassword]);

  const handleDeleteCustomer = (customerId: string) => {
    setAllUsers(prev => {
      const next = prev.filter(u => u.id !== customerId);
      syncToCloudAndTabs({ customers: next });
      return next;
    });
    if (currentUser && currentUser.id === customerId) {
      dbService.clearCustomerSessionToken();
      setCurrentUser(null);
      setIsAccountDrawerOpen(false);
    }
    dbService.adminDeleteCustomer(getActiveAdminKey(), customerId).catch((err) => console.warn(err));
  };

  const applyAdminSecrets = useCallback((secrets?: AdminSecrets) => {
    if (!secrets) return;
    setSettings((prev) => ({
      ...prev,
      adminPassword: secrets.adminPassword ?? prev.adminPassword,
      notificationWebhookUrl: secrets.notificationWebhookUrl ?? prev.notificationWebhookUrl,
      telegramConfig: secrets.telegramConfig
        ? { ...(prev.telegramConfig || {}), ...secrets.telegramConfig }
        : prev.telegramConfig,
      resendConfig: secrets.resendConfig
        ? { ...(prev.resendConfig || {}), ...secrets.resendConfig }
        : prev.resendConfig,
      posConfig: secrets.posConfig
        ? { ...(prev.posConfig || {}), ...secrets.posConfig }
        : prev.posConfig,
    }));
  }, []);

  const handleAdminLogin = (rememberMe: boolean, password: string, secrets?: AdminSecrets) => {
    dbService.setStoredAdminKey(password, rememberMe);
    applyAdminSecrets(secrets);
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('rvoba_admin_auth', 'true');
      if (rememberMe) {
        localStorage.setItem('rvoba_admin_auth', 'true');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    dbService.clearStoredAdminKey();
    try {
      sessionStorage.removeItem('rvoba_admin_auth');
      localStorage.removeItem('rvoba_admin_auth');
    } catch (e) {
      console.error(e);
    }
    navigateToStore();
  };

  // Store navigation & filtering state (shared between CustomerHeader and CustomerStore)
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeSelectedCategory, setStoreSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('rvoba_favs_v1');
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, boolean>;
        const cleaned: Record<string, boolean> = {};
        Object.entries(parsed).forEach(([k, v]) => {
          if (v && !isLegacyDemoProductId(k)) cleaned[k] = true;
        });
        return cleaned;
      }
      return {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_favs_v1', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const favoritesCount = Object.values(favorites).filter(Boolean).length;

  const handleToggleFavoritesOnly = () => {
    if (currentView !== 'store') {
      navigateToStore();
    }
    setShowFavoritesOnly((prev) => !prev);
    if (!showFavoritesOnly) {
      setStoreSelectedCategory('all');
    }
    setTimeout(() => {
      const el = document.getElementById('katalog-bolumu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectCategory = (cat: string) => {
    setShowFavoritesOnly(false);
    setStoreSelectedCategory(cat);
    if (currentView !== 'store') {
      navigateToStore();
    }
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantity: number,
    roomType: string,
    purchaseType?: 'with_installation' | 'material_only',
    selectedVariant?: ProductVariant
  ) => {
    const unitPrice =
      (purchaseType === 'material_only'
        ? product.materialPrice
        : product.materialPrice + product.workmanshipPrice) +
      (selectedVariant?.priceDifference || 0);
    trackEcommerceEvent('add_to_cart', {
      currency: 'TRY',
      value: unitPrice * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          price: unitPrice,
          quantity,
        },
      ],
    });

    const maxStock =
      typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : undefined;

    setCart((prev) => {
      const idx = prev.findIndex(
        (c) =>
          !c.isCustom &&
          c.productId === product.id &&
          c.roomType === roomType &&
          c.purchaseType === purchaseType &&
          c.selectedVariant?.id === selectedVariant?.id
      );
      if (idx > -1) {
        const copy = [...prev];
        const nextQty = copy[idx].quantity + quantity;
        copy[idx].quantity =
          maxStock !== undefined ? Math.min(maxStock, Math.max(1, nextQty)) : nextQty;
        return copy;
      }
      const clampedQty =
        maxStock !== undefined ? Math.min(maxStock, Math.max(1, quantity)) : quantity;
      if (clampedQty <= 0) return prev;
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          productId: product.id,
          product,
          quantity: clampedQty,
          roomType,
          purchaseType,
          selectedVariant,
        },
      ];
    });
  };

  const handleSetCategoryItem = (category: CategoryKey, product: Product, quantity: number, roomType: string) => {
    setCart((prev) => {
      const withoutCategory = prev.filter((c) => c.isCustom || c.product?.category !== category);
      return [
        ...withoutCategory,
        {
          id: `cart-${category}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          roomType,
        },
      ];
    });
  };

  const handleAddCustomRequest = (custom: CustomRequestItem) => {
    setCart((prev) => [
      ...prev,
      {
        id: `custom-cart-${Date.now()}`,
        quantity: 1,
        roomType: custom.roomType,
        isCustom: true,
        customData: custom,
      },
    ]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c;
          const maxStock =
            typeof c.product?.stockCount === 'number'
              ? Math.max(1, c.product.stockCount)
              : undefined;
          const rawNext = Math.max(1, c.quantity + delta);
          return {
            ...c,
            quantity: maxStock !== undefined ? Math.min(maxStock, rawNext) : rawNext,
          };
        })
        .filter((c) => c.quantity > 0)
    );
  };

  const handleToggleItemPurchaseType = (id: string) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextType = c.purchaseType === 'material_only' ? 'with_installation' : 'material_only';
        return {
          ...c,
          purchaseType: nextType,
          roomType: nextType === 'with_installation' ? 'Malzeme + Usta Montajı' : 'Doğrudan Sipariş',
        };
      })
    );
  };

  const handleClearCart = () => setCart([]);

  const migrationInFlightRef = useRef(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Fetch live catalog & settings from Supabase PostgreSQL (and auto-migrate non-demo admin data once)
  const refreshCatalogFromSupabase = useCallback(async () => {
    let snapshot = await dbService.fetchCatalogAndSettings();
    if (!snapshot) {
      setIsCatalogLoading(false);
      return;
    }

    const currentSettings = settingsRef.current;

    // One-time seamless auto-migration from the admin's existing browser localStorage
    if (!migrationInFlightRef.current && localStorage.getItem('rvoba_supabase_migrated_v1') !== 'true') {
      migrationInFlightRef.current = true;
      try {
        const rawProds = localStorage.getItem('rvoba_products_v1');
        const localRealProducts: Product[] = rawProds
          ? (JSON.parse(rawProds) as Product[]).filter((p) => p && p.id && !isLegacyDemoProductId(p.id))
          : [];

        const rawLeads = localStorage.getItem('rvoba_leads_v1');
        const localRealLeads: LeadRequest[] = rawLeads
          ? (JSON.parse(rawLeads) as LeadRequest[]).filter((l) => l && l.id && l.id !== 'lead-sample-1')
          : [];

        const rawCustomers = localStorage.getItem('rvoba_customers_v1');
        const localRealCustomers: CustomerUser[] = rawCustomers
          ? (JSON.parse(rawCustomers) as CustomerUser[]).filter((u) => u && u.id && u.id !== 'cust-demo-1')
          : [];

        const hasLocalDataToMigrate =
          localRealProducts.length > 0 || localRealLeads.length > 0 || localRealCustomers.length > 0;

        if (hasLocalDataToMigrate) {
          const candidateKeys = Array.from(
            new Set(
              [dbService.getStoredAdminKey(), currentSettings.adminPassword, 'rvoba2026']
                .map((k) => (k || '').trim())
                .filter(Boolean)
            )
          );

          let verifiedKey = '';
          for (const candidate of candidateKeys) {
            const check = await dbService.verifyAdminLogin(candidate);
            if (check.ok) {
              verifiedKey = candidate;
              break;
            }
          }

          if (verifiedKey) {
            if (!snapshot.catalogInitialized) {
              if (localRealProducts.length > 0) {
                await dbService.replaceAllProducts(verifiedKey, localRealProducts);
              }
              await dbService.saveSettings(verifiedKey, currentSettings);
              verifiedKey = dbService.getStoredAdminKey() || currentSettings.adminPassword || verifiedKey;
            }
            if (localRealLeads.length > 0) {
              await dbService.adminBulkUpsertLeads(verifiedKey, localRealLeads);
            }
            if (localRealCustomers.length > 0) {
              await dbService.adminBulkUpsertCustomers(verifiedKey, localRealCustomers);
            }
            localStorage.setItem('rvoba_supabase_migrated_v1', 'true');
            const refreshed = await dbService.fetchCatalogAndSettings();
            if (refreshed) snapshot = refreshed;
          }
        } else if (snapshot.catalogInitialized) {
          localStorage.setItem('rvoba_supabase_migrated_v1', 'true');
        }
      } catch (err) {
        console.warn('Auto-migration warning:', err);
      } finally {
        migrationInFlightRef.current = false;
      }
    }

    setProducts(snapshot.products);
    // Remove deleted products from active cart automatically
    const validIds = new Set(snapshot.products.map((p) => p.id));
    setCart((prev) =>
      prev.filter((item) => item.isCustom || (item.productId && validIds.has(item.productId)))
    );

    if (snapshot.settings) {
      setSettings((prev) => mergePublicSettings(prev, snapshot!.settings));
    }

    setIsCatalogLoading(false);
  }, []);

  // Refresh full Admin CRM data (orders, customers, private secrets, catalog) from Supabase
  const refreshAdminDataFromSupabase = useCallback(async () => {
    const candidateKeys = Array.from(
      new Set(
        [dbService.getStoredAdminKey(), settings.adminPassword, 'rvoba2026']
          .map((k) => (k || '').trim())
          .filter(Boolean)
      )
    );

    let activeKey = '';
    for (const candidate of candidateKeys) {
      const verify = await dbService.verifyAdminLogin(candidate);
      if (verify.ok) {
        activeKey = candidate;
        dbService.setStoredAdminKey(candidate);
        applyAdminSecrets(verify.secrets);
        break;
      }
      if (verify.networkError) {
        return;
      }
    }

    if (!activeKey) {
      // Stored admin session password is out of date (changed on another device)
      setIsAdminAuthenticated(false);
      dbService.clearStoredAdminKey();
      sessionStorage.removeItem('rvoba_admin_auth');
      localStorage.removeItem('rvoba_admin_auth');
      return;
    }

    const [cloudLeads, cloudCustomers, catalogSnap] = await Promise.all([
      dbService.adminListLeads(activeKey),
      dbService.adminListCustomers(activeKey),
      dbService.fetchCatalogAndSettings(),
    ]);

    if (cloudLeads) {
      setLeads(cloudLeads.map(normalizeLeadRecord));
    }
    if (cloudCustomers) {
      setAllUsers(cloudCustomers);
    }
    if (catalogSnap) {
      setProducts(catalogSnap.products);
      if (catalogSnap.settings) {
        setSettings((prev) => mergePublicSettings(prev, catalogSnap.settings));
      }
    }
  }, [settings.adminPassword, applyAdminSecrets]);

  // Initial Supabase load + live Realtime subscription + focus refresh
  useEffect(() => {
    refreshCatalogFromSupabase();

    const unsubscribeRealtime = dbService.subscribeToRealtimeCatalog(() => {
      refreshCatalogFromSupabase();
    });

    const handleWindowFocus = () => {
      refreshCatalogFromSupabase();
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      unsubscribeRealtime();
      window.removeEventListener('focus', handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Admin CRM (orders & customers) synchronized when logged in as admin
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    refreshAdminDataFromSupabase();

    if (currentView !== 'admin') return;
    const interval = window.setInterval(() => {
      refreshAdminDataFromSupabase();
    }, 20000);
    return () => window.clearInterval(interval);
  }, [isAdminAuthenticated, currentView, refreshAdminDataFromSupabase]);

  // Automatically migrate any legacy Base64 product photos to Supabase Storage CDN (.webp)
  const migratedCdnProductIdsRef = useRef<Set<string>>(new Set());
  const cdnMigrationRunningRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAdminAuthenticated || cdnMigrationRunningRef.current || products.length === 0) return;

    const candidates = products.filter(
      (p) =>
        !migratedCdnProductIdsRef.current.has(p.id) &&
        (isBase64DataUrl(p.image) ||
          (Array.isArray(p.images) && p.images.some((img) => isBase64DataUrl(img))) ||
          isBase64DataUrl(p.roomImage) ||
          (Array.isArray(p.variants) && p.variants.some((v) => isBase64DataUrl(v.image))))
    );

    if (candidates.length === 0) return;

    cdnMigrationRunningRef.current = true;
    (async () => {
      try {
        const activeKey = getActiveAdminKey();
        for (const candidate of candidates) {
          migratedCdnProductIdsRef.current.add(candidate.id);
          const { product: migrated, changed } = await migrateProductImagesToCdn(candidate);
          if (changed) {
            setProducts((prev) => {
              const next = prev.map((item) => (item.id === migrated.id ? migrated : item));
              syncToCloudAndTabs({ products: next });
              return next;
            });
            setCart((prev) =>
              prev.map((c) =>
                !c.isCustom && c.productId === migrated.id ? { ...c, product: migrated } : c
              )
            );
            await dbService.upsertProduct(activeKey, migrated);
          }
        }
      } catch (err) {
        console.warn('Automatic Base64 -> CDN WebP migration warning:', err);
      } finally {
        cdnMigrationRunningRef.current = false;
      }
    })();
  }, [isAdminAuthenticated, products, getActiveAdminKey]);

  // Live Cross-Tab Synchronization (same browser instant tab sync)
  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((payload) => {
      if (Array.isArray(payload.products)) {
        setProducts(payload.products.filter((p) => p && p.id && !isLegacyDemoProductId(p.id)));
      }
      if (payload.settings && typeof payload.settings === 'object') {
        setSettings((prev) => mergePublicSettings(prev, payload.settings));
      }
      if (Array.isArray(payload.leads)) {
        setLeads(payload.leads.map(normalizeLeadRecord));
      }
      if (Array.isArray(payload.customers)) {
        setAllUsers(payload.customers);
      }
    });

    return unsubscribe;
  }, []);

  // Admin operations (immediately persisted to Supabase PostgreSQL)
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      syncToCloudAndTabs({ products: next });
      return next;
    });
    setCart((prev) =>
      prev.map((c) => (!c.isCustom && c.productId === updated.id ? { ...c, product: updated } : c))
    );
    dbService.upsertProduct(getActiveAdminKey(), updated).catch((err) => console.warn(err));
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => {
      const next = [newProd, ...prev];
      syncToCloudAndTabs({ products: next });
      return next;
    });
    dbService.upsertProduct(getActiveAdminKey(), newProd).catch((err) => console.warn(err));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      syncToCloudAndTabs({ products: next });
      return next;
    });
    setCart((prev) => prev.filter((c) => c.productId !== productId));
    dbService.deleteProduct(getActiveAdminKey(), productId).catch((err) => console.warn(err));
  };

  const handleClearAllProducts = () => {
    setProducts([]);
    setCart((prev) => prev.filter((c) => c.isCustom));
    localStorage.setItem('rvoba_products_v1', '[]');
    syncToCloudAndTabs({ products: [] });
    dbService.clearAllProducts(getActiveAdminKey()).catch((err) => console.warn(err));
  };

  const handleToggleActive = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const toggledProduct: Product = {
      ...target,
      isActive: target.isActive === false ? true : false,
    };
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? toggledProduct : p));
      syncToCloudAndTabs({ products: next });
      return next;
    });
    dbService.upsertProduct(getActiveAdminKey(), toggledProduct).catch((err) => console.warn(err));
  };

  const handleResetDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    syncToCloudAndTabs({ products: INITIAL_PRODUCTS });
    localStorage.setItem('rvoba_products_v1', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.removeItem('restolab_products_v6');
    localStorage.removeItem('restolab_products_v5');
    dbService.replaceAllProducts(getActiveAdminKey(), INITIAL_PRODUCTS).catch((err) => console.warn(err));
  };

  const handleSaveLead = async (
    newLead: LeadRequest,
    opts?: { alreadySavedInCloud?: boolean }
  ): Promise<{ ok: boolean; lead: LeadRequest; error?: string }> => {
    const enrichedLead: LeadRequest = normalizeLeadRecord({
      ...newLead,
      customerId: newLead.customerId || (currentUser ? currentUser.id : undefined),
    });

    const firePurchaseAnalytics = (leadRecord: LeadRequest) => {
      if (
        leadRecord.leadType === 'web_order' ||
        leadRecord.leadType === 'store_order' ||
        leadRecord.totalAmount > 0
      ) {
        trackEcommerceEvent('purchase', {
          currency: 'TRY',
          transaction_id: leadRecord.orderNumber || leadRecord.id,
          value: leadRecord.totalAmount || 0,
          items: (leadRecord.items || []).map((it, idx) => ({
            item_id: it.productId || `item-${idx}`,
            item_name: it.name,
            item_brand: it.brand,
            price: it.quantity > 0 ? Math.round(it.total / it.quantity) : it.total,
            quantity: it.quantity,
          })),
        });
      }
    };

    if (opts?.alreadySavedInCloud) {
      setLeads((prev) => {
        const next = [enrichedLead, ...prev.filter((l) => l.id !== enrichedLead.id)];
        syncToCloudAndTabs({ leads: next });
        return next;
      });
      firePurchaseAnalytics(enrichedLead);
      refreshCatalogFromSupabase();
      return { ok: true, lead: enrichedLead };
    }

    // Persist order to Supabase PostgreSQL (server verifies prices & deducts stock atomically)
    const res = await dbService.saveLead(enrichedLead, settings);
    if (!res.ok) {
      return res;
    }

    const confirmedLead: LeadRequest = normalizeLeadRecord({
      ...res.lead,
      customerId: res.lead.customerId || enrichedLead.customerId,
    });

    setLeads((prev) => {
      const next = [confirmedLead, ...prev.filter((l) => l.id !== confirmedLead.id)];
      syncToCloudAndTabs({ leads: next });
      return next;
    });

    firePurchaseAnalytics(confirmedLead);
    refreshCatalogFromSupabase();
    return { ok: true, lead: confirmedLead };
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    const prevAdminKey = getActiveAdminKey();
    setSettings(newSettings);
    syncToCloudAndTabs({ settings: newSettings });
    dbService.saveSettings(prevAdminKey, newSettings).catch((err) => console.warn(err));
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadRequest['status'], adminNotes?: string) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === leadId ? { ...l, status, adminNotes: adminNotes !== undefined ? adminNotes : l.adminNotes } : l));
      syncToCloudAndTabs({ leads: next });
      return next;
    });
    dbService.adminUpdateLeadStatus(getActiveAdminKey(), leadId, status, adminNotes).catch((err) => console.warn(err));
  };

  const handleUpdateLeadTracking = (
    leadId: string,
    status: LeadRequest['status'],
    adminNotes?: string,
    trackingCarrier?: string,
    trackingCode?: string
  ) => {
    setLeads((prev) => {
      const next = prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status,
              adminNotes: adminNotes !== undefined ? adminNotes : l.adminNotes,
              trackingCarrier:
                trackingCarrier !== undefined ? trackingCarrier : l.trackingCarrier,
              trackingCode: trackingCode !== undefined ? trackingCode : l.trackingCode,
            }
          : l
      );
      syncToCloudAndTabs({ leads: next });
      return next;
    });
    dbService
      .adminUpdateLeadTracking(
        getActiveAdminKey(),
        leadId,
        status,
        adminNotes,
        trackingCarrier,
        trackingCode
      )
      .then((updated) => {
        if (updated) {
          const normalized = normalizeLeadRecord(updated);
          setLeads((prev) => prev.map((l) => (l.id === leadId ? normalized : l)));
        }
      })
      .catch((err) => console.warn(err));
  };

  const handleResetCustomerPassword = async (
    customerId: string,
    newPasswordPlain: string
  ): Promise<boolean> => {
    return dbService.adminResetCustomerPassword(getActiveAdminKey(), customerId, newPasswordPlain);
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== leadId);
      syncToCloudAndTabs({ leads: next });
      return next;
    });
    dbService.adminDeleteLead(getActiveAdminKey(), leadId).catch((err) => console.warn(err));
  };

  const handleImportFullBackup = (data: {
    products?: Product[];
    settings?: SiteSettings;
    leads?: LeadRequest[];
    customers?: CustomerUser[];
  }) => {
    const adminKey = getActiveAdminKey();
    if (Array.isArray(data.products)) {
      const cleanProds = data.products.filter((p) => p && p.id && !isLegacyDemoProductId(p.id));
      setProducts(cleanProds);
      dbService.replaceAllProducts(adminKey, cleanProds).catch((err) => console.warn(err));
    }
    if (data.settings && typeof data.settings === 'object') {
      setSettings(data.settings);
      dbService.saveSettings(adminKey, data.settings).catch((err) => console.warn(err));
    }
    if (Array.isArray(data.leads)) {
      const cleanLeads = data.leads.map(normalizeLeadRecord);
      setLeads(cleanLeads);
      dbService.adminBulkUpsertLeads(adminKey, cleanLeads).catch((err) => console.warn(err));
    }
    if (Array.isArray(data.customers)) {
      setAllUsers(data.customers);
      dbService.adminBulkUpsertCustomers(adminKey, data.customers).catch((err) => console.warn(err));
    }
    syncToCloudAndTabs(data);
  };

  // Navigations (clean SEO History API URLs with full backward-compatible hash support)
  const navigateToLanding = () => {
    window.history.pushState({}, '', '/tanitim');
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToConfigurator = () => {
    window.history.pushState({}, '', '/teklif');
    setCurrentView('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const isMaterialOnly = item.purchaseType === 'material_only';
    const variantDiff = item.selectedVariant?.priceDifference || 0;
    const line = isMaterialOnly
      ? (item.product.materialPrice + variantDiff) * item.quantity
      : (item.product.materialPrice + item.product.workmanshipPrice + variantDiff) * item.quantity;
    return sum + line;
  }, 0);

  // Calculate dynamic delivery days from cart categories and settings.durationRules
  const dynamicDeliveryDays = (() => {
    const activeCats = Array.from(
      new Set(
        cart
          .filter((c) => !c.isCustom && c.product && c.purchaseType !== 'material_only')
          .map((c) => c.product!.category)
      )
    );
    if (activeCats.length === 0) return { min: 2, max: 4 };
    const baseDaysMap = settings.durationRules?.baseDays || {};
    const daysList = activeCats
      .map((k) => baseDaysMap[k])
      .filter((d): d is number => typeof d === 'number' && d > 0);
    if (daysList.length === 0) return { min: 3, max: 6 };
    let min = Math.max(...daysList);
    let max = Math.round(min * 1.4);
    if (daysList.length > 1) {
      min = Math.min(30, Math.round(min * 1.3));
      max = Math.min(45, Math.round(max * 1.35));
    }
    if (defaultSqM > (settings.durationRules?.sqmThreshold ?? 100)) {
      min += 2;
      max += 3;
    }
    return { min: Math.max(1, min), max: Math.max(2, max) };
  })();

  // If Admin View is active
  if (currentView === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white text-xs font-bold">
              Yönetici Ekranı Yükleniyor...
            </div>
          }
        >
          <AdminLoginScreen
            correctPassword={settings.adminPassword || 'rvoba2026'}
            onLoginSuccess={handleAdminLogin}
            onNavigateHome={navigateToStore}
          />
        </Suspense>
      );
    }

    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC] text-[#0A0A0B] text-xs font-bold">
            RVOBA® Yönetim Paneli Yükleniyor...
          </div>
        }
      >
        <AdminPortal
          categories={CATEGORIES}
          products={products}
          leads={leads}
          settings={settings}
          customers={allUsers}
          onDeleteCustomer={handleDeleteCustomer}
          onResetCustomerPassword={handleResetCustomerPassword}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onClearAllProducts={handleClearAllProducts}
          onToggleActive={handleToggleActive}
          onResetDefaults={handleResetDefaults}
          onUpdateSettings={handleUpdateSettings}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onUpdateLeadTracking={handleUpdateLeadTracking}
          onDeleteLead={handleDeleteLead}
          onNavigateCustomer={navigateToStore}
          onLogout={handleAdminLogout}
          onRefreshCloud={refreshAdminDataFromSupabase}
          onImportFullBackup={handleImportFullBackup}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#0A0A0B] flex flex-col font-sans selection:bg-[#0A0A0B] selection:text-white">
      
      {/* Header */}
      <div className="sticky top-0 z-40 print:hidden">
        <CustomerHeader
          currentView={currentView}
          cart={cart}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthInitialTab('login');
            setIsAuthModalOpen(true);
          }}
          onOpenAccount={() => setIsAccountDrawerOpen(true)}
          onNavigateAdmin={navigateToAdmin}
          onNavigateLanding={navigateToLanding}
          onNavigateConfigurator={navigateToConfigurator}
          onNavigateStore={navigateToStore}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenInspection={() => setIsInspectionOpen(true)}
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          supportPhone={settings.supportPhone}
          phoneNumber={settings.phoneNumber}
          content={settings.content}
          searchQuery={storeSearchQuery}
          onSearchChange={setStoreSearchQuery}
          selectedCategory={storeSelectedCategory}
          onSelectCategory={handleSelectCategory}
          favoritesCount={favoritesCount}
          onToggleFavoritesOnly={handleToggleFavoritesOnly}
          showFavoritesOnly={showFavoritesOnly}
          enableCreditCard={Boolean(settings.paymentMethods?.enableCreditCard)}
        />
      </div>

      {/* Main View Switcher */}
      <main className="flex-1 w-full print:hidden">
        {currentView === 'landing' ? (
          /* ======================================================== */
          /* 1. MÜŞTERİ KARŞILAMA & TANITIM VİTRİNİ SAYFASI           */
          /* ======================================================== */
          <Suspense
            fallback={
              <div className="py-24 text-center text-xs font-bold text-[#64748B]">
                Sayfa Yükleniyor...
              </div>
            }
          >
            <CustomerLandingPage
              onStartConfiguring={navigateToConfigurator}
              onOpenInspection={() => setIsInspectionOpen(true)}
              onNavigateStore={navigateToStore}
              projects={settings.beforeAfterProjects}
              content={settings.content}
            />
          </Suspense>
        ) : currentView === 'store' ? (
          /* ======================================================== */
          /* 2. MİMARİ ÜRÜN & MALZEME MAĞAZASI (STORE)                */
          /* ======================================================== */
          <CustomerStore
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigateConfigurator={navigateToConfigurator}
            onOpenInspection={() => setIsInspectionOpen(true)}
            onSaveLead={handleSaveLead}
            phoneNumber={settings.phoneNumber}
            supportPhone={settings.supportPhone}
            content={settings.content}
            selectedCategory={storeSelectedCategory}
            onSelectCategory={handleSelectCategory}
            searchQuery={storeSearchQuery}
            onSearchChange={setStoreSearchQuery}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={handleToggleFavoritesOnly}
            freeShippingThreshold={settings.freeShippingThreshold}
            enableCreditCard={Boolean(settings.paymentMethods?.enableCreditCard)}
            isLoading={isCatalogLoading}
          />
        ) : (
          /* ======================================================== */
          /* 3. TADİLAT & USTA DESTEĞİ HESAPLAYICI EKRANI              */
          /* ======================================================== */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Top Back bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-4 border-b border-[#E8EAED]">
              <button
                onClick={navigateToStore}
                className="btn-pill-outline text-xs py-2 px-4 flex items-center gap-2 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ürün Mağazasına Dön</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0A0A0B]">
                <Hammer className="w-4 h-4 text-amber-600" />
                <span>RVOBA Tadilat & Usta Desteği Hesaplayıcı (Malzemeli veya Sadece Usta İşçiliği)</span>
              </div>

              <button
                onClick={() => setIsInspectionOpen(true)}
                className="btn-pill-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Doğrudan Usta / Keşif Çağır</span>
              </button>
            </div>

            <Suspense
              fallback={
                <div className="py-24 text-center text-xs font-bold text-[#64748B]">
                  Hesaplayıcı Yükleniyor...
                </div>
              }
            >
              <CustomerConfigurator
                categories={CATEGORIES}
                products={products}
                cart={cart}
                settings={settings}
                onAddToCart={handleAddToCart}
                onSetCategoryItem={handleSetCategoryItem}
                onAddCustomRequest={handleAddCustomRequest}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenInspection={() => setIsInspectionOpen(true)}
                onOpenProforma={() => setIsProformaOpen(true)}
                onOpenCallback={() => setIsCallbackOpen(true)}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                activeRoom={activeRoom}
                setActiveRoom={setActiveRoom}
                defaultSqM={defaultSqM}
                setDefaultSqM={setDefaultSqM}
                phoneNumber={settings.phoneNumber}
                onNavigateStore={navigateToStore}
              />
            </Suspense>
          </div>
        )}
      </main>

      {/* Trust & Guarantee Section (Yalnızca Tadilat Teklif ve Tanıtım Sayfasında Görünür; Mağazada E-Ticaret Güvenceleri Yer Alır) */}
      {currentView !== 'store' && (
        <div className="print:hidden">
          <CustomerTrustSection content={settings.content} />
        </div>
      )}

      {/* Footer */}
      <div className="print:hidden">
        <CustomerFooter
          onNavigateAdmin={navigateToAdmin}
          onNavigateStore={navigateToStore}
          onNavigateConfigurator={navigateToConfigurator}
          onOpenLegal={(tab) => setLegalModalTab(tab)}
          settings={settings}
        />
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-5 left-4 right-4 max-w-xl mx-auto z-40 print:hidden">
          <div className="p-3.5 sm:p-4 rounded-full bg-[#0A0A0B] text-white shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#0A0A0B] flex items-center justify-center font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">
                  {cart.length} {currentView === 'store' ? 'Ürün Seçildi' : 'Seçili Kalem'}
                </div>
                <div className="text-sm font-extrabold font-mono text-white">
                  {cartTotal.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentView === 'configurator' && (
                <button
                  onClick={() => setIsInspectionOpen(true)}
                  className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition text-slate-200"
                >
                  Ücretsiz Keşif
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="btn-pill-black bg-white text-[#0A0A0B] hover:bg-slate-200 text-xs py-2 px-4 shadow-sm"
              >
                <span>Sepeti Gör</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CustomerCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleItemPurchaseType={handleToggleItemPurchaseType}
        onClearCart={handleClearCart}
        onOpenInspection={() => setIsInspectionOpen(true)}
        onOpenProforma={() => setIsProformaOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
        phoneNumber={settings.phoneNumber}
        selectedCity={selectedCity}
        selectedDistrict={selectedDistrict}
        estimatedDays={dynamicDeliveryDays}
        kdvNotice={settings.kdvNotice}
        freeShippingThreshold={settings.freeShippingThreshold}
        standardShippingCost={settings.standardShippingCost}
        mode={currentView === 'configurator' ? 'configurator' : 'store'}
      />

      {/* Lazy-Loaded Modals & Drawers (fetched on demand when opened) */}
      <Suspense fallback={null}>
        {isCheckoutOpen && (
          <CustomerCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            currentUser={currentUser}
            onOrderCompleted={async (order, opts) => {
              const res = await handleSaveLead(order, opts);
              if (res.ok) {
                handleClearCart();
              }
              return res;
            }}
            phoneNumber={settings.phoneNumber}
            supportPhone={settings.supportPhone}
            settings={settings}
          />
        )}

        {isInspectionOpen && (
          <CustomerInspectionModal
            isOpen={isInspectionOpen}
            onClose={() => setIsInspectionOpen(false)}
            cart={cart}
            currentUser={currentUser}
            onSaveLead={handleSaveLead}
            phoneNumber={settings.phoneNumber}
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            serviceAreas={settings.serviceAreas}
          />
        )}

        {isProformaOpen && (
          <CustomerProformaModal
            isOpen={isProformaOpen}
            onClose={() => setIsProformaOpen(false)}
            cart={cart}
            settings={settings}
            city={selectedCity}
            district={selectedDistrict}
            deliveryDays={dynamicDeliveryDays}
          />
        )}

        {isCallbackOpen && (
          <CustomerCallbackModal
            isOpen={isCallbackOpen}
            onClose={() => setIsCallbackOpen(false)}
            cart={cart}
            activeRoom={activeRoom}
            defaultSqM={defaultSqM}
            onSaveLead={handleSaveLead}
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
          />
        )}

        {legalModalTab !== null && (
          <CustomerLegalModal
            isOpen={legalModalTab !== null}
            onClose={() => setLegalModalTab(null)}
            defaultTab={legalModalTab || 'sozlesme'}
            companyName={settings.companyName}
            supportPhone={settings.supportPhone}
            settings={settings}
          />
        )}

        {isAuthModalOpen && (
          <CustomerAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            users={allUsers}
            onRegisterUser={handleRegisterUser}
            serviceAreas={settings.serviceAreas}
            initialTab={authInitialTab}
            phoneNumber={settings.phoneNumber}
          />
        )}

        {currentUser && isAccountDrawerOpen && (
          <CustomerAccountDrawer
            isOpen={isAccountDrawerOpen}
            onClose={() => setIsAccountDrawerOpen(false)}
            user={currentUser}
            leads={leads}
            onLogout={handleCustomerLogout}
            onUpdateUser={handleUpdateUser}
            onNavigateStore={() => {
              setIsAccountDrawerOpen(false);
              navigateToStore();
            }}
            onNavigateConfigurator={() => {
              setIsAccountDrawerOpen(false);
              navigateToConfigurator();
            }}
          />
        )}

        {isOrderLookupOpen && (
          <CustomerOrderLookupModal
            isOpen={isOrderLookupOpen}
            onClose={() => setIsOrderLookupOpen(false)}
            leads={leads}
            phoneNumber={settings.phoneNumber}
            supportPhone={settings.supportPhone}
          />
        )}
      </Suspense>

    </div>
  );
};
