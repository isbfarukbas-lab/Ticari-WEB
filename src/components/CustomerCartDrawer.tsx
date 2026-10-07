import React from 'react';
import { 
  X, 
  Trash2, 
  ArrowUpRight, 
  Send, 
  Calendar, 
  Printer, 
  ShieldCheck, 
  TrendingDown,
  Camera,
  FileText,
  Truck
} from 'lucide-react';
import { CartItem } from '../types';
import { LegalTabKey } from './CustomerLegalModal';

interface CustomerCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  onOpenInspection: () => void;
  onOpenProforma: () => void;
  onOpenLegal?: (tab: LegalTabKey) => void;
  phoneNumber?: string;
  selectedCity?: string;
  selectedDistrict?: string;
  estimatedDays?: { min: number; max: number };
  kdvNotice?: string;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onOpenInspection,
  onOpenProforma,
  onOpenLegal,
  phoneNumber = '905550000000',
  selectedCity,
  selectedDistrict,
  estimatedDays,
  kdvNotice,
}) => {
  if (!isOpen) return null;

  // Standard items calculation
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

  // Distinguish between pure material orders vs renovation service
  const hasRenovationItems = cart.some((item) => 
    item.isCustom || (item.product && item.purchaseType !== 'material_only')
  );
  const isMaterialOnlyCart = cart.length > 0 && !hasRenovationItems;

  // Estimated market price total for comparison
  const marketTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const base = item.purchaseType === 'material_only'
      ? item.product.materialPrice
      : item.product.materialPrice + item.product.workmanshipPrice;
    const market = item.product.marketPrice || Math.round(base * 1.35);
    return sum + market * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, marketTotal - grandTotal);

  // Generate WhatsApp message with all choices and custom notes
  const handleWhatsApp = () => {
    if (cart.length === 0) return;

    let msg = isMaterialOnlyCart
      ? `*RVOBA® — Online Malzeme Sipariş Talebi (rvoba.com)*\n\n`
      : `*RVOBA® — Online Tadilat & Keşif Talebi (rvoba.com)*\n\n`;

    if (isMaterialOnlyCart) {
      msg += `🚚 *Teslimat Şekli:* Tüm Türkiye'ye Kapıya Teslim Kargo / Ambar Sevk\n`;
    } else {
      if (selectedCity && selectedDistrict) {
        msg += `📍 *Hizmet Lokasyonu:* ${selectedCity} / ${selectedDistrict}\n`;
      }
      if (estimatedDays) {
        msg += `⏱️ *Tahmini Teslimat Süresi:* ${estimatedDays.min} - ${estimatedDays.max} İş Günü\n`;
      }
    }
    msg += `\n`;
    
    // Standard products
    const standardItems = cart.filter((c) => !c.isCustom && c.product);
    if (standardItems.length > 0) {
      msg += `📋 *SEÇİLEN KALEMLER VE ÜRÜNLER:*\n`;
      standardItems.forEach((c, idx) => {
        if (!c.product) return;
        const isMaterialOnly = c.purchaseType === 'material_only';
        const line = isMaterialOnly 
          ? c.product.materialPrice * c.quantity 
          : (c.product.materialPrice + c.product.workmanshipPrice) * c.quantity;
        const isLaborOnly = c.product.id.startsWith('labor-');
        const isOnSite = c.product.id.startsWith('onsite-');

        if (isMaterialOnly) {
          msg += `${idx + 1}. *${c.product.brand} - ${c.product.name}*\n`;
          msg += `   • Durum: [Doğrudan Ürün Satışı / Kargo Teslim]\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit}\n`;
          msg += `   • Tutar: ${line.toLocaleString('tr-TR')} ₺ (Toptan Bayi Fiyatı)\n\n`;
        } else if (isLaborOnly) {
          msg += `${idx + 1}. *${c.product.name}*\n`;
          msg += `   • Durum: [Elimde Malzeme Var — Yalnızca Usta İşçiliği]\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit} (${c.roomType})\n`;
          msg += `   • Tutar: ${line.toLocaleString('tr-TR')} ₺ (Malzeme: 0 ₺ | İşçilik Dahil)\n\n`;
        } else if (isOnSite) {
          msg += `${idx + 1}. *${c.product.name}*\n`;
          msg += `   • Durum: [Model Keşifte Canlı Karteladan Belirlenecek]\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit} (${c.roomType})\n`;
          msg += `   • Tahmini Bütçe: ${line.toLocaleString('tr-TR')} ₺\n\n`;
        } else {
          msg += `${idx + 1}. *${c.product.brand} - ${c.product.name}*\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit} (${c.roomType})\n`;
          msg += `   • Kod: ${c.product.code}\n`;
          msg += `   • Kalem Tutarı: ${line.toLocaleString('tr-TR')} ₺ (Malzeme + İşçilik Dahil)\n\n`;
        }
      });
    }

    // Custom requests & uploaded photos
    const customItems = cart.filter((c) => c.isCustom && c.customData);
    if (customItems.length > 0) {
      msg += `📷 *ÖZEL İSTEKLER VE MÜŞTERİ NOTLARI:*\n`;
      customItems.forEach((c, idx) => {
        if (!c.customData) return;
        msg += `${idx + 1}. *${c.customData.title}* (${c.customData.roomType})\n`;
        msg += `   • Not: "${c.customData.description}"\n`;
        if (c.customData.photoDataUrl) {
          msg += `   • [Müşteri Örnek/Hasarlı Fotoğraf Yükledi]\n`;
        }
        msg += `\n`;
      });
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *RVOBA NET TOPLAM:* ${grandTotal.toLocaleString('tr-TR')} ₺\n`;
    if (totalSavings > 0) {
      msg += `📉 *Piyasa Tasarrufunuz:* -${totalSavings.toLocaleString('tr-TR')} ₺ (Toptan Bayi Avantajı)\n`;
    }
    msg += `✓ *${kdvNotice || 'KDV dahil net tutardır.'}*\n`;
    
    if (isMaterialOnlyCart) {
      msg += `📦 *Kargo teslimat ve fatura bilgilerimi ileterek siparişimi tamamlamak istiyorum.*`;
    } else {
      msg += `🛡️ *Tek Kurumsal Muhatap & Sözleşmeli Sabit Bütçe*\n\n`;
      msg += `Bu sepet ve tadilat talebim hakkında mimarınızla görüşmek istiyorum.`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBFBFC] text-[#0A0A0B] border-l border-[#E8EAED] flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E8EAED] flex items-center justify-between bg-white">
            <div>
              <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                {isMaterialOnlyCart ? '📦 Malzeme Sipariş Sepeti' : '🏡 Mimari Tadilat Teklifi'}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {cart.length > 0 
                  ? isMaterialOnlyCart 
                    ? `${cart.length} Kalem • 81 İl Kargo ile Kapıya Teslim (Usta Hariç)`
                    : `${cart.length} Kalem • Malzeme + Uzman İşçilik Dahil`
                  : 'Sepetiniz henüz boş'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-[#64748B] text-xs">
                <p>Sepetinizde ürün bulunmuyor.</p>
                <p className="mt-1">Katalogdan boya veya parke seçebilir, ya da özel istek ekleyebilirsiniz.</p>
              </div>
            ) : (
              <>
                {/* Savings Banner */}
                {totalSavings > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#0A0A0B] text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-[11px] text-slate-300">Piyasaya Göre Tasarrufunuz:</div>
                        <div className="text-sm font-black font-mono text-emerald-400">
                          -{totalSavings.toLocaleString('tr-TR')} ₺ Kazanç
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                      Toptan Bayi
                    </span>
                  </div>
                )}

                {/* Guarantee Reminder (Context-aware) */}
                {isMaterialOnlyCart ? (
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 shadow-sm text-xs text-blue-900">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-blue-950">📦 Kargo & Ambar ile Kapıya Teslim:</strong> Ürünler orijinal ambalajında ve faturalı olarak tüm Türkiye'ye kapınıza sevk edilir.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-white border border-[#E8EAED] flex items-start gap-2.5 shadow-sm text-xs text-[#4B5563]">
                    <ShieldCheck className="w-4 h-4 text-[#0A0A0B] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#0A0A0B]">Usta ile sıfır temas:</strong> Tüm süreci İç Mimarımız yönetir. Sözleşme şartları onaylanmadan 1 TL dahi ödemezsiniz.
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => {
                    // Custom Request Card
                    if (item.isCustom && item.customData) {
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-white border-2 border-dashed border-[#CBD5E1] relative space-y-3 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            {item.customData.photoDataUrl ? (
                              <img
                                src={item.customData.photoDataUrl}
                                alt="Özel İstek"
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E8EAED]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] text-[#0A0A0B] flex items-center justify-center shrink-0 border border-[#E8EAED]">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}

                            <div className="flex-1 pr-6">
                              <span className="text-[10px] font-bold text-orange-600 uppercase">
                                ÖZEL İSTEK • {item.customData.roomType}
                              </span>
                              <h4 className="text-xs font-bold text-[#0A0A0B] mt-0.5 leading-snug">
                                {item.customData.title}
                              </h4>
                              <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed italic">
                                "{item.customData.description}"
                              </p>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="absolute top-3.5 right-3.5 text-[#94A3B8] hover:text-red-500 transition"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="pt-2 border-t border-[#F1F3F5] text-[11px] text-slate-500 flex items-center justify-between">
                            <span>Mimar keşifte yerinde fiyatlandıracak</span>
                            <span className="font-bold text-[#0A0A0B]">Keşfe Dahil</span>
                          </div>
                        </div>
                      );
                    }

                    // Standard Product Card
                    if (!item.product) return null;
                    const isLaborOnly = item.product.id.startsWith('labor-');
                    const isOnSite = item.product.id.startsWith('onsite-');
                    const lineUnit = item.product.materialPrice + item.product.workmanshipPrice;
                    const lineTotal = lineUnit * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white border border-[#E8EAED] relative space-y-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#E8EAED]"
                          />

                          <div className="flex-1 pr-6">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#64748B] uppercase">
                                {item.product.brand} • {item.roomType}
                              </span>
                              {isLaborOnly && (
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                                  Sadece İşçilik (Malzeme 0 ₺)
                                </span>
                              )}
                              {isOnSite && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                                  Keşifte Canlı Seçim
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-[#0A0A0B] mt-0.5 leading-snug">
                              {item.product.name}
                            </h4>
                            <div className="text-[11px] font-mono text-[#64748B]">
                              Kod: {item.product.code}
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="absolute top-3.5 right-3.5 text-[#94A3B8] hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F5]">
                          <div className="flex items-center gap-1.5 bg-[#F8F9FA] rounded-full p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full bg-white text-xs font-bold text-[#0A0A0B] shadow-sm flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold font-mono px-2 text-[#0A0A0B]">
                              {item.quantity} {item.product.unit}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full bg-white text-xs font-bold text-[#0A0A0B] shadow-sm flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right font-mono font-extrabold text-sm text-[#0A0A0B]">
                            {lineTotal.toLocaleString('tr-TR')} ₺
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <div className="text-right pt-1">
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-[#94A3B8] hover:text-red-500 transition"
                  >
                    Sepeti Boşalt
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Totals & Conversion Actions */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8EAED] bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-[#4B5563]">
                <div className="flex justify-between">
                  <span>Toplam Malzeme:</span>
                  <span className="font-mono font-semibold text-[#0A0A0B]">{totalMaterial.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span>Uygulama & İşçilik:</span>
                  <span className="font-mono font-semibold text-[#0A0A0B]">+{totalLabor.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="pt-2 border-t border-[#E8EAED] flex justify-between items-baseline text-base font-extrabold text-[#0A0A0B]">
                  <span>GENEL TOPLAM:</span>
                  <span className="font-mono text-xl font-black">{grandTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                  <span>✓ {kdvNotice || 'KDV dahil net tutardır.'}</span>
                </div>
              </div>

              {/* Info Badge (Different for Material vs Renovation) */}
              {isMaterialOnlyCart ? (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kargo & Ambar Sevkiyatı:</strong> Seçtiğiniz ürünler faturalı ve orijinal garantili olarak kapınıza sevk edilir. Usta montajı dahil değildir.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] text-[11px] text-[#4B5563] flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hakediş Güvencesi:</strong> Ödemenin tamamı baştan alınmaz. Malzeme sahaya indiğinde ve Mimari Teslim Onayınızdan sonra bakiye tamamlanır.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {isMaterialOnlyCart ? (
                  <>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full btn-pill-black justify-center py-3.5 text-xs shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp ile Sipariş Ver (Kargo Adresi İlet)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenInspection();
                      }}
                      className="w-full btn-pill-outline justify-center py-2.5 text-xs text-[#4B5563]"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Bu Ürünler İçin Usta Keşfi de İste</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInspection();
                      }}
                      className="w-full btn-pill-black justify-center py-3.5 text-xs shadow-md"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ücretsiz Mimari Keşif Randevusu Al</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleWhatsApp}
                      className="w-full btn-pill-outline justify-center py-3 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp ile Teklifi İlet & Mimar İle Görüş</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onOpenProforma();
                  }}
                  className="w-full text-center text-xs text-[#64748B] hover:text-[#0A0A0B] transition pt-1 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Resmi Proforma Teklifini Yazdır / PDF İndir</span>
                </button>

                {onOpenLegal && (
                  <div className="text-[10px] text-[#94A3B8] text-center pt-2 leading-relaxed">
                    Sipariş veya keşif talebi oluşturarak{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('sozlesme')}
                      className="underline hover:text-[#0A0A0B] font-medium"
                    >
                      Mesafeli Satış Sözleşmesi
                    </button>
                    'ni ve{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('kvkk')}
                      className="underline hover:text-[#0A0A0B] font-medium"
                    >
                      KVKK Şartları
                    </button>
                    'nı kabul etmiş sayılırsınız.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
