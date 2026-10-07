import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ArrowUpRight, 
  Check, 
  Sparkles, 
  TrendingDown, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Eye, 
  Send,
  X,
  Phone,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Heart,
  Star,
  Zap,
  MessageCircle,
  CreditCard,
  RotateCcw,
  Percent
} from 'lucide-react';
import { Product, CartItem, LeadRequest } from '../types';

interface CustomerStoreProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, quantity: number, roomType: string, purchaseType?: 'with_installation' | 'material_only') => void;
  onOpenCart: () => void;
  phoneNumber?: string;
  supportPhone?: string;
  onNavigateConfigurator?: () => void;
  onSaveLead?: (lead: LeadRequest) => void;
}

// Category visual metadata with high-res architectural photos
const CATEGORY_SHOWCASE = [
  {
    key: 'all',
    label: 'Tüm Koleksiyon',
    badge: 'Tüm Ürünler',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80',
    desc: 'Bütün mimari seçki',
  },
  {
    key: 'ozel',
    label: 'Akustik Ahşap Panel',
    badge: 'En Çok Satan',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    desc: 'Doğal Meşe TV Panelleri',
  },
  {
    key: 'alci_tavan',
    label: 'Duvar Çıtaları',
    badge: 'Trend Tasarım',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    desc: 'Hazır Kesim Polimer Çıta',
  },
  {
    key: 'mutfak_banyo',
    label: 'Banyo & Batarya',
    badge: '5 Yıl Garanti',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    desc: 'VitrA PVD & Çanak Lavabo',
  },
  {
    key: 'boya',
    label: 'Boya & Astar',
    badge: 'Fabrika Kovası',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
    desc: 'Filli Boya Momento Silan',
  },
  {
    key: 'parke',
    label: 'Zemin & Parke',
    badge: '32. Sınıf AC4',
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80',
    desc: 'VarioClic Derzli Zemin',
  },
  {
    key: 'elektrik',
    label: 'LED & Elektrik',
    badge: 'Samsung Çipli',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=400&q=80',
    desc: 'Gizli Işık & Şalt Malzeme',
  },
];

