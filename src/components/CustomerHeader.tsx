import React from 'react';
import { ShoppingBag, ArrowUpRight, ArrowLeft, Phone, Sparkles, Truck } from 'lucide-react';
import { CartItem, SiteContentSettings } from '../types';

interface CustomerHeaderProps {
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
  onOpenInspection,
  supportPhone = '0544 768 51 37',
  phoneNumber = '905447685137',
  content,
}) => {
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

      <header className="sticky top-0 z-40 bg-[#FBFBFC]/95 backdrop-blur-md border-b border-[#E8EAED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Name: RVOBA® */}
          <div className="flex items-center gap-8">
            <button
              onClick={onNavigateStore}
              className="flex items-center gap-1.5 group text-left"
            >
              <span className="font-display font-black text-2xl sm:text-3xl tracking-tighter text-[#0A0A0B]">
                RVOBA
              </span>
              <span className="text-xs font-bold text-[#0A0A0B] -mt-2">®</span>
            </button>

            {/* Clean Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-3 text-xs whitespace-nowrap">
              <button
                onClick={onNavigateStore}
                className={`px-3 py-1.5 rounded-full transition font-semibold ${
                  currentView === 'store' || currentView === 'landing'
                    ? 'bg-[#0A0A0B] text-white shadow-sm' 
                    : 'text-[#4B5563] hover:text-[#0A0A0B] hover:bg-slate-100'
                }`}
              >
                Koleksiyonlar & Mağaza
              </button>

              <a
                href="#neden-uygunuz"
                className="px-3 py-1.5 rounded-full transition font-medium text-[#4B5563] hover:text-[#0A0A0B] hover:bg-slate-100"
              >
                Neden RVOBA?
              </a>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 transition ${
                totalCount > 0
                  ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-sm'
                  : 'border-[#D1D5DB] text-[#0A0A0B] hover:bg-[#F3F4F6]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {totalCount > 0 
                  ? `${totalCount} ${currentView === 'store' ? 'Ürün' : 'Kalem'} • ${totalPrice.toLocaleString('tr-TR')} ₺` 
                  : 'Sepetim (0)'}
              </span>
              <span className="sm:hidden font-mono font-bold">
                ({totalCount})
              </span>
            </button>

            {/* High-Ticket Renovation Proposal Secondary Navigation */}
            {currentView !== 'configurator' ? (
              <button
                onClick={onNavigateConfigurator}
                className="btn-pill-outline text-xs py-2 px-3 sm:px-4 border-slate-300 hover:border-black whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold text-slate-700 hover:text-black transition"
              >
                <span>🏡 Anahtar Teslim Tadilat</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={onNavigateStore}
                className="btn-pill-black text-xs py-2 px-3.5 shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <span>🛍️ Ürün Mağazasına Dön</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}

          </div>

        </div>
      </header>
    </>
  );
};
