import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Product, CartItem, CategoryKey, LeadRequest } from '../types';

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
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [cardPurchaseTypes, setCardPurchaseTypes] = useState<Record<string, 'material_only' | 'with_installation'>>({});

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

  const filteredProducts = storeItems.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    
    setAddedToast(`${qty} ${product.unit} ${product.name} sepete eklendi!`);
    setTimeout(() => setAddedToast(null), 3500);
  };

  const handleFastWhatsAppOrder = (product: Product) => {
    const qty = getQty(product.id);
    const price = product.materialPrice * qty;

    // Log lead to CRM so it is never lost
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

    const msg = `*RESTOLAB® — Doğrudan Ürün Siparişi Talebi*\n\n` +
      `📦 *Ürün:* ${product.brand} - ${product.name}\n` +
      `🏷️ *Ürün Kodu:* ${product.code}\n` +
      `🔢 *Adet/Miktar:* ${qty} ${product.unit}\n` +
      `💰 *Toptan Tutar:* ${price.toLocaleString('tr-TR')} ₺ (KDV Dahil)\n\n` +
      `Bu ürünü toptan fabrika fiyatıyla doğrudan sipariş vermek ve kargo/ambar teslimat detaylarını öğrenmek istiyorum.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-36">

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-4 z-50 bg-[#0A0A0B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <div className="font-bold">{addedToast}</div>
            <div className="text-[11px] text-slate-300">Sepetiniz güncellendi</div>
          </div>
          <button
            onClick={onOpenCart}
            className="ml-2 bg-white text-black text-[11px] font-bold px-3 py-1 rounded-full hover:bg-slate-200 transition"
          >
            Sepeti Gör
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. STORE HERO BANNER                                     */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-[#E8EAED] bg-white">
        <div className="absolute inset-0 halftone-texture opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-white text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>RVOBA® TASARIM & MİMARİ MALZEME KOLEKSİYONU</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#0A0A0B] max-w-4xl mx-auto leading-tight">
            Evinizin Havasını Değiştiren Tasarım Malzemeleri.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
            Trend akustik ahşap TV panelleri, poliüretan duvar çıtaları, 1. sınıf boyalar ve zemin çözümleri doğrudan üretici bayi fiyatıyla. İster sadece malzemeyi kapınıza kargoyla alın, ister uzman montaj hizmetimizi ekleyin.
          </p>

          {/* Sleek Reassurance Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-5 py-2 px-5 rounded-full bg-slate-100 text-xs text-[#0A0A0B] border border-slate-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>81 İl Kargo ile Kapıya Teslim</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-bold">
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>İsteğe Bağlı Montaj (İst, Ank, İzm)</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0A0A0B]" />
              <span>Faturalı Orijinal Ürün</span>
            </span>
          </div>

          {/* Quick Bridge to Turnkey Renovation */}
          {onNavigateConfigurator && (
            <div className="mt-8 max-w-2xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A0A0B] text-white flex items-center justify-center shrink-0 text-base shadow-sm">
                  🏡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0A0A0B]">Evinizi Komple Yenilemek mi İstiyorsunuz?</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Mimar yönetiminde anahtar teslim tadilat bütçenizi 3 dakikada hesaplayabilirsiniz.</p>
                </div>
              </div>
              <button
                onClick={onNavigateConfigurator}
                className="btn-pill-black text-[11px] py-2 px-4 whitespace-nowrap shrink-0"
              >
                <span>Tadilat Sihirbazına Git</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3 Pillars of Store Strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Toptan Bayi Fiyatı</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Piyasadan %20-30 daha uygun.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mb-2">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Hızlı Sevk / Ambar</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Tüm Türkiye'ye kapıya teslim.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs mb-2">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">İsteğe Bağlı Montaj</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Usta kadromuzla anahtar teslim.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Orijinal Garanti</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Faturalı yetkili bayi ürünü.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. FILTER & SEARCH BAR                                   */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E8EAED] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            {/* Categories Pill Nav with clean wrap & clear labels */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Tüm Ürünler' },
                { key: 'ozel', label: '🪵 Ahşap & TV Paneli' },
                { key: 'boya', label: '🎨 Boya & Astar' },
                { key: 'parke', label: '📐 Parke & Zemin' },
                { key: 'mutfak_banyo', label: '🚿 Banyo & Batarya' },
                { key: 'alci_tavan', label: '🏛️ Duvar Çıtası' },
                { key: 'elektrik', label: '💡 LED & Elektrik' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat.key
                      ? 'bg-[#0A0A0B] text-white shadow-sm'
                      : 'bg-[#F8F9FA] text-[#4B5563] border border-[#E8EAED] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Search Input with quick clear */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ürün adı, kod veya marka ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-full pl-9 pr-8 py-2 text-xs text-[#0A0A0B] placeholder:text-slate-400 focus:outline-none focus:border-black"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold"
                  title="Aramayı Temizle"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PRODUCT CATALOG GRID                                  */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs text-[#64748B]">
            Toplam <strong>{filteredProducts.length}</strong> seçkin ürün listeleniyor
          </div>
          {onNavigateConfigurator && (
            <button
              onClick={onNavigateConfigurator}
              className="text-xs font-bold text-[#0A0A0B] hover:underline flex items-center gap-1"
            >
              <span>Komple Ev Tadilatı Hesaplamak İstiyorum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const qty = getQty(product.id);
            const purchaseType = getPurchaseType(product.id);
            const isInstalled = purchaseType === 'with_installation';
            
            // Selected price calculation based on toggle
            const unitPrice = isInstalled 
              ? (product.materialPrice + product.workmanshipPrice) 
              : product.materialPrice;
            const lineTotal = unitPrice * qty;

            const materialTotal = product.materialPrice * qty;
            const marketTotal = (product.marketPrice || Math.round(product.materialPrice * 1.4)) * qty;
            const savings = Math.max(0, marketTotal - materialTotal);

            return (
              <div
                key={product.id}
                className="group rounded-2xl bg-white border border-[#E8EAED] hover:border-black/30 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-lg"
              >
                {/* Product Image Area - Compact aspect-[4/3] */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                    <span className="bg-[#0A0A0B]/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      {product.brand}
                    </span>
                    {product.inStock !== false && (
                      <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                        ✓ Stokta
                      </span>
                    )}
                  </div>

                  {/* Wholesale Discount Badge */}
                  {savings > 0 && (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      Bayi Fiyatı
                    </div>
                  )}

                  {/* Zoom / Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewProduct(product)}
                    className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-[#0A0A0B] p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Detaylı İncele"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-1">
                      <span className="font-mono">{product.code}</span>
                      <span className="font-semibold text-slate-500">{product.unit}</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#0A0A0B] group-hover:text-black line-clamp-1 leading-snug" title={product.name}>
                      {product.name}
                    </h3>

                    <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & Purchase Mode Section */}
                  <div className="pt-2.5 border-t border-[#F1F3F5] space-y-2.5">
                    
                    {/* Sleek Optional Workmanship / Assembly Checkbox */}
                    {product.workmanshipPrice > 0 ? (
                      <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/90 cursor-pointer hover:bg-slate-100 transition text-[11px] select-none">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isInstalled}
                            onChange={(e) => setPurchaseType(product.id, e.target.checked ? 'with_installation' : 'material_only')}
                            className="w-3.5 h-3.5 rounded text-black focus:ring-black accent-black cursor-pointer"
                          />
                          <span className="font-semibold text-[#0A0A0B]">Usta Montajı Ekle</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 text-[10px]">
                          +{(product.workmanshipPrice * qty).toLocaleString('tr-TR')} ₺
                        </span>
                      </label>
                    ) : (
                      <div className="text-[10px] text-slate-500 font-medium py-1 px-1">
                        📦 Kargo ile Kapıya Teslim
                      </div>
                    )}

                    {/* Price and Qty */}
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
                        <span className="text-[9px] text-[#64748B] block font-medium">
                          {isInstalled ? 'Malzeme + Uzman Montaj' : 'Toptan Bayi Fiyatı'}
                        </span>
                      </div>

                      {/* Quantity Selector */}
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product, purchaseType)}
                        className="flex-1 btn-pill-black bg-[#0A0A0B] text-white hover:bg-slate-800 text-xs py-2 px-3 justify-center flex items-center gap-1.5 shadow-sm font-semibold"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Sepete Ekle</span>
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
      {/* 4. MODAL: DETAILED PRODUCT PREVIEW                       */}
      {/* ======================================================== */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setPreviewProduct(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-2xl bg-white text-[#0A0A0B] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
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

              {/* Geographic Scope in Modal */}
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

    </div>
  );
};
