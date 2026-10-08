import React from 'react';
import { X, Printer, ShieldCheck, Clock, MapPin, CheckCircle2, CreditCard, Truck, RotateCcw, PackageCheck } from 'lucide-react';
import { CartItem, SiteSettings } from '../types';

interface CustomerProformaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings?: SiteSettings;
  city?: string;
  district?: string;
  deliveryDays?: { min: number; max: number };
}

export const CustomerProformaModal: React.FC<CustomerProformaModalProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  city = 'İstanbul',
  district = 'Kadıköy',
  deliveryDays = { min: 10, max: 14 },
}) => {
  if (!isOpen) return null;

  const quoteNo = `RV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Determine whether this cart is pure store material retail or a turnkey renovation project
  const hasRenovationItems = cart.some(
    (item) => item.isCustom || (item.product && item.purchaseType !== 'material_only')
  );
  const isPureStoreOrder = !hasRenovationItems;

  const totalMaterial = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    return sum + item.product.materialPrice * item.quantity;
  }, 0);

  const totalLabor = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    if (item.purchaseType === 'material_only') return sum;
    return sum + item.product.workmanshipPrice * item.quantity;
  }, 0);

  const grandTotal = totalMaterial + totalLabor;

  const p1 = settings?.paymentStages?.stage1Percent || 35;
  const p2 = settings?.paymentStages?.stage2Percent || 40;
  const p3 = settings?.paymentStages?.stage3Percent || 25;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity print:hidden"
      />

      <div className="relative w-full max-w-4xl bg-white text-[#0A0A0B] rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden print:m-0 print:max-h-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Top Action Bar (Screen only) */}
        <div className="p-4 bg-[#0A0A0B] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">
              {isPureStoreOrder ? 'Resmi Proforma Sipariş Formu' : 'Resmi Proforma Teklif Önizlemesi'}
            </span>
            <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full font-medium">
              {isPureStoreOrder ? 'E-Ticaret Malzeme Satışı' : 'Sözleşmeli Sabit Bütçe'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0A0A0B] text-xs font-bold transition hover:bg-slate-200 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-6 text-xs text-slate-800 font-sans print:p-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-[#0A0A0B] pb-6 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-3xl tracking-tighter text-[#0A0A0B]">
                  RVOBA
                </span>
                <span className="text-xs font-bold text-[#0A0A0B] -mt-3">®</span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {settings?.companyName || 'RVOBA® Mimarlık ve Yapı Çözümleri A.Ş.'}
              </p>
              <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>Destek: <strong className="text-slate-800 font-mono">{settings?.supportPhone || '0544 768 51 37'}</strong></span>
                <span>•</span>
                {isPureStoreOrder ? (
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <Truck className="w-3 h-3 text-emerald-600" />
                    Sevkiyat: Sigortalı Kargo / Ambar ile Adrese Teslim
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    Hizmet Bölgesi: {city} / {district}
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-900 border border-slate-300">
                PROFORMA NO: {quoteNo}
              </span>
              <div className="text-[11px] text-slate-500 mt-1.5 font-medium">Tarih: {dateStr}</div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-200">
                <Clock className="w-3 h-3" />
                <span>
                  {isPureStoreOrder ? 'Tahmini Kargo Sevk: 2 - 4 İş Günü' : `Teslimat: ${deliveryDays.min} - ${deliveryDays.max} İş Günü`}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Items */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Ürün / Malzeme Adı & Kodu</th>
                {isPureStoreOrder ? (
                  <>
                    <th className="py-2.5 px-3">Kapsam / Paket</th>
                    <th className="py-2.5 px-3 text-center">Sipariş Miktarı</th>
                    <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                    <th className="py-2.5 px-3 text-right">Toplam Tutar</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3">Mekan</th>
                    <th className="py-2.5 px-3 text-center">Miktar</th>
                    <th className="py-2.5 px-3 text-right">Malzeme Bedeli</th>
                    <th className="py-2.5 px-3 text-right">Uygulama & İşçilik</th>
                    <th className="py-2.5 px-3 text-right">Toplam Tutar</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cart.map((item, idx) => {
                if (item.isCustom && item.customData) {
                  return (
                    <tr key={item.id} className="bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900" colSpan={isPureStoreOrder ? 2 : 2}>
                        <span className="text-[10px] font-bold text-slate-700 mr-1.5">[ÖZEL İSTEK]</span>
                        {item.customData.title} ({item.customData.roomType})
                        <div className="text-[10px] text-slate-500 font-normal italic">
                          "{item.customData.description}"
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">1 adet</td>
                      <td className="py-2.5 px-3 text-right" colSpan={isPureStoreOrder ? 2 : 3}>
                        <span className="text-slate-500 italic">Keşifte netleştirilecek</span>
                      </td>
                    </tr>
                  );
                }

                if (!item.product) return null;
                const isLaborOnly = item.product.id.startsWith('labor-');
                const isMaterialOnly = item.purchaseType === 'material_only';
                const line = isMaterialOnly 
                  ? item.product.materialPrice * item.quantity 
                  : (item.product.materialPrice + item.product.workmanshipPrice) * item.quantity;

                if (isPureStoreOrder) {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div>
                          {item.product.brand} - {item.product.name}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Ürün Kodu: {item.product.code}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.product.packageInfo || `1 ${item.product.unit}`}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {item.quantity} {item.product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {item.product.materialPrice.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {line.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>
                        {item.product.brand} - {item.product.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-slate-400 font-mono">Kod: {item.product.code}</span>
                        {isMaterialOnly && (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded">
                            Sadece Malzeme
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.roomType}</td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {item.quantity} {item.product.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {isLaborOnly ? '0 ₺' : `${(item.product.materialPrice * item.quantity).toLocaleString('tr-TR')} ₺`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {isMaterialOnly ? '0 ₺' : `${(item.product.workmanshipPrice * item.quantity).toLocaleString('tr-TR')} ₺`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {line.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Subtotals & Grand Total */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-2">
            <div className="flex-1 space-y-2">
              {/* KDV Statement */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isPureStoreOrder 
                    ? '%100 Orijinal Üretici Bayi Faturalı & KDV Dahil Net Fiyatlar'
                    : (settings?.kdvNotice || 'Fiyatlarımız bireysel müşterilerimiz için anahtar teslim KDV dahil net tutardır.')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isPureStoreOrder 
                  ? '* Belirtilen tutarlar KDV dahil net fatura bedelidir. Siparişiniz doğrudan yetkili üretici bayi deposundan adınıza düzenlenen fatura ile sevk edilir.'
                  : '* Belirtilen bütçe kesinleşmiş sabit sözleşme bütçesidir. Ücretsiz lazer keşifte net metrajlar doğrulanır ve ekstra sürpriz masraf çıkarılmaz.'}
              </p>
            </div>

            <div className="w-full sm:w-80 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2 text-xs shrink-0">
              <div className="flex justify-between text-slate-600">
                <span>1. Sınıf Malzeme Toplamı:</span>
                <span className="font-mono font-bold">{totalMaterial.toLocaleString('tr-TR')} ₺</span>
              </div>

              {isPureStoreOrder ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Kargo & Ambar Sevkiyatı:</span>
                    <span className="font-bold text-emerald-700">Ücretsiz (3.000 ₺ Üzeri)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>KDV Durumu:</span>
                    <span className="font-bold text-slate-800">%20 KDV Dahil</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>Uzman Uygulama & İşçilik:</span>
                  <span className="font-mono font-bold">+{totalLabor.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}

              <div className="pt-2.5 border-t border-slate-300 flex justify-between font-black text-base text-slate-900">
                <span>{isPureStoreOrder ? 'NET SİPARİŞ TUTARI:' : 'NET BÜTÇE:'}</span>
                <span className="font-mono">{grandTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </div>

          {/* CONDITIONAL BOTTOM SECTION: */}
          {/* If Pure Store Order: Render E-Commerce Consumer & Delivery Guarantees */}
          {/* If Turnkey Renovation: Render 3-Stage Progress Payment (Hakediş) Schedule */}
          {isPureStoreOrder ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>RVOBA® Online Sipariş & Tüketici Güvenceleri</span>
                </h5>
                <span className="text-[10px] text-slate-500 font-medium">
                  Tüm siparişler doğrudan kurumsal güvencemiz altındadır.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                    <span>12 Taksit İmkanı</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Tüm kredi kartlarına vade farksız veya uygun vadeli taksit imkanı.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>%100 Orijinal & Faturalı</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Yetkili bayi garantili, adınıza kesilmiş resmi e-fatura ile teslimat.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                    <span>14 Gün İade Hakkı</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Açılmamış orijinal ambalajında hasarsız ürünler için yasal iade hakkı.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-700" />
                    <span>Sigortalı Sevkiyat</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Kargo ve ambar taşıma sürecindeki tüm hasarlar firmamız sorumluluğundadır.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3 Aşamalı Korumalı Hakediş Ödeme Planı</span>
                </h5>
                <span className="text-[10px] text-slate-500 font-medium">
                  Paranızı iş bitmeden ve onaylamadan riske atmazsınız.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    1. Aşama: %{p1} Peşinat
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5 text-xs">
                    Sözleşme & Malzeme Tedariki
                  </div>
                  <div className="font-mono font-black text-sm text-slate-900 mt-2">
                    {Math.round(grandTotal * (p1 / 100)).toLocaleString('tr-TR')} ₺
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Sözleşme imzası ve malzemelerin adrese sevkinde.</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    2. Aşama: %{p2} Ara Hakediş
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5 text-xs">
                    Uygulama & Kaba Teslim
                  </div>
                  <div className="font-mono font-black text-sm text-slate-900 mt-2">
                    {Math.round(grandTotal * (p2 / 100)).toLocaleString('tr-TR')} ₺
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Kırım, zemin hazırlığı ve montaj aşamalarında.</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border-2 border-emerald-300 shadow-sm bg-emerald-50/20">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    3. Aşama: %{p3} Mimari Onay
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5 text-xs">
                    Eksiksiz Teslimat & Onayınız
                  </div>
                  <div className="font-mono font-black text-sm text-emerald-700 mt-2">
                    {Math.round(grandTotal * (p3 / 100)).toLocaleString('tr-TR')} ₺
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Mimarınızla evi gezip onay verdiğinizde ödenir.</p>
                </div>
              </div>
            </div>
          )}

          {/* Official Signatures strip for Print */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-8 border-t border-slate-300 mt-8">
            <div className="text-center space-y-12">
              <div className="text-xs font-bold text-slate-700">
                {isPureStoreOrder ? 'SİPARİŞ VEREN MÜŞTERİ' : 'MÜŞTERİ ONAYI'}
              </div>
              <div className="border-b border-slate-300 w-48 mx-auto" />
              <div className="text-[10px] text-slate-400">İmza / Tarih</div>
            </div>
            <div className="text-center space-y-12">
              <div className="text-xs font-bold text-slate-700">
                {isPureStoreOrder ? 'RVOBA® TİCARET & SEVKİYAT ONAYI' : 'RVOBA® MİMARLIK KAŞE & İMZA'}
              </div>
              <div className="border-b border-slate-300 w-48 mx-auto" />
              <div className="text-[10px] text-slate-400">
                {isPureStoreOrder ? 'Yetkili Sevk Onayı' : 'Yetkili Mimar Onayı'}
              </div>
            </div>
          </div>

          {/* Guarantees Footer */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong>Kurumsal Güvenceler:</strong>{' '}
              {isPureStoreOrder 
                ? 'Doğrudan Bayi Fiyatı • Orijinal Faturalı Ürün • Güvenli Ödeme • 14 Gün İade' 
                : 'Tek Kurumsal Muhatap • Toptan Bayi Fiyatı • Sözleşmeli Sabit Bütçe • Mimari Teslim Onayı'}
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              rvoba.com
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
