import React from 'react';
import { ArrowUpRight, ShieldCheck, CheckCircle2, Clock, Award, TrendingDown } from 'lucide-react';

interface CustomerHeroProps {
  onStartConfiguring: () => void;
  onOpenInspection: () => void;
}

export const CustomerHero: React.FC<CustomerHeroProps> = ({
  onStartConfiguring,
  onOpenInspection,
}) => {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#E8EAED]">
      {/* Background Halftone / Dot-Matrix Pattern matching Image 1 */}
      <div className="absolute inset-0 halftone-texture opacity-35 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Subtle pill tag with savings highlight */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-white text-xs font-semibold mb-8 shadow-sm">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>Piyasadan %20-30 Daha Uygun Bayi Fiyatı & 81 İl Kargo</span>
        </div>

        {/* Main Bold Headline matching Image 1 Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-[#0A0A0B] leading-[1.08] max-w-4xl mx-auto">
          İster Anahtar Teslim Mimari Tadilat, İster Fabrika Bayi Fiyatıyla Tasarım Malzemeleri.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#4B5563] max-w-2xl mx-auto font-normal leading-relaxed">
          Usta stresi ve aracı komisyonu olmadan evinizi yenileyin. Mimar kadromuzla anahtar teslim komple uygulama yaptırabilir veya 1. sınıf malzemeleri (akustik panel, boya, çıta, batarya) Türkiye geneli 81 ile doğrudan kargo teslim satın alabilirsiniz.
        </p>

        {/* Centered Pill Buttons matching Image 1 */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onStartConfiguring}
            className="btn-pill-black text-sm px-7 py-3.5 shadow-lg shadow-black/10"
          >
            <span>Tadilatını Hesapla</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenInspection}
            className="btn-pill-outline text-sm px-6 py-3.5"
          >
            <span>Ücretsiz Lazer Keşif İste</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Pillars of Guarantee Strip */}
        <div className="mt-20 pt-10 border-t border-[#E8EAED]">
          <p className="text-xs uppercase font-bold tracking-widest text-[#94A3B8] mb-6">
            RESTOLAB KURUMSAL GÜVENCELERİ & FİYAT AVANTAJI
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="p-4 rounded-2xl bg-white border border-[#E8EAED] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-2.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Toptan Bayi Fiyatı</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Aracı yok, piyasadan %25 daha uygun.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8EAED] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Sıfır Usta Teması</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Tüm süreci iç mimarımız yönetir.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8EAED] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Sabit Fiyat Sözleşmesi</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Sürpriz masraf 1 TL dahi çıkmaz.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8EAED] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-2.5">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0A0A0B]">Mimari Teslim Onayı</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Eksiksiz checklist, onayınızla teslim.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
