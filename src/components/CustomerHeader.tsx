import React from 'react';
import { ShoppingBag, ArrowUpRight, Lock, ArrowLeft, Phone, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface CustomerHeaderProps {
  currentView: 'landing' | 'configurator' | 'store';
  cart: CartItem[];
  onNavigateLanding: () => void;
  onNavigateConfigurator: () => void;
  onNavigateStore: () => void;
  onOpenCart: () => void;
  onOpenInspection: () => void;
  onNavigateAdmin: () => void;
  supportPhone?: string;
  phoneNumber?: string;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  currentView,
  cart,
  onNavigateLanding,
  onNavigateConfigurator,
  onNavigateStore,
  onOpenCart,
  onOpenInspection,
  onNavigateAdmin,
  supportPhone = '0850 123 45 67',
  phoneNumber = '905550000000',
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

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFC]/95 backdrop-blur-md border-b border-[#E8EAED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Name: RVOBA® */}
        <div className="flex items-center gap-8">
          <button
            onClick={onNavigateStore}
            className="flex items-center gap-1.5 group text-left"
          >
            <span className="font-display font-extrabold text-2xl tracking-tighter text-[#0A0A0B]">
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
              Ürünler & Vitrin
            </button>

            <a
              href="#neden-uygunuz"
              className="px-3 py-1.5 rounded-full transition font-medium text-[#4B5563] hover:text-[#0A0A0B] hover:bg-slate-100"
            >
              Neden Uygunuz?
            </a>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Support Phone (Desktop) */}
          <a
            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
            className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0A0A0B] whitespace-nowrap shrink-0 transition px-2 py-1"
            title="Müşteri ve Danışma Hattı"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{supportPhone}</span>
          </a>

          {/* Admin Portal Entry Link */}
          <button
            onClick={onNavigateAdmin}
            title="Yönetici Paneline Geçiş Yap"
            className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0A0A0B] px-2.5 py-1.5 rounded-full hover:bg-[#F1F3F5] whitespace-nowrap shrink-0 transition"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Panel</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 transition ${
              totalCount > 0
                ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-sm'
                : 'border-[#D1D5DB] text-[#0A0A0B] hover:bg-[#F3F4F6]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {totalCount > 0 ? `${totalCount} Kalem • ${totalPrice.toLocaleString('tr-TR')} ₺` : 'Sepet (0)'}
            </span>
            <span className="sm:hidden">
              ({totalCount})
            </span>
          </button>

          {/* Primary High-Ticket Renovation Proposal CTA */}
          {currentView !== 'configurator' ? (
            <button
              onClick={onNavigateConfigurator}
              className="btn-pill-black text-xs py-2 px-3 sm:px-4 shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span className="text-sm">🏡</span>
              <span className="hidden sm:inline">Komple Ev Tadilatı Teklifi</span>
              <span className="sm:hidden">Tadilat Teklifi</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onNavigateStore}
              className="btn-pill-outline text-xs py-2 px-3.5 border-slate-300 hover:border-black whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Mağazaya Dön</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
