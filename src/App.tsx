import React, { useState, useEffect } from 'react';
import { CustomerHeader } from './components/CustomerHeader';
import { CustomerLandingPage } from './components/CustomerLandingPage';
import { CustomerConfigurator } from './components/CustomerConfigurator';
import { CustomerStore } from './components/CustomerStore';
import { CustomerCartDrawer } from './components/CustomerCartDrawer';
import { CustomerCheckoutModal } from './components/CustomerCheckoutModal';
import { CustomerInspectionModal } from './components/CustomerInspectionModal';
import { CustomerProformaModal } from './components/CustomerProformaModal';
import { CustomerCallbackModal } from './components/CustomerCallbackModal';
import { CustomerTrustSection } from './components/CustomerTrustSection';
import { CustomerFooter } from './components/CustomerFooter';
import { CustomerLegalModal, LegalTabKey } from './components/CustomerLegalModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAccountDrawer } from './components/CustomerAccountDrawer';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginScreen } from './components/AdminLoginScreen';

import { CATEGORIES, INITIAL_PRODUCTS } from './data/initialProducts';
import { INITIAL_SETTINGS } from './data/initialSettings';
import { CartItem, Product, LeadRequest, CustomRequestItem, CategoryKey, SiteSettings, CustomerUser } from './types';
import { ShoppingBag, ArrowUpRight, ArrowLeft, Hammer, Calendar } from 'lucide-react';
import { syncToCloudAndTabs, fetchFromCloud, subscribeToLiveSync } from './utils/cloudSync';

