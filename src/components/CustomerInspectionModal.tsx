import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowUpRight, CheckCircle2, ShieldCheck, TrendingDown, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, LeadRequest, ServiceArea, CustomerUser } from '../types';

interface CustomerInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser?: CustomerUser | null;
  onSaveLead: (lead: LeadRequest) => void;
  phoneNumber?: string;
  selectedCity?: string;
  selectedDistrict?: string;
  serviceAreas?: ServiceArea[];
}

export const CustomerInspectionModal: React.FC<CustomerInspectionModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onSaveLead,
  phoneNumber = '905550000000',
  selectedCity = 'İstanbul',
  selectedDistrict = 'Kadıköy',
  serviceAreas = [],
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(selectedCity);
  const [district, setDistrict] = useState(selectedDistrict);
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('13:00 - 17:00');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        if (!fullName) setFullName(currentUser.fullName);
        if (!phone) setPhone(currentUser.phone);
        if (currentUser.city) setCity(currentUser.city);
        if (currentUser.district) setDistrict(currentUser.district);
        const defaultAddr = currentUser.addresses?.find(a => a.isDefault)?.fullAddress || currentUser.addresses?.[0]?.fullAddress;
        if (!address && defaultAddr) setAddress(defaultAddr);
      } else {
        if (selectedCity) setCity(selectedCity);
        if (selectedDistrict) setDistrict(selectedDistrict);
      }
    }
  }, [isOpen, currentUser, selectedCity, selectedDistrict]);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const isMaterialOnly = item.purchaseType === 'material_only';
    const line = isMaterialOnly
      ? item.product.materialPrice * item.quantity
      : (item.product.materialPrice + item.product.workmanshipPrice) * item.quantity;
    return sum + line;
  }, 0);

  const marketTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const base = item.purchaseType === 'material_only'
      ? item.product.materialPrice
      : item.product.materialPrice + item.product.workmanshipPrice;
    const market = item.product.marketPrice || Math.round(base * 1.35);
    return sum + market * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, marketTotal - totalAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    const isAllStoreItems = cart.length > 0 && cart.every((c) => c.purchaseType === 'material_only');

    const newLead: LeadRequest = {
      id: `lead-${Date.now()}`,
      customerId: currentUser?.id,
      fullName,
      phone,
      city,
      district,
      address,
      preferredDate,
      timeSlot,
      totalAmount,
      marketTotalAmount: marketTotal,
      savingsAmount: totalSavings,
      status: 'bekliyor',
      leadType: isAllStoreItems ? 'store_order' : 'kesif',
      items: cart.map((c) => {
        if (c.isCustom && c.customData) {
          return {
            name: c.customData.title,
            brand: 'Özel İstek',
            quantity: 1,
            unit: 'adet',
            total: 0,
            isCustom: true,
            photoDataUrl: c.customData.photoDataUrl,
            customNote: c.customData.description,
          };
        }
        const isMaterialOnly = c.purchaseType === 'material_only';
        const lineTotal = c.product
          ? (isMaterialOnly ? c.product.materialPrice : c.product.materialPrice + c.product.workmanshipPrice) * c.quantity
          : 0;

        return {
          name: c.product?.name || 'Ürün',
          brand: c.product?.brand || 'Marka',
          quantity: c.quantity,
          unit: c.product?.unit || 'adet',
          total: lineTotal,
          purchaseType: c.purchaseType,
        };
      }),
      createdAt: new Date().toISOString(),
    };

    onSaveLead(newLead);
    setSubmitted(true);

    // WhatsApp Notification
    let msg = `*YENİ ÜCRETSİZ KEŞİF TALEBİ — RVOBA® (rvoba.com)*\n\n`;
    msg += `👤 *Müşteri:* ${fullName}\n`;
    msg += `📞 *Telefon:* ${phone}\n`;
    msg += `📍 *Konum:* ${city} / ${district}\n`;
    if (address) msg += `🏠 *Adres:* ${address}\n`;
    msg += `📅 *İstenen Gün:* ${preferredDate || 'En Kısa Sürede'} (${timeSlot})\n`;
    msg += `💰 *Sepet Tutarı:* ${totalAmount.toLocaleString('tr-TR')} ₺\n`;
    if (totalSavings > 0) {
      msg += `📉 *Tasarruf Tutarı:* -${totalSavings.toLocaleString('tr-TR')} ₺\n`;
    }

    const customCount = cart.filter((c) => c.isCustom).length;
    if (customCount > 0) {
      msg += `📷 *Özel İstek:* Müşteri ${customCount} adet özel istek/fotoğraf ekledi.\n`;
    }

    const encoded = encodeURIComponent(msg);
    setTimeout(() => {
      window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white border border-[#E8EAED] rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B]">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-extrabold text-[#0A0A0B]">
              Keşif Randevunuz Alındı!
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              İç mimarımız geniş renk ve malzeme kartelalarıyla adresinize gelerek lazer ölçümle net metrajınızı çıkaracaktır. Şartları onaylarsanız sözleşmeyle başlar; onaylamazsanız hiçbir ücret ödemezsiniz.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="btn-pill-black text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0B] text-white text-[10px] font-bold mb-1">
                <span>ÜCRETSİZ LAZER ÖLÇÜM</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#0A0A0B] mt-0.5">
                Lazer Keşif Randevusu Alın
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                İç mimarımız yerinde net ölçü alsın, kesin sabit fiyatlı sözleşmenizi hazırlasın.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Adınız Soyadınız *</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                />
              </div>

              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Telefon Numaranız *</label>
                <input
                  type="tel"
                  required
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Şehir *</label>
                {serviceAreas.length > 0 ? (
                  <select
                    value={city}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setCity(newCity);
                      const area = serviceAreas.find((a) => a.city === newCity);
                      if (area && area.districts.length > 0) {
                        setDistrict(area.districts[0]);
                      }
                    }}
                    className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                  >
                    {serviceAreas.map((a) => (
                      <option key={a.city} value={a.city}>{a.city}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                  />
                )}
              </div>

              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">İlçe *</label>
                {(() => {
                  const currentArea = serviceAreas.find((a) => a.city === city);
                  if (currentArea && currentArea.districts.length > 0) {
                    return (
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                      >
                        {currentArea.districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    );
                  }
                  return (
                    <input
                      type="text"
                      required
                      placeholder="Kadıköy, Beşiktaş..."
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                    />
                  );
                })()}
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[#4B5563] font-semibold mb-1">Açık Adres</label>
              <input
                type="text"
                placeholder="Mahalle, sokak, bina ve daire no..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Tercih Edilen Gün</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                />
              </div>

              <div>
                <label className="block text-[#4B5563] font-semibold mb-1">Saat Dilimi</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
                >
                  <option value="09:00 - 12:00">Sabah (09:00 - 12:00)</option>
                  <option value="13:00 - 17:00">Öğleden Sonra (13:00 - 17:00)</option>
                  <option value="17:00 - 20:00">Akşamüstü (17:00 - 20:00)</option>
                </select>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full btn-pill-black justify-center py-3.5 text-xs shadow-md"
              >
                <span>Randevuyu Onayla & Mimarımıza İlet</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
