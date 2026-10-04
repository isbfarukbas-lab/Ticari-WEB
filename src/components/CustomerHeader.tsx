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
        
        {/* Brand Name matching Image 1: RESTOLAB® */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={onNavigateLanding}
            className="flex items-center gap-1.5 group text-left"
          >
            <span className="font-display font-extrabold text-2xl tracking-tighter text-[#0A0A0B]">
              RESTOLAB
            </span>
            <span className="text-xs font-bold text-[#0A0A0B] -mt-2">®</span>
          </button>

          {/* Navigation based on current view */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#4B5563] whitespace-nowrap">
            <button
              onClick={onNavigateLanding}
              className={`hover:text-[#0A0A0B] transition ${currentView === 'landing' ? 'text-[#0A0A0B] font-bold' : ''}`}
            >
              Ana Sayfa
            </button>

            {currentView === 'landing' && (
              <>
                <a href="#neden-uygunuz" className="hover:text-[#0A0A0B] transition">
                  Neden Uygunuz?
                </a>
                <a href="#vitrin" className="hover:text-[#0A0A0B] transition">
                  Uygulama Vitrini
                </a>
              </>
            )}

            <button
              onClick={onNavigateStore}
              className={`hover:text-[#0A0A0B] transition flex items-center gap-1.5 px-3 py-1 rounded-full ${
                currentView === 'store' 
                  ? 'bg-[#0A0A0B] text-white font-bold shadow-sm' 
                  : 'text-[#0A0A0B] bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Ürünlerimiz (Mağaza)</span>
            </button>

            {currentView !== 'configurator' && (
              <button
                onClick={onNavigateConfigurator}
                className="hover:text-[#0A0A0B] transition text-[#64748B]"
              >
                Fiyat Hesaplama
              </button>
            )}
          </nav>

          {currentView !== 'landing' && (
            <button
              onClick={onNavigateLanding}
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0A0A0B] transition whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfa</span>
            </button>
          )}
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 transition ${
              totalCount > 0
                ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-sm'
                : 'border-[#D1D5DB] text-[#0A0A0B] hover:bg-[#F3F4F6]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>
              {totalCount > 0 ? `${totalCount} Kalem • ${totalPrice.toLocaleString('tr-TR')} ₺` : 'Sepet (0)'}
            </span>
          </button>

          {/* Primary CTA button */}
          {currentView === 'landing' ? (
            <button
              onClick={onNavigateConfigurator}
              className="btn-pill-black text-xs hidden md:inline-flex py-2 px-4 shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Tadilatını Hesapla</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : currentView === 'store' ? (
            <button
              onClick={onNavigateConfigurator}
              className="btn-pill-black text-xs hidden md:inline-flex py-2 px-4 shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Tadilatını Hesapla</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onOpenInspection}
              className="btn-pill-black text-xs hidden sm:inline-flex whitespace-nowrap shrink-0"
            >
              <span>Ücretsiz Keşif</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
