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
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginScreen } from './components/AdminLoginScreen';

import { CATEGORIES, INITIAL_PRODUCTS } from './data/initialProducts';
import { INITIAL_SETTINGS } from './data/initialSettings';
import { CartItem, Product, LeadRequest, CustomRequestItem, CategoryKey, SiteSettings } from './types';
import { ShoppingBag, ArrowUpRight, ArrowLeft } from 'lucide-react';

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

  // Products state with localStorage persistence & auto-sync with initial catalog
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_products_v1') || localStorage.getItem('restolab_products_v6');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const parsedMap = new Map(parsed.map((p) => [p.id, p]));
        
        // Merge initial products: retain customizations but guarantee new products and store flags
        const merged = INITIAL_PRODUCTS.map((initProd) => {
          const existing = parsedMap.get(initProd.id);
          if (!existing) return initProd;
          return {
            ...initProd,
            ...existing,
            isStoreProduct: existing.isStoreProduct ?? initProd.isStoreProduct,
            specs: existing.specs && existing.specs.length > 0 ? existing.specs : initProd.specs,
          };
        });

        // Also preserve any custom products created via Admin Portal
        const initialIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
        const customProds = parsed.filter((p) => !initialIds.has(p.id));
        return [...merged, ...customProds];
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

  // Cart state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_cart_v1') || localStorage.getItem('restolab_cart_v5');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'sample-1',
        productId: 'filli-aydan',
        product: INITIAL_PRODUCTS[0],
        quantity: 200,
        roomType: 'Komple Ev Duvarları',
      },
      {
        id: 'sample-2',
        productId: 'yildiz-vario-lizbon',
        product: INITIAL_PRODUCTS[7],
        quantity: 65,
        roomType: 'Salon ve Odalar',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_cart_v1', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Leads state
  const [leads, setLeads] = useState<LeadRequest[]>(() => {
    try {
      const saved = localStorage.getItem('rvoba_leads_v1') || localStorage.getItem('restolab_leads_v5');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'lead-sample-1',
        fullName: 'Mehmet Demir',
        phone: '0532 111 22 33',
        city: 'İstanbul',
        district: 'Kadıköy',
        address: 'Moda Cad. No: 14',
        preferredDate: '2026-09-28',
        timeSlot: '13:00 - 17:00',
        totalAmount: 70500,
        marketTotalAmount: 92250,
        savingsAmount: 21750,
        items: [
          { name: 'Momento Silan — Aydan Rengi', brand: 'Filli Boya', quantity: 200, unit: 'm²', total: 38000 },
          { name: 'VarioClic Premium — Lizbon Meşe', brand: 'Yıldız Parke', quantity: 65, unit: 'm²', total: 32500 },
          { 
            name: 'Salon TV Arkası Ahşap Çıtalama', 
            brand: 'Özel İstek', 
            quantity: 1, 
            unit: 'adet', 
            total: 0,
            isCustom: true,
            customNote: 'Pinterest görselindeki gibi simetrik çıta uygulaması yapılacak.'
          },
        ],
        createdAt: new Date().toISOString(),
      },
    ];
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
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          content: {
            ...INITIAL_SETTINGS.content,
            ...(parsed.content || {}),
          },
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

  const handleClearCart = () => setCart([]);

  // Admin operations
  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCart((prev) =>
      prev.map((c) => (!c.isCustom && c.productId === updated.id ? { ...c, product: updated } : c))
    );
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const handleToggleActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: p.isActive === false ? true : false } : p))
    );
  };

  const handleResetDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('rvoba_products_v1');
    localStorage.removeItem('restolab_products_v6');
    localStorage.removeItem('restolab_products_v5');
  };

  const handleSaveLead = (newLead: LeadRequest) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadRequest['status'], adminNotes?: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, adminNotes: adminNotes !== undefined ? adminNotes : l.adminNotes } : l))
    );
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
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
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleActive={handleToggleActive}
        onResetDefaults={handleResetDefaults}
        onUpdateSettings={handleUpdateSettings}
        onUpdateLeadStatus={handleUpdateLeadStatus}
        onDeleteLead={handleDeleteLead}
        onNavigateCustomer={navigateToStore}
        onLogout={handleAdminLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#0A0A0B] flex flex-col font-sans selection:bg-[#0A0A0B] selection:text-white">
      
      {/* Header */}
      <CustomerHeader
        currentView={currentView}
        cart={cart}
        onNavigateLanding={navigateToLanding}
        onNavigateConfigurator={navigateToConfigurator}
        onNavigateStore={navigateToStore}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInspection={() => setIsInspectionOpen(true)}
        supportPhone={settings.supportPhone}
        phoneNumber={settings.phoneNumber}
        content={settings.content}
      />

      {/* Main View Switcher */}
      <main className="flex-1 w-full">
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
            onSaveLead={handleSaveLead}
            phoneNumber={settings.phoneNumber}
            supportPhone={settings.supportPhone}
            content={settings.content}
          />
        ) : (
          /* ======================================================== */
          /* 3. FİYAT AL & 6 ADIMLI DETAY BELİRLEME EKRANI             */
          /* ======================================================== */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Top Back bar */}
            <div className="flex items-center justify-between pb-6 mb-4 border-b border-[#E8EAED]">
              <button
                onClick={navigateToLanding}
                className="btn-pill-outline text-xs py-2 px-4 flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tanıtım Sayfasına Dön</span>
              </button>

              <div className="text-xs text-[#64748B]">
                RVOBA Fiyat & Tasarım Sihirbazı
              </div>
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
      {currentView !== 'store' && <CustomerTrustSection content={settings.content} />}

      {/* Footer */}
      <CustomerFooter
        onNavigateAdmin={navigateToAdmin}
        onNavigateStore={navigateToStore}
        onNavigateConfigurator={navigateToConfigurator}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
        settings={settings}
      />

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-5 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="p-3.5 sm:p-4 rounded-full bg-[#0A0A0B] text-white shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#0A0A0B] flex items-center justify-center font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-300">
                  {cart.length} Kalem • {cart.some(c => !c.isCustom && c.purchaseType !== 'material_only') ? 'Malzeme + İşçilik' : 'Toptan Bayi Ürünleri'}
                </div>
                <div className="text-sm font-extrabold font-mono text-white">
                  {cartTotal.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsInspectionOpen(true)}
                className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition text-slate-200"
              >
                Ücretsiz Keşif
              </button>
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
        onClearCart={handleClearCart}
        onOpenInspection={() => setIsInspectionOpen(true)}
        onOpenProforma={() => setIsProformaOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenLegal={(tab) => setLegalModalTab(tab)}
        phoneNumber={settings.phoneNumber}
        selectedCity={selectedCity}
        selectedDistrict={selectedDistrict}
        estimatedDays={{ min: 10, max: 14 }}
        kdvNotice={settings.kdvNotice}
      />

      {/* Direct Online Checkout Modal */}
      <CustomerCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderCompleted={(order) => {
          handleSaveLead(order);
          handleClearCart();
        }}
        phoneNumber={settings.phoneNumber}
        supportPhone={settings.supportPhone}
      />

      {/* Free Discovery Modal */}
      <CustomerInspectionModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        cart={cart}
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
        deliveryDays={{ min: 10, max: 14 }}
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
      />

    </div>
  );
};