export const App: React.FC = () => {
  // Navigation view: 'store' (Satış Vitrini & E-Ticaret) | 'configurator' (Komple Tadilat Teklifi) | 'landing' (Kurumsal Tanıtım) | 'admin' (Yönetici)
  const [currentView, setCurrentView] = useState<'landing' | 'configurator' | 'store' | 'admin'>(() => {
    if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) return 'admin';
    if (window.location.hash === '#hesapla' || window.location.hash === '#teklif') return 'configurator';
    if (window.location.hash === '#tanitim') return 'landing';
    return 'store';
  });

  // Synchronize hash changes
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
        setCurrentView('admin');
      } else if (window.location.hash === '#hesapla' || window.location.hash === '#teklif') {
        setCurrentView('configurator');
      } else if (window.location.hash === '#tanitim') {
        setCurrentView('landing');
      } else {
        setCurrentView('store');
      }
    };
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  // Products state with localStorage persistence (strictly respects admin deletions & edits)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_products_v1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_products_v1', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Cart state with localStorage persistence (starts clean with 0 items)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_cart_v1');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        // Clean out any legacy sample items if present
        return parsed.filter((item) => item.id !== 'sample-1' && item.id !== 'sample-2');
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
          return parsed.filter((l) => l.id !== 'lead-sample-1');
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
        // Sync "12 Taksit" texts when Credit Card POS is disabled
        const isCreditCardEnabled = parsed.paymentMethods?.enableCreditCard ?? INITIAL_SETTINGS.paymentMethods?.enableCreditCard;
        if (!isCreditCardEnabled) {
          if (mergedContent.announcementText2 && mergedContent.announcementText2.includes('12 Taksit')) {
            mergedContent.announcementText2 = INITIAL_SETTINGS.content?.announcementText2 || '%3 Havale İndirimi & Kapıda Ödeme İmkanı';
          }
          if (mergedContent.storePerk2 && mergedContent.storePerk2.includes('12 Taksit')) {
            mergedContent.storePerk2 = INITIAL_SETTINGS.content?.storePerk2 || '%3 Havale İndirimi & Kapıda Ödeme';
          }
        }
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
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

  // Customer room & sqM state
  const [activeRoom, setActiveRoom] = useState<string>('2+1 Komple Ev');
  const [defaultSqM, setDefaultSqM] = useState<number>(85);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isProformaOpen, setIsProformaOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
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
  };

  const handleCustomerLogout = () => {
    setCurrentUser(null);
    setIsAccountDrawerOpen(false);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setAllUsers(prev => {
      const next = prev.filter(u => u.id !== customerId);
      syncToCloudAndTabs({ customers: next });
      return next;
    });
    if (currentUser && currentUser.id === customerId) {
      setCurrentUser(null);
      setIsAccountDrawerOpen(false);
    }
  };

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('rvoba_admin_auth') === 'true' || localStorage.getItem('rvoba_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const handleAdminLogin = (rememberMe: boolean) => {
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
      return saved ? JSON.parse(saved) : {};
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
    purchaseType?: 'with_installation' | 'material_only'
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => !c.isCustom && c.productId === product.id && c.roomType === roomType && c.purchaseType === purchaseType
      );
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += quantity;
        return copy;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          productId: product.id,
          product,
          quantity,
          roomType,
          purchaseType,
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
        .map((c) => (c.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c))
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

  // Live Cross-Tab & Cloud Synchronization
  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((payload) => {
      if (Array.isArray(payload.products)) {
        setProducts(payload.products);
      }
      if (payload.settings && typeof payload.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...payload.settings }));
      }
      if (Array.isArray(payload.leads)) {
        setLeads(payload.leads);
      }
      if (Array.isArray(payload.customers)) {
        setAllUsers(payload.customers);
      }
    });

    return unsubscribe;
  }, []);

  // Admin operations
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      syncToCloudAndTabs({ products: next });
      return next;
    });
    setCart((prev) =>
      prev.map((c) => (!c.isCustom && c.productId === updated.id ? { ...c, product: updated } : c))
    );
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => {
      const next = [newProd, ...prev];
      syncToCloudAndTabs({ products: next });
      return next;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      syncToCloudAndTabs({ products: next });
      return next;
    });
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const handleClearAllProducts = () => {
    setProducts([]);
    setCart((prev) => prev.filter((c) => c.isCustom));
    localStorage.setItem('rvoba_products_v1', '[]');
    syncToCloudAndTabs({ products: [] });
  };

  const handleToggleActive = (productId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, isActive: p.isActive === false ? true : false } : p));
      syncToCloudAndTabs({ products: next });
      return next;
    });
  };

  const handleResetDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    syncToCloudAndTabs({ products: INITIAL_PRODUCTS });
    localStorage.removeItem('rvoba_products_v1');
    localStorage.removeItem('restolab_products_v6');
    localStorage.removeItem('restolab_products_v5');
  };

  const handleSaveLead = (newLead: LeadRequest) => {
    const enrichedLead: LeadRequest = {
      ...newLead,
      customerId: newLead.customerId || (currentUser ? currentUser.id : undefined),
    };
    setLeads((prev) => {
      const next = [enrichedLead, ...prev];
      syncToCloudAndTabs({ leads: next });
      return next;
    });
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    syncToCloudAndTabs({ settings: newSettings });
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadRequest['status'], adminNotes?: string) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === leadId ? { ...l, status, adminNotes: adminNotes !== undefined ? adminNotes : l.adminNotes } : l));
      syncToCloudAndTabs({ leads: next });
      return next;
    });
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== leadId);
      syncToCloudAndTabs({ leads: next });
      return next;
    });
  };

  const handleImportFullBackup = (data: {
    products?: Product[];
    settings?: SiteSettings;
    leads?: LeadRequest[];
    customers?: CustomerUser[];
  }) => {
    if (Array.isArray(data.products)) {
      setProducts(data.products);
    }
    if (data.settings && typeof data.settings === 'object') {
      setSettings(data.settings);
    }
    if (Array.isArray(data.leads)) {
      setLeads(data.leads);
    }
    if (Array.isArray(data.customers)) {
      setAllUsers(data.customers);
    }
    syncToCloudAndTabs(data);
  };

  // Navigations
  const navigateToLanding = () => {
    window.location.hash = '#tanitim';
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToConfigurator = () => {
    window.location.hash = '#teklif';
    setCurrentView('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    window.location.hash = '';
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const isMaterialOnly = item.purchaseType === 'material_only';
    const line = isMaterialOnly
      ? item.product.materialPrice * item.quantity
      : (item.product.materialPrice + item.product.workmanshipPrice) * item.quantity;
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
        <AdminLoginScreen
          correctPassword={settings.adminPassword || 'rvoba2026'}
          onLoginSuccess={handleAdminLogin}
          onNavigateHome={navigateToStore}
        />
      );
    }

    return (
      <AdminPortal
        categories={CATEGORIES}
        products={products}
        leads={leads}
        settings={settings}
        customers={allUsers}
        onDeleteCustomer={handleDeleteCustomer}
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onClearAllProducts={handleClearAllProducts}
        onToggleActive={handleToggleActive}
        onResetDefaults={handleResetDefaults}
        onUpdateSettings={handleUpdateSettings}
        onUpdateLeadStatus={handleUpdateLeadStatus}
        onDeleteLead={handleDeleteLead}
        onNavigateCustomer={navigateToStore}
        onLogout={handleAdminLogout}
        onImportFullBackup={handleImportFullBackup}
      />
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
        />
      </div>

      {/* Main View Switcher */}
      <main className="flex-1 w-full print:hidden">
        {currentView === 'landing' ? (
          /* ======================================================== */
          /* 1. MÜŞTERİ KARŞILAMA & TANITIM VİTRİNİ SAYFASI           */
          /* ======================================================== */
          <CustomerLandingPage
            onStartConfiguring={navigateToConfigurator}
            onOpenInspection={() => setIsInspectionOpen(true)}
            onNavigateStore={navigateToStore}
            projects={settings.beforeAfterProjects}
            content={settings.content}
          />
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

      {/* Direct Online Checkout Modal */}
      <CustomerCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onOrderCompleted={(order) => {
          handleSaveLead(order);
          handleClearCart();
        }}
        phoneNumber={settings.phoneNumber}
        supportPhone={settings.supportPhone}
        settings={settings}
      />

      {/* Free Discovery Modal */}
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

      {/* Proforma PDF Modal */}
      <CustomerProformaModal
        isOpen={isProformaOpen}
        onClose={() => setIsProformaOpen(false)}
        cart={cart}
        settings={settings}
        city={selectedCity}
        district={selectedDistrict}
        deliveryDays={dynamicDeliveryDays}
      />

      {/* Mimar Beni Arasın Modal */}
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

      {/* Legal & Compliance Modal (Sanal POS & ETBİS Zorunluluğu) */}
      <CustomerLegalModal
        isOpen={legalModalTab !== null}
        onClose={() => setLegalModalTab(null)}
        defaultTab={legalModalTab || 'sozlesme'}
        companyName={settings.companyName}
        supportPhone={settings.supportPhone}
        settings={settings}
      />

      {/* Customer Authentication Modal (Giriş Yap / Üye Ol / Şifremi Unuttum) */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        users={allUsers}
        onRegisterUser={handleRegisterUser}
        serviceAreas={settings.serviceAreas}
        initialTab={authInitialTab}
      />

      {/* Customer Account & Orders Drawer (Hesabım & Siparişlerim) */}
      {currentUser && (
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

    </div>
  );
};
