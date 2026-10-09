import React from 'react';
import { ArrowUpRight, Phone, MapPin, Sparkles, Lock } from 'lucide-react';
import { SiteSettings } from '../types';
import { LegalTabKey } from './CustomerLegalModal';

interface CustomerFooterProps {
  onNavigateAdmin: () => void;
  onNavigateStore?: () => void;
  onNavigateConfigurator?: () => void;
  onOpenLegal?: (tab: LegalTabKey) => void;
  settings?: SiteSettings;
}

export const CustomerFooter: React.FC<CustomerFooterProps> = ({ 
  onNavigateAdmin,
  onNavigateStore,
  onNavigateConfigurator,
  onOpenLegal,
  settings,
}) => {
  return (
    <footer className="bg-white border-t border-[#E8EAED] text-[#64748B] text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-[#E8EAED]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-2xl tracking-tighter text-[#0A0A0B]">
                RVOBA
              </span>
              <span className="text-xs font-bold text-[#0A0A0B] -mt-2">®</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1 max-w-md">
              {settings?.companyName || 'RVOBA® Mimarlık ve Yapı Çözümleri A.Ş.'} — Mimari tasarım ürünleri, toptan bayi fiyatıyla malzeme tedariki ve anahtar teslim tadilat platformu (rvoba.com).
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                Danışma & Sipariş: <strong className="text-slate-800 font-mono">{settings?.supportPhone || '0544 768 51 37'}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Merkez Lojistik & Depo: Kadıköy / İstanbul
              </span>
              <span>•</span>
              <span>Tüm Türkiye'ye Sigortalı Sevk</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onNavigateStore && (
              <button
                onClick={onNavigateStore}
                className="text-xs font-semibold text-[#0A0A0B] hover:bg-slate-100 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-full transition"
              >
                <span>Ürün Koleksiyonu</span>
              </button>
            )}

            {onNavigateConfigurator && (
              <button
                onClick={onNavigateConfigurator}
                className="text-xs font-semibold text-[#0A0A0B] hover:bg-slate-100 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-full transition"
              >
                <span>Mimari Tadilat & Keşif</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Legal and Compliance Links (Sanal POS & ETBİS Zorunlu Linkleri) */}
        {onOpenLegal && (
          <div className="py-4 border-b border-[#E8EAED] flex items-center justify-between flex-wrap gap-4 text-[11px] text-[#64748B]">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <button
                onClick={() => onOpenLegal('sozlesme')}
                className="hover:text-[#0A0A0B] hover:underline transition"
              >
                Mesafeli Satış Sözleşmesi
              </button>
              <span>•</span>
              <button
                onClick={() => onOpenLegal('onbilgi')}
                className="hover:text-[#0A0A0B] hover:underline transition"
              >
                Ön Bilgilendirme Formu
              </button>
              <span>•</span>
              <button
                onClick={() => onOpenLegal('kvkk')}
                className="hover:text-[#0A0A0B] hover:underline transition"
              >
                KVKK & Gizlilik Politikası
              </button>
              <span>•</span>
              <button
                onClick={() => onOpenLegal('iade')}
                className="hover:text-[#0A0A0B] hover:underline transition"
              >
                İptal ve İade Koşulları
              </button>
            </div>

            {/* Payment & Security Trust Badges */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <span className="text-emerald-700 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-Bit SSL</span>
              </span>
              <span>•</span>
              <span>3D Secure</span>
              <span>•</span>
              <span>Visa / Mastercard / Troy</span>
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()} {settings?.companyName || 'RVOBA® Mimarlık Yapı Çözümleri A.Ş.'} • Erenköy V.D. 7350918234 • Tüm hakları saklıdır (rvoba.com).</span>
            {onNavigateAdmin && (
              <button 
                onClick={onNavigateAdmin}
                className="text-slate-300 hover:text-slate-600 transition p-0.5 rounded opacity-60 hover:opacity-100" 
                title="Yetkili Yönetici Girişi"
                aria-label="Yetkili Yönetici Girişi"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span>Tek Kurumsal Muhatap</span>
            <span>•</span>
            <span>Resmi Faturalı Ürünler</span>
            <span>•</span>
            <span>Mimari Teslim Onayı</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">%20 KDV Dahil Net Fiyatlar</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
