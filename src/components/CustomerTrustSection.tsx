import React from 'react';
import { ShieldCheck, Check, ArrowUpRight } from 'lucide-react';

export const CustomerTrustSection: React.FC = () => {
  return (
    <section id="guvencemiz" className="py-20 border-t border-[#E8EAED] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            KURUMSAL GÜVENCE MODELİ
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0A0A0B] mt-2">
            Müşteri Usta İle Asla Muhatap Olmaz.
          </h2>
          <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
            Klasik tadilat süreçlerindeki usta arama derdine, telefonlara çıkmayan taşeronlara ve sürekli artan masraflara RVOBA ile son veriyoruz.
          </p>
        </div>

        {/* 2 Column Comparison or Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-display font-bold text-sm mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">Tek Kurumsal Muhatap</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Tüm süreci bünyemizde görevli İç Mimar ve Şantiye Şefimiz yönetir. Boyacı, parkeci veya tesisatçı ile tek bir kelime dahi konuşmanıza gerek kalmaz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center gap-2 text-xs font-semibold text-[#0A0A0B]">
              <Check className="w-4 h-4" />
              <span>Sıfır Operasyonel Yük</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-display font-bold text-sm mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">Sözleşmeli Sabit Bütçe</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Web sitemizde gördüğünüz fiyatlar yerinde ücretsiz lazer ölçüm sonrası resmi sözleşmeye bağlanır. Keşifte belirlenen kapsam dışında kesinlikle ilave fiyat farkı çıkarılmaz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center gap-2 text-xs font-semibold text-[#0A0A0B]">
              <Check className="w-4 h-4" />
              <span>Sürpriz Maliyet Yok</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center font-display font-bold text-sm mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">Mimari Teslim & Eksiksiz Onay</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                İş bitiminde iç mimarımızla beraber detaylı kontrol listesi yapılır. Köşe rötuşları, süpürgelik birleşimleri ve tüm detaylar tam yapılmadan ve onayınız alınmadan iş teslim tutanağı kapatılmaz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center gap-2 text-xs font-semibold text-[#0A0A0B]">
              <Check className="w-4 h-4" />
              <span>Eksiksiz & Onaylı Teslimat</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
