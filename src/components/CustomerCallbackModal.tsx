import React, { useState } from 'react';
import { X, Phone, CheckCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { CartItem, LeadRequest } from '../types';

interface CustomerCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  activeRoom: string;
  defaultSqM: number;
  onSaveLead: (lead: LeadRequest) => void;
  selectedCity?: string;
  selectedDistrict?: string;
}

export const CustomerCallbackModal: React.FC<CustomerCallbackModalProps> = ({
  isOpen,
  onClose,
  cart,
  activeRoom,
  defaultSqM,
  onSaveLead,
  selectedCity = 'İstanbul',
  selectedDistrict = 'Kadıköy',
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('13:00 - 17:00 (Öğleden Sonra)');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Lütfen Ad Soyad ve Telefon numaranızı girin.');
      return;
    }

    const leadItems = cart.map((c) => {
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
    });

    const newLead: LeadRequest = {
      id: `callback-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      city: selectedCity,
      district: selectedDistrict,
      timeSlot: preferredTime,
      totalAmount: grandTotal,
      status: 'bekliyor',
      leadType: 'callback',
      isCallback: true,
      adminNotes: note.trim() ? `Müşteri Notu: ${note.trim()}` : undefined,
      items: leadItems,
      createdAt: new Date().toISOString(),
    };

    onSaveLead(newLead);
    setIsSuccess(true);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFullName('');
    setPhone('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0A0A0B]">
              Talebiniz Alındı!
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
              Sayın <strong>{fullName}</strong>, seçimleriniz ve daire bilgileriniz mimarımıza iletildi. Belirttiğiniz <strong>{preferredTime}</strong> aralığında telefonla bilgilendirme için aranacaksınız.
            </p>
            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="btn-pill-black text-xs py-3 px-8 font-bold"
              >
                Tamam
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-2 border border-emerald-200">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>HIZLI İLETİŞİM • 0 BASKI</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0A0A0B]">
                Mimar Beni Arasın
              </h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                WhatsApp ile yazışmak istemiyorsanız numaranızı bırakın; iç mimarımız seçtiğiniz daire ve metraj detaylarıyla sizi telefonla arasın.
              </p>
            </div>

            {/* Daire ve Sepet Bilgisi Özeti */}
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] mb-5 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#64748B] block">Daire ve Konum:</span>
                <strong className="text-[#0A0A0B]">{activeRoom} ({defaultSqM} m²)</strong>
                <span className="text-[#64748B] ml-1.5 font-normal">({selectedCity} / {selectedDistrict})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#64748B] block">Hesaplanan Bütçe:</span>
                <strong className="text-[#0A0A0B] font-mono font-bold">
                  {grandTotal > 0 ? `${grandTotal.toLocaleString('tr-TR')} ₺` : 'Seçim Yapılmadı'}
                </strong>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                  Adınız ve Soyadınız *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                  Telefon Numaranız *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A0A0B] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Sizi Hangi Saat Diliminde Arayalım?</span>
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white"
                >
                  <option value="En Kısa Sürede (Mesai Saatleri İçinde)">En Kısa Sürede (Mesai Saatleri İçinde)</option>
                  <option value="09:00 - 12:00 (Sabah)">09:00 - 12:00 (Sabah)</option>
                  <option value="13:00 - 17:00 (Öğleden Sonra)">13:00 - 17:00 (Öğleden Sonra)</option>
                  <option value="18:00 - 20:00 (Akşamüstü)">18:00 - 20:00 (Akşamüstü)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                  Mimarımıza İletmek İstediğiniz Kısa Not (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Evde kiracı var, haftaya cuma taşınacak. Öncesinde keşif yapılabilir mi?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-xl p-3 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-pill-black w-full text-xs py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Çağrı Talebini İlet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-1 text-[11px] text-[#94A3B8] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bilgileriniz sadece mimarımız tarafından aranmak üzere kullanılır.</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
