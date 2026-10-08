import React from 'react';
import { Check } from 'lucide-react';
import { SiteContentSettings } from '../types';

interface CustomerTrustSectionProps {
  content?: SiteContentSettings;
}

export const CustomerTrustSection: React.FC<CustomerTrustSectionProps> = ({ content }) => {
  return (
    <section id="guvencemiz" className="py-20 border-t border-[#E8EAED] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            {content?.trustBadge || 'KURUMSAL GÜVENCE MODELİ'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0A0A0B] mt-2">
            {content?.trustTitle || 'Müşteri Usta İle Asla Muhatap Olmaz.'}
          </h2>
          <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
            {content?.trustSubtitle || 'Klasik tadilat süreçlerindeki usta arama derdine, telefonlara çıkmayan taşeronlara ve sürekli artan masraflara RVOBA ile son veriyoruz.'}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-display font-bold text-sm mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">{content?.pillar1Title || 'Tek Kurumsal Muhatap'}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                {content?.pillar1Desc || 'Tüm süreci bünyemizde görevli İç Mimar ve Şantiye Şefimiz yönetir. Boyacı, parkeci veya tesisatçı ile tek bir kelime dahi konuşmanıza gerek kalmaz.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center gap-2 text-xs font-semibold text-[#0A0A0B]">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{content?.pillar1Note || 'Sıfır Operasyonel Yük'}</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-display font-bold text-sm mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">{content?.pillar2Title || 'Sözleşmeli Sabit Bütçe'}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                {content?.pillar2Desc || 'Web sitemizde gördüğünüz fiyatlar yerinde ücretsiz lazer ölçüm sonrası resmi sözleşmeye bağlanır. Keşifte belirlenen kapsam dışında kesinlikle ilave fiyat farkı çıkarılmaz.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center gap-2 text-xs font-semibold text-[#0A0A0B]">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{content?.pillar2Note || 'Sürpriz Maliyet Yok'}</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-display font-bold text-sm mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">{content?.pillar3Title || 'Mimari Teslim & Eksiksiz Onay'}</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                {content?.pillar3Desc || 'İş bitiminde iç mimarımızla beraber detaylı kontrol listesi yapılır. Köşe rötuşları, süpürgelik birleşimleri ve tüm detaylar tam yapılmadan ve onayınız alınmadan iş teslim tutanağı kapatılmaz.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center gap-2 text-xs font-semibold text-[#0A0A0B]">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{content?.pillar3Note || 'Eksiksiz & Onaylı Teslimat'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
