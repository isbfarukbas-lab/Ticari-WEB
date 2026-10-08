import React, { useState, useEffect, useMemo } from 'react';
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
import { Product, CartItem, LeadRequest, SiteContentSettings } from '../types';

interface CustomerStoreProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, quantity: number, roomType: string, purchaseType?: 'with_installation' | 'material_only') => void;
  onOpenCart: () => void;
  phoneNumber?: string;
  supportPhone?: string;
  onNavigateConfigurator?: () => void;
  onSaveLead?: (lead: LeadRequest) => void;
  content?: SiteContentSettings;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  favorites: Record<string, boolean>;
  onToggleFavorite: (id: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

export const CustomerStore: React.FC<CustomerStoreProps> = ({
  products,
  cart,
  onAddToCart,
  onOpenCart,
  phoneNumber = '905447685137',
  supportPhone = '0544 768 51 37',
  onNavigateConfigurator,
  onSaveLead,
  content,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  favorites,
  onToggleFavorite,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'discount'>('featured');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  // Filter store products (products marked as isStoreProduct, or fallback to active items)
  const hasStoreProducts = products.some((p) => p.isStoreProduct && p.isActive !== false);
  const storeItems = products.filter((p) => {
    if (p.isActive === false) return false;
    if (hasStoreProducts) return p.isStoreProduct === true;
    return true;
  });


  // Curated best seller products for the showcase section
  const bestSellers = useMemo(() => {
    const preferredIds = [
      'store-rvoba-tv-panel',
      'store-rvoba-cita-kiti',
      'store-filli-momento-kova',
      'store-varioclic-paket',
    ];
    const picked: Product[] = [];
    preferredIds.forEach((id) => {
      const item = storeItems.find((p) => p.id === id);
      if (item) picked.push(item);
    });
    if (picked.length < 4) {
      storeItems.forEach((p) => {
        if (!picked.some((item) => item.id === p.id) && picked.length < 4) {
          picked.push(p);
        }
      });
    }
    return picked;
  }, [storeItems]);

  const categoryLabels: Record<string, string> = {
    all: 'Tüm Koleksiyon',
    ozel: 'Akustik Ahşap Paneller',
    alci_tavan: 'Duvar Çıtaları',
    boya: 'Boya & Astar',
    parke: 'Zemin & Parke',
    mutfak_banyo: 'Banyo & Batarya',
    elektrik: 'LED & Elektrik',
    seramik: 'Seramik & Fayans',
  };

  const scrollToCatalog = (catKey?: string) => {
    if (catKey) onSelectCategory(catKey);
    const el = document.getElementById('katalog-bolumu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBestSellers = () => {
    const el = document.getElementById('cok-satanlar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredProducts = storeItems
    .filter((p) => {
      if (showFavoritesOnly && !favorites[p.id]) return false;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = 
        !searchQuery ||
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

  const handleAddProduct = (product: Product, purchaseType: 'material_only' | 'with_installation' = 'material_only') => {
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
    const price = product.materialPrice * qty;

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
          purchaseType: 'material_only',
        },
      ],
      createdAt: new Date().toISOString(),
    });

    const msg = `*RVOBA® — Hızlı Ürün Siparişi (rvoba.com)*\n\n` +
      `📦 *Ürün:* ${product.brand} - ${product.name}\n` +
      `🏷️ *Ürün Kodu:* ${product.code}\n` +
      `🔢 *Miktar:* ${qty} ${product.unit}\n` +
      `🚚 *Teslimat:* 81 İl Kargo ile Kapıya Teslim\n` +
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

  return (
    <div className="space-y-8 sm:space-y-12 pb-32">

      {/* ======================================================== */}
      {/* 1. CLEAN BOUTIQUE STORE HERO BANNER                      */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[#E8EAED] bg-white">
        <div className="absolute inset-0 halftone-texture opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0A0A0B] text-white text-[11px] font-semibold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{content?.storeBadge || 'RVOBA® 2026 MİMARİ ÜRÜN & MALZEME KOLEKSİYONU'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-[#0A0A0B] leading-tight">
              {content?.storeTitle || 'Evinizin Havasını Değiştiren Tasarım Malzemeleri.'}
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed max-w-2xl mx-auto">
              {content?.storeSubtitle || 'Trend akustik ahşap paneller, poliüretan çıta setleri, 1. sınıf boyalar ve zemin çözümleri doğrudan üretici bayi fiyatıyla Türkiye geneli kapınıza teslim.'}
            </p>

            {/* Quick Perks Strip */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 text-slate-800 font-semibold border border-slate-200">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>{content?.storePerk1 || '3.000 ₺ Üzeri Ücretsiz Kargo'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 text-slate-800 font-semibold border border-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span>{content?.storePerk2 || '12 Taksit İmkanı'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 text-slate-800 font-semibold border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{content?.storePerk3 || 'Faturalı & Orijinal Bayi Garantisi'}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => scrollToCatalog()}
                className="btn-pill-black text-xs py-3 px-6 font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tüm Koleksiyonu Keşfet ↓</span>
              </button>
              <button
                onClick={() => scrollToBestSellers()}
                className="btn-pill-outline text-xs py-3 px-5 font-bold flex items-center gap-2 border-slate-300 hover:border-black text-slate-800 hover:text-black transition bg-white shadow-xs"
              >
                <span>🔥 Çok Satanlar & Fırsatlar</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. BEST SELLERS SHOWCASE (LOKOMOTİF 4 TREND ÜRÜN)        */}
      {/* ======================================================== */}
      <section id="cok-satanlar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider mb-1.5 border border-rose-200">
              <Zap className="w-3 h-3 fill-current text-rose-600" />
              <span>Haftanın En Çok Satanları</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#0A0A0B]">
              Trend Mimari Dekorasyon Fırsatları
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Müşterilerimizin evlerinde en çok tercih ettiği, doğrudan stoktan kapıya sevk edilen popüler ürünler.
            </p>
          </div>

          <button
            onClick={() => scrollToCatalog()}
            className="text-xs font-bold text-slate-800 hover:text-black flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>Tüm Kataloğu İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {bestSellers.map((product) => {
            const qty = getQty(product.id);
            const isRecentlyAdded = recentlyAddedId === product.id;
            const isFav = !!favorites[product.id];
            const lineTotal = product.materialPrice * qty;
            const marketUnitPrice = product.marketPrice || Math.round(product.materialPrice * 1.35);
            const marketTotal = marketUnitPrice * qty;
            const savings = Math.max(0, marketTotal - lineTotal);
            const discountPercent = Math.round(((marketUnitPrice - product.materialPrice) / marketUnitPrice) * 100);

            return (
              <div
                key={`bestseller-${product.id}`}
                className="group rounded-2xl bg-white border border-[#E8EAED] hover:border-black/50 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl relative"
              >
                {/* Image Area */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
                    <span className="bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Çok Satan</span>
                    </span>
                    <span className="bg-[#0A0A0B]/85 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                      {product.brand}
                    </span>
                  </div>

                  {/* Top Right: Discount & Favorite */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                    {discountPercent > 5 && (
                      <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                        <Percent className="w-2.5 h-2.5" />
                        <span>{discountPercent} İndirim</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleToggleFav(product.id, e)}
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

                  {/* Quick Preview Hover */}
                  <button
                    type="button"
                    onClick={() => setPreviewProduct(product)}
                    className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-[#0A0A0B] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Detaylı İncele"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-1">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-slate-600 text-[10px] font-mono ml-0.5">4.9</span>
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

                    {product.packageInfo && (
                      <div className="mt-1">
                        <span className="inline-flex items-center text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          📦 {product.packageInfo}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-2 border-t border-[#F1F3F5] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>81 İl Kargo ile Teslim</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Stokta
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg sm:text-xl font-black font-mono text-[#0A0A0B]">
                            {lineTotal.toLocaleString('tr-TR')} ₺
                          </span>
                          {marketTotal > lineTotal && (
                            <span className="text-[10px] text-slate-400 font-mono line-through">
                              {marketTotal.toLocaleString('tr-TR')} ₺
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-[#64748B] font-medium">Toptan Fiyat</span>
                          {savings > 0 && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                              {savings.toLocaleString('tr-TR')} ₺ Tasarruf
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#D1D5DB] rounded-full bg-white px-1.5 py-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                          aria-label="Miktarı Azalt"
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
                          aria-label="Miktarı Artır"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product, 'material_only')}
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
      </section>

      {/* ======================================================== */}
      {/* 3. PRODUCT CATALOG TOOLBAR & ACTIVE FILTERS              */}
      {/* ======================================================== */}
      <section id="katalog-bolumu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
        
        {/* Section Heading & Filter Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#E8EAED]">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#0A0A0B]">
              Tüm Ürün Koleksiyonu
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Üretici bayi fiyatlarıyla 81 il kapıya sigortalı sevk edilen orijinal malzemeler.
            </p>

            {/* Active Filter Pills (displayed when any filter is applied) */}
            {(selectedCategory !== 'all' || showFavoritesOnly || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Aktif Filtreler:</span>
                
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-xs">
                    <span>{categoryLabels[selectedCategory] || selectedCategory}</span>
                    <button 
                      onClick={() => onSelectCategory('all')} 
                      className="hover:text-amber-300 ml-0.5"
                      title="Kategori Filtresini Kaldır"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {showFavoritesOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-xs">
                    <span>❤️ Sadece Favorilerim</span>
                    <button 
                      onClick={onToggleFavoritesOnly} 
                      className="hover:text-amber-200 ml-0.5"
                      title="Favori Filtresini Kaldır"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">
                    <span>Arama: "{searchQuery}"</span>
                    <button 
                      onClick={() => onSearchChange('')} 
                      className="hover:text-black ml-0.5"
                      title="Aramayı Temizle"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  onClick={() => {
                    onSelectCategory('all');
                    onSearchChange('');
                    if (showFavoritesOnly) onToggleFavoritesOnly();
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline ml-1"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>

          {/* Right Toolbar: Sort Dropdown & Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[#64748B] hidden sm:inline">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ürünleri Sırala"
                className="bg-white border border-[#D1D5DB] rounded-full px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] focus:outline-none focus:border-black shadow-xs cursor-pointer"
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
              onClick={() => { 
                onSelectCategory('all'); 
                onSearchChange(''); 
                if (showFavoritesOnly) onToggleFavoritesOnly();
              }}
              className="mt-4 btn-pill-black text-xs py-2 px-4 font-bold"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => {
              const qty = getQty(product.id);
              const isRecentlyAdded = recentlyAddedId === product.id;
              const isFav = !!favorites[product.id];
              
              // Pricing calculations (Pure material retail store)
              const lineTotal = product.materialPrice * qty;
              const marketUnitPrice = product.marketPrice || Math.round(product.materialPrice * 1.35);
              const marketTotal = marketUnitPrice * qty;
              const savings = Math.max(0, marketTotal - lineTotal);
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
                        onClick={(e) => handleToggleFav(product.id, e)}
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

                      {product.packageInfo && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            📦 {product.packageInfo}
                          </span>
                        </div>
                      )}

                      <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing & Purchase Mode Section */}
                    <div className="pt-2 border-t border-[#F1F3F5] space-y-2.5">
                      
                      {/* Shipping & Stock Reassurance Badge */}
                      <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>81 İl Kargo ile Kapıya Teslim</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Stokta
                        </span>
                      </div>

                      {/* Price Display */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg sm:text-xl font-black font-mono text-[#0A0A0B]">
                              {lineTotal.toLocaleString('tr-TR')} ₺
                            </span>
                            {marketTotal > lineTotal && (
                              <span className="text-[10px] text-slate-400 font-mono line-through">
                                {marketTotal.toLocaleString('tr-TR')} ₺
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-[#64748B] font-medium">
                              Toptan Bayi Fiyatı (KDV Dahil)
                            </span>
                            {savings > 0 && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                                {savings.toLocaleString('tr-TR')} ₺ Tasarruf
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#D1D5DB] rounded-full bg-white px-1.5 py-0.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                            aria-label="Miktarı Azalt"
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
                            aria-label="Miktarı Artır"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons: Add to Cart with tactile confirmation + WhatsApp */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product, 'material_only')}
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">%100 Orijinal & Faturalı</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Doğrudan yetkili bayi üretici garantisi.</p>
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

              {/* Geographic Scope & Guarantee */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-semibold">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>📦 Tüm Türkiye'ye (81 İl) Kargo ile Kapıya Teslim</span>
                </div>
                <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>%100 Orijinal & Üretici Bayi Faturalı</span>
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
      {/* 7. FLOATING WHATSAPP CONSULTATION BUBBLE                 */}
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
