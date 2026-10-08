import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  Heart, 
  ArrowUpRight, 
  Phone, 
  Truck, 
  X, 
  ChevronDown,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CartItem, SiteContentSettings } from '../types';

export interface HeaderCategoryItem {
  key: string;
  label: string;
  icon: string;
}

export const HEADER_CATEGORIES: HeaderCategoryItem[] = [
  { key: 'all', label: 'Tüm Koleksiyon', icon: '✨' },
  { key: 'ozel', label: 'Akustik Ahşap Paneller', icon: '🪵' },
  { key: 'alci_tavan', label: 'Duvar Çıtaları', icon: '🖼️' },
  { key: 'boya', label: 'Boya & Astar', icon: '🎨' },
  { key: 'parke', label: 'Zemin & Parke', icon: '🪵' },
  { key: 'mutfak_banyo', label: 'Banyo & Batarya', icon: '🚿' },
  { key: 'elektrik', label: 'LED & Elektrik', icon: '💡' },
  { key: 'seramik', label: 'Seramik & Fayans', icon: '🧱' },
];

export interface CustomerHeaderProps {
  currentView: 'landing' | 'configurator' | 'store';
  cart: CartItem[];
  onNavigateLanding: () => void;
  onNavigateConfigurator: () => void;
  onNavigateStore: () => void;
  onOpenCart: () => void;
  onOpenInspection: () => void;
  supportPhone?: string;
  phoneNumber?: string;
  content?: SiteContentSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  favoritesCount: number;
  onToggleFavoritesOnly: () => void;
  showFavoritesOnly: boolean;
}