export const CustomerStore: React.FC<CustomerStoreProps> = ({
  products,
  cart,
  onAddToCart,
  onOpenCart,
  phoneNumber = '905550000000',
  supportPhone = '0850 123 45 67',
  onNavigateConfigurator,
  onSaveLead,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'discount'>('featured');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('rvoba_favs_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [cardPurchaseTypes, setCardPurchaseTypes] = useState<Record<string, 'material_only' | 'with_installation'>>({});

  useEffect(() => {
    try {
      localStorage.setItem('rvoba_favs_v1', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPurchaseType = (id: string) => cardPurchaseTypes[id] || 'material_only';
  const setPurchaseType = (id: string, type: 'material_only' | 'with_installation') => {
    setCardPurchaseTypes((prev) => ({ ...prev, [id]: type }));
  };

  // Filter store products (products marked as isStoreProduct, or fallback to active items)
  const hasStoreProducts = products.some((p) => p.isStoreProduct && p.isActive !== false);
  const storeItems = products.filter((p) => {
    if (p.isActive === false) return false;
    if (hasStoreProducts) return p.isStoreProduct === true;
    return true;
  });

  const filteredProducts = storeItems
    .filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.materialPrice - b.materialPrice;
      if (sortBy === 'price_desc') return b.materialPrice - a.materialPrice;
      if (sortBy === 'discount') {
        const discA = a.marketPrice ? (a.marketPrice - a.materialPrice) / a.marketPrice : 0;
        const discB = b.marketPrice ? (b.marketPrice - b.materialPrice) / b.marketPrice : 0;
        return discB - discA;
      }
      return 0; // default featured
    });

  const getQty = (id: string) => selectedQuantities[id] || 1;
  const setQty = (id: string, val: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, val),
    }));
  };

  const handleAddProduct = (product: Product, purchaseType: 'material_only' | 'with_installation') => {
    const qty = getQty(product.id);
    onAddToCart(product, qty, 'Doğrudan Sipariş', purchaseType);
    
    // Tactile button feedback
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  const handleFastWhatsAppOrder = (product: Product) => {
    const qty = getQty(product.id);
    const purchaseType = getPurchaseType(product.id);
    const isInstalled = purchaseType === 'with_installation';
    const unitPrice = isInstalled 
      ? (product.materialPrice + product.workmanshipPrice) 
      : product.materialPrice;
    const price = unitPrice * qty;

    // Log lead to CRM
    onSaveLead?.({
      id: `store-order-${Date.now()}`,
      fullName: 'WhatsApp Mağaza Müşterisi',
      phone: 'WhatsApp Görüşmesi',
      city: 'Belirtilecek',
      district: 'Belirtilecek',
      totalAmount: price,
      marketTotalAmount: (product.marketPrice || Math.round(product.materialPrice * 1.4)) * qty,
      savingsAmount: Math.max(0, ((product.marketPrice || Math.round(product.materialPrice * 1.4)) * qty) - price),
      status: 'bekliyor',
      leadType: 'store_order',
      items: [
        {
          name: product.name,
          brand: product.brand,
          quantity: qty,
          unit: product.unit,
          total: price,
          purchaseType,
        },
      ],
      createdAt: new Date().toISOString(),
    });

    const msg = `*RVOBA® — Hızlı Ürün Siparişi (rvoba.com)*\n\n` +
      `📦 *Ürün:* ${product.brand} - ${product.name}\n` +
      `🏷️ *Ürün Kodu:* ${product.code}\n` +
      `🔢 *Miktar:* ${qty} ${product.unit}\n` +
      `🛠️ *Hizmet Tipi:* ${isInstalled ? 'Malzeme + Uzman Montaj Dahil' : 'Sadece Malzeme (Kargo ile Kapıya Teslim)'}\n` +
      `💰 *Tutar:* ${price.toLocaleString('tr-TR')} ₺ (KDV Dahil Net Fiyat)\n\n` +
      `Bu ürünü toptan bayi avantajıyla doğrudan sipariş vermek ve teslimat/kargo detaylarını netleştirmek istiyorum.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Cart calculations for mobile floating bar
  const totalCartCount = cart.length;
  const totalCartPrice = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const isMaterialOnly = item.purchaseType === 'material_only';
    const line = isMaterialOnly 
      ? item.product.materialPrice * item.quantity 
      : (item.product.materialPrice + item.product.workmanshipPrice) * item.quantity;
    return sum + line;
  }, 0);

  const scrollToCatalog = (catKey?: string) => {
    if (catKey) setSelectedCategory(catKey);
    const el = document.getElementById('katalog-bolumu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-32">

      {/* ======================================================== */}
      {/* 1. COMPACT RETAIL HERO SPOTLIGHT                         */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[#E8EAED] bg-white">
        <div className="absolute inset-0 halftone-texture opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0A0A0B] text-white text-[11px] font-semibold mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>RVOBA® 2026 MİMARİ ÜRÜN & MALZEME KOLEKSİYONU</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-[#0A0A0B] leading-tight">
                Evinizin Havasını Değiştiren Tasarım Malzemeleri.
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Trend akustik ahşap TV panelleri, poliüretan duvar çıtaları, 1. sınıf boyalar ve zemin çözümleri doğrudan üretici bayi fiyatıyla kapınıza teslim. İster sadece malzemeyi alın, ister usta montaj hizmetimizi ekleyin.
              </p>

              {/* Quick Perks Strip */}
              <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>3.000 ₺ Üzeri Ücretsiz Kargo</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>12 Taksit İmkanı</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  <span>İsteğe Bağlı Montaj (İst, Ank, İzm)</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => scrollToCatalog()}
                  className="btn-pill-black text-xs py-2.5 px-5 font-bold shadow-md flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ürünleri İncele</span>
                </button>

                {onNavigateConfigurator && (
                  <button
                    onClick={onNavigateConfigurator}
                    className="btn-pill-outline text-xs py-2.5 px-4 font-semibold flex items-center gap-2 hover:bg-slate-100 border-slate-300"
                  >
                    <span>🏡 Komple Ev Tadilatı Teklifi</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Spotlight Highlight Card */}
            <div className="w-full lg:w-96 shrink-0">
              <div 
                onClick={() => scrollToCatalog('ozel')}
                className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#18181B] to-[#0A0A0B] text-white p-6 shadow-xl border border-white/10 cursor-pointer transform hover:-translate-y-1 transition duration-300"
              >
                <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  🔥 Haftanın Yıldızı
                </div>

                <div className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  RVOBA Atelier Özel Tasarım
                </div>

                <h3 className="text-lg font-bold text-white mt-1 group-hover:text-emerald-400 transition">
                  Akustik Ahşap TV Arkası Çıta Paneli
                </h3>

                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  Doğal meşe kaplama çıtalar, ses yutan yüksek yoğunluklu siyah akustik keçe.
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through">4.200 ₺</span>
                    <div className="text-xl font-mono font-black text-white">
                      2.450 ₺ <span className="text-xs font-normal text-slate-300">/ adet</span>
                    </div>
                  </div>

                  <span className="btn-pill-black bg-white text-black group-hover:bg-emerald-400 group-hover:text-black text-xs py-2 px-3 font-bold transition flex items-center gap-1">
                    <span>İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. VISUAL CATEGORY SHOWCASE STRIP (PHOTO CARDS)          */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#0A0A0B] uppercase tracking-wider">
              Kategorilere Göz Atın
            </h2>
            <p className="text-xs text-[#64748B]">Trend mimari dokuları mekanınıza göre keşfedin</p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Filtreyi Temizle
            </button>
          )}
        </div>

        {/* Visual Cards Row (Horizontal Scrollable) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORY_SHOWCASE.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => scrollToCatalog(cat.key)}
                className={`group relative rounded-2xl overflow-hidden p-2 text-left border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-black bg-black text-white shadow-md ring-2 ring-black/20'
                    : 'border-[#E8EAED] bg-white text-[#0A0A0B] hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-100">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${
                    isSelected ? 'bg-white text-black' : 'bg-black/75 backdrop-blur-sm text-white'
                  }`}>
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold line-clamp-1 leading-snug">
                    {cat.label}
                  </h4>
                  <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-slate-300' : 'text-[#64748B]'}`}>
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. STORE TOOLBAR & CONTROLS                              */}
      {/* ======================================================== */}
      <section id="katalog-bolumu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
        
        {/* Top Controls: Search Bar + Sort Dropdown + Product Count */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-[#E8EAED]">
          
          {/* Search Box */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün adı, marka veya kod ara (örn: Akustik panel, VitrA, Filli Boya)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D1D5DB] rounded-full pl-9 pr-9 py-2.5 text-xs text-[#0A0A0B] placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold transition"
                title="Aramayı Temizle"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Toolbar: Sort Dropdown & Counter */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#64748B] hidden sm:inline">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ürünleri Sırala"
                className="bg-white border border-[#D1D5DB] rounded-full px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] focus:outline-none focus:border-black"
              >
                <option value="featured">✨ Öne Çıkanlar</option>
                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="discount">🔥 En Çok İndirim</option>
              </select>
            </div>

            <span className="text-[#64748B]">
              <strong className="text-[#0A0A0B] font-mono">{filteredProducts.length}</strong> ürün listeleniyor
            </span>
          </div>

        </div>

        {/* Clean Single-Row Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { key: 'all', label: 'Tüm Ürünler' },
            { key: 'ozel', label: '🪵 Ahşap TV Paneli' },
            { key: 'alci_tavan', label: '🏛️ Duvar Çıtası' },
            { key: 'mutfak_banyo', label: '🚿 Banyo & Batarya' },
            { key: 'boya', label: '🎨 Boya & Astar' },
            { key: 'parke', label: '📐 Parke & Zemin' },
            { key: 'elektrik', label: '💡 LED & Elektrik' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-[#0A0A0B] text-white shadow-sm'
                  : 'bg-white text-[#4B5563] border border-[#E8EAED] hover:bg-slate-50 hover:text-[#0A0A0B] hover:border-slate-300'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PRODUCT CATALOG GRID (AUTHENTIC E-COMMERCE CARDS)     */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E8EAED] p-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl mb-3">
              🔍
            </div>
            <h3 className="text-base font-bold text-[#0A0A0B]">Aramanızla Eşleşen Ürün Bulunamadı</h3>
            <p className="text-xs text-[#64748B] mt-1">Farklı bir kelime deneyebilir veya kategoriyi değiştirebilirsiniz.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 btn-pill-black text-xs py-2 px-4 font-bold"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => {
              const qty = getQty(product.id);
              const purchaseType = getPurchaseType(product.id);
              const isInstalled = purchaseType === 'with_installation';
              const isRecentlyAdded = recentlyAddedId === product.id;
              const isFav = !!favorites[product.id];
              
              // Pricing calculations
              const unitPrice = isInstalled 
                ? (product.materialPrice + product.workmanshipPrice) 
                : product.materialPrice;
              const lineTotal = unitPrice * qty;

              const materialTotal = product.materialPrice * qty;
              const marketUnitPrice = product.marketPrice || Math.round(product.materialPrice * 1.4);
              const marketTotal = marketUnitPrice * qty;
              const savings = Math.max(0, marketTotal - materialTotal);
              const discountPercent = Math.round(((marketUnitPrice - product.materialPrice) / marketUnitPrice) * 100);

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-white border border-[#E8EAED] hover:border-black/40 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl relative"
                >
                  {/* Product Image Area */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
                      <span className="bg-[#0A0A0B]/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        {product.brand}
                      </span>
                      {product.inStock !== false && (
                        <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          <span>Aynı Gün Kargo</span>
                        </span>
                      )}
                    </div>

                    {/* Top Right: Discount Tag + Favorite Heart */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                      {discountPercent > 5 && (
                        <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                          <Percent className="w-2.5 h-2.5" />
                          <span>{discountPercent} İndirim</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition shadow-sm ${
                          isFav 
                            ? 'bg-rose-50 text-rose-600' 
                            : 'bg-white/80 hover:bg-white text-slate-600 backdrop-blur-sm'
                        }`}
                        title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600' : ''}`} />
                      </button>
                    </div>

                    {/* Zoom / Preview Button on Hover */}
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-[#0A0A0B] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Detaylı İncele"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    
                    <div>
                      {/* Social proof stars & product code */}
                      <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-slate-600 text-[10px] font-mono ml-0.5">4.9 (40+)</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[10px]">{product.code}</span>
                      </div>

                      <h3 
                        onClick={() => setPreviewProduct(product)}
                        className="text-xs sm:text-sm font-bold text-[#0A0A0B] group-hover:text-black line-clamp-2 leading-snug cursor-pointer hover:underline" 
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing & Purchase Mode Section */}
                    <div className="pt-2 border-t border-[#F1F3F5] space-y-2.5">
                      
                      {/* Optional Workmanship Checkbox */}
                      {product.workmanshipPrice > 0 ? (
                        <label className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition text-[11px] select-none ${
                          isInstalled 
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isInstalled}
                              onChange={(e) => setPurchaseType(product.id, e.target.checked ? 'with_installation' : 'material_only')}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                            />
                            <span>Usta Montajı Ekle</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 text-[10px]">
                            +{(product.workmanshipPrice * qty).toLocaleString('tr-TR')} ₺
                          </span>
                        </label>
                      ) : (
                        <div className="text-[10px] text-slate-500 font-medium py-1 px-1 flex items-center gap-1.5">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>Tüm Türkiye'ye Hızlı Kargo Teslim</span>
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg sm:text-xl font-black font-mono text-[#0A0A0B]">
                              {lineTotal.toLocaleString('tr-TR')} ₺
                            </span>
                            {!isInstalled && marketTotal > materialTotal && (
                              <span className="text-[10px] text-slate-400 font-mono line-through">
                                {marketTotal.toLocaleString('tr-TR')} ₺
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-[#64748B] font-medium">
                              {isInstalled ? 'Malzeme + Montaj Dahil' : 'Toptan Bayi Fiyatı (KDV Dahil)'}
                            </span>
                            {savings > 0 && !isInstalled && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                                {savings.toLocaleString('tr-TR')} ₺ Tasarruf
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#D1D5DB] rounded-full bg-white px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons: Add to Cart with tactile confirmation + WhatsApp */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product, purchaseType)}
                          className={`flex-1 rounded-full text-xs py-2 px-3 justify-center flex items-center gap-1.5 shadow-sm font-bold transition-all duration-200 ${
                            isRecentlyAdded
                              ? 'bg-emerald-600 text-white scale-[1.02]'
                              : 'bg-[#0A0A0B] text-white hover:bg-slate-800'
                          }`}
                        >
                          {isRecentlyAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>✓ Eklendi!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Sepete Ekle</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFastWhatsAppOrder(product)}
                          className="w-8 h-8 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 transition"
                          title="WhatsApp ile Hızlı Sipariş Ver"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Turnkey Renovation Showcase Banner */}
        {onNavigateConfigurator && (
          <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-[#0A0A0B] text-white relative overflow-hidden shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-400">
                RVOBA® MİMARLIK & PROJE DİREKTÖRLÜĞÜ
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1.5">
                Evinizi Komple Yenilemek mi İstiyorsunuz?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Mimar kadromuz, sözleşmeli sabit bütçe ve 2 yıl resmi garantiyle anahtar teslim daire tadilatı yapıyor. 3 dakikada bütçenizi hesaplayın, ücretsiz lazer keşif isteyin.
              </p>
            </div>
            <button
              onClick={onNavigateConfigurator}
              className="btn-pill-black bg-white text-black hover:bg-slate-100 text-xs sm:text-sm px-6 py-3.5 font-bold shadow-lg whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span>🏡 Komple Tadilat Bütçeni Hesapla</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </section>

      {/* ======================================================== */}
      {/* 5. TRUST & SHOPPING GUARANTEE STRIP                      */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-white border border-[#E8EAED] shadow-xs">
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">3.000 ₺ Üzeri Ücretsiz Kargo</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">81 ile sigortalı ambar ve kargo teslimatı.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">12 Taksit & Güvenli Ödeme</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">256-bit SSL şifrelemeli güvenli alışveriş.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">İsteğe Bağlı Montaj</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Kendi usta kadromuzla anahtar teslim.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">14 Gün Koşulsuz İade</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Orijinal ambalajında güvenle iade hakkı.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. MODAL: DETAILED PRODUCT PREVIEW                       */}
      {/* ======================================================== */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setPreviewProduct(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-2xl bg-white text-[#0A0A0B] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-in zoom-in-95 duration-200">
            
            <div className="relative h-72 sm:h-80 bg-slate-100">
              <img
                src={previewProduct.image}
                alt={previewProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {previewProduct.brand} • Kod: {previewProduct.code}
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0A0A0B]">
                  {previewProduct.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] mt-2 leading-relaxed">
                  {previewProduct.description}
                </p>
              </div>

              {previewProduct.specs && (
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
                  <h5 className="text-xs font-bold text-[#0A0A0B] mb-2 uppercase tracking-wider">
                    Teknik Özellikler:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {previewProduct.specs.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographic Scope */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-semibold">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>📦 Tüm Türkiye'ye (81 İl) Kargo ile Kapıya Teslim</span>
                </div>
                <div className="text-[11px] text-blue-700">
                  🛠️ Montaj Hizmeti: İstanbul, Ankara, İzmir
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8EAED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold">Toptan Bayi Fiyatı:</span>
                  <div className="text-2xl font-black font-mono text-[#0A0A0B]">
                    {previewProduct.materialPrice.toLocaleString('tr-TR')} ₺ / {previewProduct.unit}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAddProduct(previewProduct, 'material_only');
                      setPreviewProduct(null);
                    }}
                    className="btn-pill-black text-xs py-3 px-6 shadow-md"
                  >
                    <span>Sepete Ekle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleFastWhatsAppOrder(previewProduct);
                      setPreviewProduct(null);
                    }}
                    className="btn-pill-outline text-xs py-3 px-4 flex items-center gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FLOATING MOBILE CART PILL                             */}
      {/* ======================================================== */}
      {totalCartCount > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={onOpenCart}
            className="w-full bg-[#0A0A0B] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20 font-bold text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-xs">
                {totalCartCount}
              </div>
              <span>Sepetinizde Ürün Var</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-extrabold text-sm">
                {totalCartPrice.toLocaleString('tr-TR')} ₺
              </span>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px]">
                Sepeti Gör →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. FLOATING WHATSAPP CONSULTATION BUBBLE                 */}
      {/* ======================================================== */}
      <aside 
        aria-label="Canlı Destek ve Hızlı Sipariş"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
      >
        <a
          href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent('Merhaba RVOBA®, web sitenizdeki ürünler ve teslimat hakkında danışmak istiyorum.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <MessageCircle className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline font-semibold">Canlı Mimar Desteği</span>
        </a>
      </aside>

    </div>
  );
};
