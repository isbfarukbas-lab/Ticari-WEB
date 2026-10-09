import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale, Lock, RefreshCw, Printer } from 'lucide-react';

export type LegalTabKey = 'sozlesme' | 'onbilgi' | 'kvkk' | 'iade';

interface CustomerLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTabKey;
  companyName?: string;
  supportPhone?: string;
}

export const CustomerLegalModal: React.FC<CustomerLegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'sozlesme',
  companyName = 'RVOBA® Mimarlık ve Yapı Çözümleri A.Ş.',
  supportPhone = '0544 768 51 37',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabKey>(defaultTab);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="relative w-full max-w-3xl bg-white text-[#0A0A0B] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 border border-[#E8EAED]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E8EAED] flex items-center justify-between bg-[#FBFBFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-extrabold text-[#0A0A0B]">
                Yasal Bilgilendirme & Sözleşmeler
              </h2>
              <p className="text-[11px] text-[#64748B]">
                {companyName} • 6502 Sayılı Tüketici Kanunu Mevzuatına Uygun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:text-black hover:bg-slate-100 transition"
              title="Yazdır"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8EAED] bg-white px-6 overflow-x-auto gap-2 py-2 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('sozlesme')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sozlesme'
                ? 'bg-[#0A0A0B] text-white font-bold'
                : 'text-[#64748B] hover:text-[#0A0A0B] hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mesafeli Satış Sözleşmesi</span>
          </button>

          <button
            onClick={() => setActiveTab('onbilgi')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'onbilgi'
                ? 'bg-[#0A0A0B] text-white font-bold'
                : 'text-[#64748B] hover:text-[#0A0A0B] hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ön Bilgilendirme Formu</span>
          </button>

          <button
            onClick={() => setActiveTab('kvkk')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'kvkk'
                ? 'bg-[#0A0A0B] text-white font-bold'
                : 'text-[#64748B] hover:text-[#0A0A0B] hover:bg-slate-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>KVKK & Gizlilik</span>
          </button>

          <button
            onClick={() => setActiveTab('iade')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'iade'
                ? 'bg-[#0A0A0B] text-white font-bold'
                : 'text-[#64748B] hover:text-[#0A0A0B] hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>İptal & İade Koşulları</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-[#334155] leading-relaxed">
          
          {/* TAB 1: MESAFELİ SATIŞ SÖZLEŞMESİ */}
          {activeTab === 'sozlesme' && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B]">MESAFELİ SATIŞ SÖZLEŞMESİ</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Yürürlük Tarihi: 2026 • 6502 Sayılı Kanun Uyarınca</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">MADDE 1 — TARAFLAR</h4>
                <p><strong>SATICI / YÜKLENİCİ:</strong> {companyName}<br />
                Mersis No: 0735000000000001 • Adres: Kadıköy / İstanbul<br />
                Destek & Müşteri Danışma Hattı: {supportPhone} • E-Posta: destek@rvoba.com</p>
                <p className="mt-1.5"><strong>ALICI / İŞ SAHİBİ:</strong> Platform üzerinden malzeme siparişi veren veya mimari keşif ve tadilat taahhüdü başlatan müşteri.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">MADDE 2 — SÖZLEŞMENİN KONUSU VE KAPSAMI</h4>
                <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait web sitesi üzerinden elektronik ortamda siparişini verdiği mimari yapı malzemelerinin (Boya, parke, çıta, panel, batarya vb.) satışı ve teslimi ile isteğe bağlı montaj ve anahtar teslim tadilat taahhüt işlerinin ifasına ilişkin hak ve yükümlülüklerin belirlenmesidir.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">MADDE 3 — TESLİMAT, İFA VE HAKEDİŞ MODELİ</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-600">
                  <li><strong>Yalnızca Malzeme Satışı:</strong> Ürünler orijinal ambalajında anlaşmalı kargo veya şehirlerarası ambar ile ALICI'nın bildirdiği adrese teslim edilir.</li>
                  <li><strong>Tadilat & Montaj Hizmetleri:</strong> İş bedeli hakediş modeliyle yürütülür; sözleşme başlangıcı, malzemenin sahaya inişi ve nihai mimari checklist teslim onayı aşamalarında kademeli olarak tahsil edilir.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">MADDE 4 — CAYMA HAKKI VE İSTİSNALARI</h4>
                <p>ALICI, standart fabrika ürünlerinde teslim tarihinden itibaren 14 gün içinde cayma hakkına sahiptir. Ancak Tüketicinin Korunması Hakkında Kanun'un 15. maddesi uyarınca; <strong>ALICI'nın isteği veya açıkça kişisel ihtiyaçları doğrultusunda özel ölçüde kesilen ahşap çıtalar, özel renklendirilen boyalar ve montajı tamamlanmış sabit mobilyalarda cayma hakkı kullanılamaz.</strong></p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">MADDE 5 — UYUŞMAZLIKLARIN ÇÖZÜMÜ</h4>
                <p>İşbu sözleşmeden doğacak uyuşmazlıklarda Ticaret Bakanlığı'nca ilan edilen parasal sınırlar dahilinde ALICI'nın yerleşim yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.</p>
              </div>
            </div>
          )}

          {/* TAB 2: ÖN BİLGİLENDİRME FORMU */}
          {activeTab === 'onbilgi' && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B]">ÖN BİLGİLENDİRME FORMU</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Sipariş Onayı Öncesi Yasal Bilgilendirme</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">1. SATICI BİLGİLERİ</h4>
                <p>Unvan: {companyName}<br />
                Telefon: {supportPhone} • Adres: İstanbul / Türkiye</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">2. SÖZLEŞME KONUSU MAL VEYA HİZMETİN TEMEL NİTELİKLERİ</h4>
                <p>Platformda seçilen malzemelerin cinsi, türü, miktarı, rengi, marka ve modeli sepet özetinde ve proforma dokümanında yer aldığı gibidir. Tüm fiyatlar bireysel tüketiciler için KDV dahil net tutardır.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">3. TESLİMAT VE KARGO</h4>
                <p>Doğrudan malzeme siparişleri 1-4 iş günü içinde kargoya verilir. Paletli ve ağır sevkiyatlarda ambar bina önüne teslimat yapar. Montajlı tadilat işlerinde teslim süresi proforma teklifinde belirtilen iş günü takvimine bağlıdır.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">4. GEÇERLİLİK SÜRESİ</h4>
                <p>Sitede ilan edilen birim fiyatlar ve kampanyalar güncelleme yapılana kadar geçerlidir. Süreli kampanyalarda belirtilen süre sonuna kadar fiyat sabitleme güvencesi sunulur.</p>
              </div>
            </div>
          )}

          {/* TAB 3: KVKK VE GİZLİLİK POLİTİKASI */}
          {activeTab === 'kvkk' && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B]">KVKK AYDINLATMA METNİ VE GİZLİLİK POLİTİKASI</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">1. VERİ SORUMLUSU</h4>
                <p>{companyName} olarak kişisel verilerinizin güvenliğine en üst seviyede önem veriyoruz.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">2. İŞLENEN KİŞİSEL VERİLER VE İŞLENME AMAÇLARI</h4>
                <p>Ad, soyad, telefon numarası, il/ilçe ve açık teslimat adresi bilgileriniz; keşif randevularının organize edilmesi, faturalandırma işlemlerinin yapılması, kargo sevkiyatının sağlanması ve sözleşmesel taahhütlerin yerine getirilmesi amacıyla sınırlı olarak işlenir.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">3. KİŞİSEL VERİLERİN AKTARIMI</h4>
                <p>Kişisel verileriniz, yalnızca siparişinizin ifası için zorunlu olan anlaşmalı kargo/lojistik firmaları, mali mevzuat gereği yetkili kamu kurumları ve SMS bildirim servis sağlayıcıları ile paylaşılır. Verileriniz üçüncü şahıslara ticari amaçla asla satılmaz.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">4. HAKLARINIZ (MADDE 11)</h4>
                <p>KVKK'nın 11. maddesi gereğince verilerinizin silinmesini, düzeltilmesini veya işlenip işlenmediğini öğrenmeyi {supportPhone} numaralı destek hattımız üzerinden her zaman talep edebilirsiniz.</p>
              </div>
            </div>
          )}

          {/* TAB 4: İPTAL VE İADE KOŞULLARI */}
          {activeTab === 'iade' && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B]">İPTAL, İADE VE DEĞİŞİM KOŞULLARI</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">RVOBA® Tüketici Hakları ve Malzeme İade Prosedürü</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">1. STANDART ÜRÜNLERDE İADE (14 GÜN)</h4>
                <p>Ambalajı açılmamış, orijinal kolisinde zarar görmemiş standart kutulu malzemeler (Örn: kapalı kutu bataryalar, açılmamış boya astarları) teslim tarihinden itibaren 14 gün içinde faturasıyla birlikte koşulsuz iade edilebilir.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">2. ÖZEL İMALAT VE CAYMA HAKKI İSTİSNALARI</h4>
                <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-600">
                  <li>Müşteri talebine özel Renk Ustası makinesinde renklendirilen boyalar,</li>
                  <li>Duvar ölçüsüne özel kesilmiş ve gönyelenmiş poliüretan çıta setleri,</li>
                  <li>Müşterinin seçtiği ebatta özel preslenen akustik ahşap TV panellerinde cayma hakkı geçerli değildir.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">3. HASARLI / KIRIK TESLİMAT BİLDİRİMİ</h4>
                <p>Kargo veya ambar teslimatı sırasında kolide yırtık, ezik veya hasar tespit edilmesi halinde kargo görevlisine "Hasar Tespit Tutanağı" tutturulmalı ve derhal {supportPhone} üzerinden müşteri hizmetlerimize iletilmelidir. Hasarlı ürün bedelsiz yenisiyle değiştirilir.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0A0A0B] mb-1">4. İADE ÜCRETİNİN GERİ ÖDENMESİ</h4>
                <p>İade edilen ürünün depomuza ulaşması ve kontrolünden sonra azami 3 iş günü içinde ödeme yapılan kredi kartına veya IBAN hesabına kesintisiz iade işlemi gerçekleştirilir.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8EAED] bg-[#FBFBFC] flex items-center justify-between text-xs text-[#64748B]">
          <span>Sorularınız için: <strong>{supportPhone}</strong></span>
          <button
            onClick={onClose}
            className="btn-pill-black text-xs py-2 px-5"
          >
            Anladım / Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
