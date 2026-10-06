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
            <span>RESTOLAB MİMARİ KOLEKSİYON & TOPTAN BAYİ SEÇKİSİ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#0A0A0B] max-w-4xl mx-auto leading-tight">
            Doğrudan Ürün Satışı: Fabrika Bayi Fiyatıyla Malzeme ve Özel İmalat.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
            RestoLab ana bayisi olduğu 1. sınıf boya, derzli parke, İtalyan seramik ve atölyemizde üretilen akustik ahşap TV panellerini doğrudan satın alabilirsiniz. İster sadece malzemeyi kargoyla alın, ister uzman montaj hizmetimizi ekleyin.
          </p>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const qty = getQty(product.id);
            const materialTotal = product.materialPrice * qty;
            const installedTotal = (product.materialPrice + product.workmanshipPrice) * qty;
            const marketTotal = (product.marketPrice || Math.round(product.materialPrice * 1.4)) * qty;
            const savings = Math.max(0, marketTotal - materialTotal);

            return (
              <div
                key={product.id}
                className="group rounded-3xl bg-white border border-[#E8EAED] hover:border-black/30 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl"
              >
                
                {/* Product Image Area */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
                    <span className="bg-[#0A0A0B]/90 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {product.brand}
                    </span>
                    {product.inStock !== false && (
                      <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                        ✓ Stokta Var
                      </span>
                    )}
                  </div>

                  {/* Wholesale Discount Badge */}
                  {savings > 0 && (
                    <div className="absolute top-3.5 right-3.5 bg-emerald-500 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                      Toptan Bayi Fiyatı
                    </div>
                  )}

                  {/* Zoom / Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewProduct(product)}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-[#0A0A0B] p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Detaylı İncele"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                      <span className="font-mono">Kod: {product.code}</span>
                      <span className="font-semibold text-slate-500">Birim: {product.unit}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#0A0A0B] group-hover:text-black leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Bullet Specs */}
                    {product.specs && product.specs.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {product.specs.slice(0, 3).map((spec, sIdx) => (
                          <div key={sIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="pt-4 border-t border-[#E8EAED]">
                    
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-medium">Toptan Bayi Fiyatı:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl sm:text-2xl font-black font-mono text-[#0A0A0B]">
                            {materialTotal.toLocaleString('tr-TR')} ₺
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono line-through">
                            {marketTotal.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#D1D5DB] rounded-full bg-white px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty + 1)}
                          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="space-y-2">
                      {/* Option 1: Sadece Malzemeyi Satın Al */}
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product, 'material_only')}
                        className="w-full btn-pill-black bg-[#0A0A0B] text-white hover:bg-slate-800 text-xs py-2.5 justify-center flex items-center gap-2 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Sadece Ürünü Sepete Ekle</span>
                      </button>

                      {/* Option 2: Usta Montajı Dahil Ekle */}
                      {product.workmanshipPrice > 0 && (
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product, 'with_installation')}
                          className="w-full btn-pill-outline hover:border-black text-[11px] py-2 justify-center flex items-center gap-1.5 text-slate-700"
                        >
                          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Usta Montajı Dahil Ekle (+{(product.workmanshipPrice * qty).toLocaleString('tr-TR')} ₺)</span>
                        </button>
                      )}

                      {/* Option 3: Hızlı WhatsApp Siparişi */}
                      <button
                        type="button"
                        onClick={() => handleFastWhatsAppOrder(product)}
                        className="w-full text-center text-[10px] text-emerald-700 hover:text-emerald-800 font-bold transition flex items-center justify-center gap-1 py-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp ile Anında Sipariş Ver</span>
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