const formatPhoneDisplay = (phone?: string): string => {
  if (!phone) return '0544 768 51 37';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  if (digits.length === 12 && digits.startsWith('90')) {
    return `0${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return phone;
};

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  currentView,
  cart,
  onNavigateLanding,
  onNavigateConfigurator,
  onNavigateStore,
  onOpenCart,
  supportPhone = '0544 768 51 37',
  phoneNumber = '905447685137',
  content,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  favoritesCount,
  onToggleFavoritesOnly,
  showFavoritesOnly,
}) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalCount = cart.length;
  const totalPrice = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const isMaterialOnly = item.purchaseType === 'material_only';
    const line = isMaterialOnly 
      ? item.product.materialPrice * item.quantity 
      : (item.product.materialPrice + item.product.workmanshipPrice) * item.quantity;
    return sum + line;
  }, 0);

  const displayPhone = formatPhoneDisplay(supportPhone);

  // Close category menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (catKey: string) => {
    onSelectCategory(catKey);
    setIsCategoryMenuOpen(false);
    if (currentView !== 'store') {
      onNavigateStore();
    }
    setTimeout(() => {
      const el = document.getElementById('katalog-bolumu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentView !== 'store') {
      onNavigateStore();
    }
    setTimeout(() => {
      const el = document.getElementById('katalog-bolumu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Top E-Commerce Announcement Bar */}
      <div className="bg-[#0A0A0B] text-white text-[11px] py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Truck className="w-3.5 h-3.5" />
              <span>{content?.announcementText1 || '3.000 TL Üzeri Ücretsiz Kargo'}</span>
            </span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-300">{content?.announcementText2 || '💳 Tüm Kredi Kartlarına 12 Taksit'}</span>
            <span className="text-white/30 hidden md:inline">•</span>
            <span className="hidden md:inline text-slate-300">{content?.announcementText3 || '⚡ Fabrikadan Doğrudan Hızlı Sevk'}</span>
          </div>

          <a
            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
            className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium shrink-0 ml-4"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>Müşteri Danışma: <strong className="text-white font-mono">{displayPhone}</strong></span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8EAED]">
        {/* ======================================================== */}
        {/* ROW 1: BRAND LOGO + ☰ KATEGORİLER + WIDE SEARCH + ACTIONS */}
        {/* ======================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Brand Logo & Categories Button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0" ref={menuRef}>
            {/* Logo */}
            <button
              onClick={onNavigateStore}
              className="flex items-center gap-1 group text-left"
              title="RVOBA® Ana Sayfa"
            >
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-[#0A0A0B] group-hover:opacity-90 transition">
                RVOBA
              </span>
              <span className="text-xs font-bold text-[#F1641E] -mt-2">®</span>
            </button>

            {/* ☰ Kategoriler Trigger Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition ${
                  isCategoryMenuOpen 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
                title="Tüm Kategoriler Menüsü"
              >
                <Menu className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Kategoriler</span>
                <ChevronDown className={`w-3 h-3 hidden sm:inline transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Flyout Dropdown */}
              {isCategoryMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Ürün Kategorileri
                    </span>
                    <button 
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="text-slate-400 hover:text-black text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="py-2 space-y-1">
                    {HEADER_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.key && !showFavoritesOnly;
                      return (
                        <button
                          key={`dropdown-cat-${cat.key}`}
                          type="button"
                          onClick={() => handleCategoryClick(cat.key)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{cat.icon}</span>
                            <span>{cat.label}</span>
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Turnkey Renovation Secondary Link in Dropdown */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoryMenuOpen(false);
                        onNavigateConfigurator();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span>🏡</span>
                        <span>Anahtar Teslim Komple Tadilat</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Central Wide Search Bar (Etsy Style: Rounded Pill with Orange Circular Button) */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl mx-1 sm:mx-4"
          >
            <div className="relative flex items-center w-full rounded-full border-2 border-slate-900 bg-white hover:border-black focus-within:border-black focus-within:ring-2 focus-within:ring-orange-500/20 shadow-xs transition-all pl-3 sm:pl-4 pr-1 sm:pr-1.5 py-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tasarım malzeme, marka veya ürün ara..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#0A0A0B] placeholder:text-slate-500 outline-none pr-2"
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center mr-1 text-xs font-bold transition shrink-0"
                  title="Aramayı Temizle"
                >
                  ✕
                </button>
              )}

              {/* Etsy-Style Iconic Orange Circular Search Button */}
              <button
                type="submit"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F1641E] hover:bg-[#D9531E] active:scale-95 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all"
                title="Ara"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* Right Actions: Favorites + Cart + Turnkey Renovation Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Favorites Icon Button */}
            <button
              type="button"
              onClick={onToggleFavoritesOnly}
              className={`relative p-2 sm:p-2.5 rounded-full transition flex items-center justify-center ${
                showFavoritesOnly 
                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' 
                  : 'text-slate-700 hover:bg-slate-100 hover:text-rose-600'
              }`}
              title={showFavoritesOnly ? 'Tüm Ürünleri Göster' : 'Favorilerimi Göster'}
            >
              <Heart className={`w-5 h-5 transition ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 transition ${
                totalCount > 0
                  ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-sm hover:bg-slate-800'
                  : 'border-[#D1D5DB] text-[#0A0A0B] hover:bg-[#F3F4F6]'
              }`}
              title="Alışveriş Sepeti"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                {totalCount > 0 && (
                  <span className="sm:hidden absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono">
                {totalCount > 0 
                  ? `${totalCount} Ürün • ${totalPrice.toLocaleString('tr-TR')} ₺` 
                  : 'Sepetim (0)'}
              </span>
            </button>

            {/* High-Ticket Renovation Proposal Link */}
            {currentView !== 'configurator' ? (
              <button
                onClick={onNavigateConfigurator}
                className="hidden lg:flex btn-pill-outline text-xs py-2 px-3 sm:px-4 border-slate-300 hover:border-black whitespace-nowrap shrink-0 items-center gap-1.5 font-semibold text-slate-700 hover:text-black transition"
              >
                <span>🏡 Anahtar Teslim Tadilat</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={onNavigateStore}
                className="btn-pill-black text-xs py-2 px-3.5 shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <span>🛍️ Ürün Mağazası</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}

          </div>

        </div>

        {/* ======================================================== */}
        {/* ROW 2: ETSY-STYLE MINIMALIST HORIZONTAL CATEGORY LINKS   */}
        {/* ======================================================== */}
        <div className="border-t border-[#E8EAED] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start lg:justify-center gap-6 sm:gap-8 overflow-x-auto py-2.5 text-xs sm:text-[13px] scrollbar-none whitespace-nowrap">
              {HEADER_CATEGORIES.map((cat) => {
                const isActive = !showFavoritesOnly && selectedCategory === cat.key;
                return (
                  <button
                    key={`header-cat-${cat.key}`}
                    type="button"
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`transition-all py-1 relative flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'font-bold text-[#0A0A0B] border-b-2 border-black -mb-[1px]'
                        : 'text-slate-600 hover:text-[#0A0A0B] font-medium hover:border-b-2 hover:border-slate-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </header>
    </>
  );
};
