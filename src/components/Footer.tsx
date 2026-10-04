import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0C10] border-t border-[#1C1F2B] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D00] flex items-center justify-center text-white font-display font-black text-xl">
                Y.
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl text-white tracking-tight">YAPILAB</span>
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#202330] text-orange-400">
                  PRO
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Türkiye'nin yeni nesil akıllı tadilat ve maliyet hesaplama platformu. Boyadan parkeye, seramikten mutfak dolabına tüm ürünleri online seçin; kendi bünyemizdeki uzman mimari kadromuzla, sıfır usta muhataplığı ve 2 yıl garantimizle uygulayalım.
            </p>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#FF4D00]" />
              <span>Sözleşmeli Sabit Fiyat & Gecikme Tazminatlı Teslimat</span>
            </div>
          </div>

          {/* Hizmet Kalemleri */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hizmet Kalemlerimiz</h4>
            <ul className="space-y-2">
              <li><a href="#katalog" className="hover:text-white transition">Boya & Badana (Jotun/Filli Boya)</a></li>
              <li><a href="#katalog" className="hover:text-white transition">Zemin & Parke (AGT/Çamsan)</a></li>
              <li><a href="#katalog" className="hover:text-white transition">Seramik & Fayans (VitrA/Bien)</a></li>
              <li><a href="#katalog" className="hover:text-white transition">Elektrik Tesisatı & Manyetik Ray Spot</a></li>
              <li><a href="#katalog" className="hover:text-white transition">Alçıpan, Asma Tavan & Çıtalama</a></li>
              <li><a href="#katalog" className="hover:text-white transition">Özel İmalat Lake Mutfak Dolabı</a></li>
              <li><a href="#katalog" className="hover:text-white transition">Geberit Gömme Rezervuar & Vitrifiye</a></li>
            </ul>
          </div>

          {/* Kurumsal Taahhütler */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kurumsal Güvence</h4>
            <ul className="space-y-2">
              <li className="text-slate-300">🛡️ Sıfır Usta Muhataplığı</li>
              <li className="text-slate-300">📋 Noterli Sabit Fiyat Garantisi</li>
              <li className="text-slate-300">⏱️ Gecikme Cezası Taahhüdü</li>
              <li className="text-slate-300">💎 2 Yıl Resmi İşçilik Garantisi</li>
              <li className="text-slate-300">📐 Ücretsiz Lazer Ölçüm & Keşif</li>
              <li className="text-slate-300">🧹 İnce Temizlik Dahil Teslim</li>
            </ul>
          </div>

          {/* İletişim & Lokasyon */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mimar & Şantiye İletişim</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span className="text-white font-mono font-semibold">0850 885 00 00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>teklif@yapilab.com.tr</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF4D00] shrink-0 mt-0.5" />
                <span>Merkez: Levent Mimarlık ve Şantiye Ofisi, İstanbul</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181A24] border border-[#272B3C] text-[11px] text-slate-300 hover:text-white hover:border-slate-500 transition"
              >
                <ArrowUp className="w-3 h-3 text-[#FF4D00]" />
                <span>Yukarı Çık</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-[#191C27] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} YAPILAB Mimarlık & Tadilat Çözümleri A.Ş. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition">Kullanım Şartları</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400 transition">Gizlilik Sözleşmesi</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400 transition">Garanti Koşulları</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
