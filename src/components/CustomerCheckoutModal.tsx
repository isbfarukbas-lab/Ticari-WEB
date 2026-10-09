import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Lock, 
  Send,
  Phone,
  Calendar,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { CartItem, LeadRequest, CustomerUser } from '../types';

interface CustomerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser?: CustomerUser | null;
  onOrderCompleted: (order: LeadRequest) => void;
  phoneNumber?: string;
  supportPhone?: string;
}

export const CustomerCheckoutModal: React.FC<CustomerCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onOrderCompleted,
  phoneNumber = '905550000000',
  supportPhone = '0850 123 45 67',
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'cash_on_delivery'>('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<LeadRequest | null>(null);

  // Auto-fill from logged-in customer profile
  useEffect(() => {
    if (isOpen && currentUser) {
      if (!fullName) setFullName(currentUser.fullName);
      if (!phone) setPhone(currentUser.phone);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (currentUser.city) setCity(currentUser.city);
      if (!district && currentUser.district) setDistrict(currentUser.district);
      const defaultAddr = currentUser.addresses?.find(a => a.isDefault)?.fullAddress || currentUser.addresses?.[0]?.fullAddress;
      if (!address && defaultAddr) setAddress(defaultAddr);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Price calculations
  const totalMaterial = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    return sum + item.product.materialPrice * item.quantity;
  }, 0);

  const totalLabor = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    if (item.purchaseType === 'material_only') return sum;
    return sum + item.product.workmanshipPrice * item.quantity;
  }, 0);

  const subTotal = totalMaterial + totalLabor;
  const isFreeShipping = subTotal >= 3000;
  const shippingCost = isFreeShipping ? 0 : 180;
  
  // 3% discount for bank transfer
  const bankDiscount = paymentMethod === 'bank_transfer' ? Math.round(subTotal * 0.03) : 0;
  const grandTotal = Math.max(0, subTotal + shippingCost - bankDiscount);

  const marketTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const base = item.purchaseType === 'material_only'
      ? item.product.materialPrice
      : item.product.materialPrice + item.product.workmanshipPrice;
    const market = item.product.marketPrice || Math.round(base * 1.35);
    return sum + market * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, marketTotal - grandTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !district.trim()) {
      alert('Lütfen zorunlu alanları (Ad Soyad, Telefon, İlçe ve Adres) doldurunuz.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNo = `RV-SP-${randomSuffix}`;

    const newLead: LeadRequest = {
      id: `order-${Date.now()}`,
      customerId: currentUser?.id,
      orderNumber: orderNo,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      city: city.trim(),
      district: district.trim(),
      address: `${address.trim()}${deliveryNote.trim() ? ` (Not: ${deliveryNote.trim()})` : ''}`,
      totalAmount: grandTotal,
      marketTotalAmount: marketTotal,
      savingsAmount: totalSavings,
      status: 'bekliyor',
      leadType: 'web_order',
      paymentMethod,
      shippingCost,
      adminNotes: `Ödeme Tercihi: ${
        paymentMethod === 'credit_card' 
          ? 'Kredi Kartı / Sanal POS' 
          : paymentMethod === 'bank_transfer' 
          ? 'Banka Havalesi / EFT' 
          : 'Kapıda / Ambar Tesliminde Ödeme'
      } | Kargo: ${isFreeShipping ? 'Ücretsiz' : `${shippingCost} ₺`}`,
      items: cart.map((c) => ({
        name: c.product?.name || c.customData?.title || 'Özel Sipariş',
        brand: c.product?.brand || 'RVOBA',
        quantity: c.quantity,
        unit: c.product?.unit || 'adet',
        total: c.product 
          ? (c.purchaseType === 'material_only' 
              ? c.product.materialPrice * c.quantity 
              : (c.product.materialPrice + c.product.workmanshipPrice) * c.quantity)
          : 0,
        purchaseType: c.purchaseType,
      })),
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onOrderCompleted(newLead);
      setCreatedOrder(newLead);
      setIsSubmitting(false);
    }, 400);
  };

  const handleSendWhatsAppNotification = (order: LeadRequest) => {
    const msg = `*RVOBA® — Yeni Web Siparişi Teyidi*\n\n` +
      `🏷️ *Sipariş No:* ${order.orderNumber}\n` +
      `👤 *Müşteri:* ${order.fullName}\n` +
      `📞 *Telefon:* ${order.phone}\n` +
      `📍 *Teslimat:* ${order.district} / ${order.city}\n` +
      `💳 *Ödeme:* ${
        order.paymentMethod === 'credit_card' 
          ? 'Kredi Kartı' 
          : order.paymentMethod === 'bank_transfer' 
          ? 'Banka Havalesi/EFT' 
          : 'Kapıda/Ambar Ödeme'
      }\n` +
      `💰 *Net Tutar:* ${order.totalAmount.toLocaleString('tr-TR')} ₺ (KDV Dahil)\n\n` +
      `Siparişimin hazırlandığını teyit etmek ve kargo ambar takip detaylarını almak istiyorum.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 selection:bg-black selection:text-white">
      {/* Backdrop */}
      <div 
        onClick={createdOrder ? onClose : undefined} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-[#E8EAED]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8EAED] flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-tight text-[#0A0A0B]">RVOBA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white uppercase tracking-wider">
                Güvenli Sipariş
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {createdOrder ? 'Siparişiniz başarıyla alındı!' : 'Teslimat bilgilerinizi girerek siparişinizi onaylayın.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {createdOrder ? (
            /* ======================================================== */
            /* SUCCESS CONFIRMATION SCREEN                              */
            /* ======================================================== */
            <div className="text-center py-6 sm:py-8 space-y-6">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 font-mono text-xs font-black text-[#0A0A0B] mb-2 border border-slate-200">
                  SİPARİŞ NO: {createdOrder.orderNumber}
                </span>
                <h3 className="text-2xl font-display font-extrabold text-[#0A0A0B]">
                  Siparişiniz Başarıyla Alındı!
                </h3>
                <p className="text-xs text-[#64748B] mt-2 max-w-md mx-auto leading-relaxed">
                  Talebiniz RVOBA lojistik birimine iletildi. Müşteri temsilcimiz kargo ve sevk detaylarını teyit etmek için <strong>{createdOrder.phone}</strong> numaranızdan sizinle iletişime geçecektir.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-slate-200 font-bold text-[#0A0A0B]">
                  <span>Teslim Edilecek Kişi:</span>
                  <span>{createdOrder.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Teslimat Adresi:</span>
                  <span className="font-semibold text-right max-w-[200px] text-[#0A0A0B]">{createdOrder.district} / {createdOrder.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Ödeme Tercihi:</span>
                  <span className="font-semibold text-[#0A0A0B]">
                    {createdOrder.paymentMethod === 'credit_card' 
                      ? 'Kredi Kartı' 
                      : createdOrder.paymentMethod === 'bank_transfer' 
                      ? 'Banka Havalesi / EFT' 
                      : 'Kapıda / Ambar Ödeme'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-[#0A0A0B]">
                  <span>Toplam Tutar:</span>
                  <span className="font-mono font-black text-emerald-700">{createdOrder.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Bank Details Note if Bank Transfer */}
              {createdOrder.paymentMethod === 'bank_transfer' && (
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>Havale / EFT Hesap Bilgilerimiz:</span>
                  </div>
                  <div className="text-[11px] font-mono space-y-0.5 text-amber-900">
                    <p><strong>Banka:</strong> Garanti BBVA / QNB Finansbank</p>
                    <p><strong>Alıcı:</strong> RVOBA Mimarlık Yapı Sistemleri A.Ş.</p>
                    <p><strong>IBAN:</strong> TR00 0000 0000 0000 0000 0000 00</p>
                    <p className="text-[10px] text-amber-800 pt-1">
                      * Açıklama kısmına <strong>{createdOrder.orderNumber}</strong> numarasını yazmayı unutmayınız.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppNotification(createdOrder)}
                  className="w-full sm:w-auto btn-pill-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-3 px-6 font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp ile Sipariş Durumunu Sor</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto btn-pill-outline text-xs py-3 px-6 font-semibold"
                >
                  Alışverişe Devam Et
                </button>
              </div>

            </div>
          ) : (
            /* ======================================================== */
            /* CHECKOUT FORM SCREEN                                     */
            /* ======================================================== */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Order Quick Summary Pill */}
              <div className="p-4 rounded-2xl bg-[#0A0A0B] text-white flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">SEPET ÖZETİ</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {cart.length} Kalem Ürün ({subTotal.toLocaleString('tr-TR')} ₺)
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">ÖDENECEK TUTAR</span>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {grandTotal.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>

              {/* 1. Müşteri & İletişim Bilgileri */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. İletişim Bilgileri</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                      Adınız ve Soyadınız *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Mehmet Yılmaz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                      Telefon Numaranız *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Örn: 0532 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                    E-Posta Adresi (Opsiyonel — E-fatura & kargo takibi için)
                  </label>
                  <input
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                  />
                </div>
              </div>

              {/* 2. Teslimat Adresi */}
              <div className="space-y-3 pt-3 border-t border-[#F1F3F5]">
                <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Kargo & Teslimat Adresi</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                      İl / Şehir *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: İstanbul, Ankara, İzmir..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Kadıköy, Çankaya, Bornova..."
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                    Açık Teslimat Adresi (Mahalle, Cadde, Sokak, Kapı No, Daire) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Kargo ve ambar teslimatının yapılacağı tam açık adresiniz..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                    Varsa Teslimat Notu (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Daire 6, asansörlü bina, kargo öncesi arayınız..."
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                  />
                </div>

                {/* Shipping cost transparent status */}
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>81 İl Sigortalı Kargo/Ambar Gönderimi</span>
                  </div>
                  <span className="font-bold">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono text-[11px]">
                        ✓ Ücretsiz Kargo
                      </span>
                    ) : (
                      <span className="font-mono">180 ₺</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 3. Ödeme Yöntemi Tercihi */}
              <div className="space-y-3 pt-3 border-t border-[#F1F3F5]">
                <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>3. Ödeme Yöntemi</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Credit Card */}
                  <label className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between select-none ${
                    paymentMethod === 'credit_card' 
                      ? 'border-black bg-slate-900 text-white shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-4 h-4" />
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="accent-white"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Kredi / Banka Kartı</div>
                      <div className={`text-[10px] mt-0.5 ${paymentMethod === 'credit_card' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Tüm kartlara 12 taksit
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between select-none ${
                    paymentMethod === 'bank_transfer' 
                      ? 'border-black bg-slate-900 text-white shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <Building2 className="w-4 h-4" />
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="accent-white"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Havale / EFT</div>
                      <div className={`text-[10px] mt-0.5 ${paymentMethod === 'bank_transfer' ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-semibold'}`}>
                        ⚡ %3 Nakit İndirimi
                      </div>
                    </div>
                  </label>

                  {/* Cash On Delivery */}
                  <label className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between select-none ${
                    paymentMethod === 'cash_on_delivery' 
                      ? 'border-black bg-slate-900 text-white shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <Truck className="w-4 h-4" />
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="accent-white"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Kapıda / Ambar Ödeme</div>
                      <div className={`text-[10px] mt-0.5 ${paymentMethod === 'cash_on_delivery' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Teslim anında ödeme
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Final Pricing Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] text-xs space-y-2">
                <div className="flex justify-between text-[#64748B]">
                  <span>Ürünler Toplamı:</span>
                  <span className="font-mono font-bold text-[#0A0A0B]">{totalMaterial.toLocaleString('tr-TR')} ₺</span>
                </div>
                {totalLabor > 0 && (
                  <div className="flex justify-between text-[#64748B]">
                    <span>Montaj & Usta İşçiliği:</span>
                    <span className="font-mono font-bold text-[#0A0A0B]">+{totalLabor.toLocaleString('tr-TR')} ₺</span>
                  </div>
                )}
                <div className="flex justify-between text-[#64748B]">
                  <span>Kargo / Ambar Bedeli:</span>
                  <span className="font-mono font-bold text-[#0A0A0B]">
                    {isFreeShipping ? '0 ₺ (Ücretsiz)' : `${shippingCost} ₺`}
                  </span>
                </div>
                {bankDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Havale / EFT İndirimi (%3):</span>
                    <span className="font-mono">-{bankDiscount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E8EAED] flex justify-between items-baseline font-black text-sm sm:text-base text-[#0A0A0B]">
                  <span>Ödenecek Net Tutar:</span>
                  <span className="font-mono text-xl text-[#0A0A0B]">{grandTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  KDV Dahil Net Fiyattır.
                </div>
              </div>

              {/* Submit CTA */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-pill-black bg-[#0A0A0B] hover:bg-slate-800 text-white py-4 text-xs sm:text-sm font-bold shadow-xl justify-center flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Siparişiniz Oluşturuluyor...' : 'Siparişi Onayla & Oluştur'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL güvenli altyapı ile bilgileriniz korunmaktadır.</span>
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
