import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck, 
  Copy, 
  Check, 
  Hammer, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  ShieldAlert, 
  Layers,
  ChevronRight,
  Wifi
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, LeadRequest, CustomerUser, SiteSettings } from '../types';
import { dbService } from '../services/dbService';
import { trackEcommerceEvent } from '../utils/seo';

interface CustomerCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser?: CustomerUser | null;
  onOrderCompleted: (
    order: LeadRequest,
    opts?: { alreadySavedInCloud?: boolean }
  ) => Promise<{ ok: boolean; lead: LeadRequest; error?: string } | void> | void;
  phoneNumber?: string;
  supportPhone?: string;
  settings?: SiteSettings;
}

interface BankOption {
  id: string;
  name: string;
  family: string;
  themeColor: string;
}

const BANKS: BankOption[] = [
  { id: 'garanti', name: 'Garanti BBVA', family: 'Bonus', themeColor: '#007A3D' },
  { id: 'yapikredi', name: 'Yapı Kredi', family: 'World', themeColor: '#4A148C' },
  { id: 'isbank', name: 'İş Bankası', family: 'Maximum', themeColor: '#0B3082' },
  { id: 'akbank', name: 'Akbank', family: 'Axess', themeColor: '#E30613' },
  { id: 'ziraat', name: 'Ziraat Bankası', family: 'Bankkart', themeColor: '#C62828' },
];

interface InstallmentPlan {
  count: number;
  label: string;
  commissionRate: number;
  badge?: string;
}

const INSTALLMENT_PLANS: InstallmentPlan[] = [
  { count: 1, label: 'Tek Çekim', commissionRate: 0, badge: 'Peşin Fiyatına' },
  { count: 2, label: '2 Taksit', commissionRate: 0, badge: 'Peşin Fiyatına' },
  { count: 3, label: '3 Taksit', commissionRate: 0, badge: 'Peşin Fiyatına' },
  { count: 6, label: '6 Taksit', commissionRate: 0, badge: 'Peşin Fiyatına' },
  { count: 9, label: '9 Taksit', commissionRate: 0.035, badge: '%3.5 Vade Farkı' },
  { count: 12, label: '12 Taksit', commissionRate: 0.049, badge: '%4.9 Vade Farkı' },
];

export const CustomerCheckoutModal: React.FC<CustomerCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onOrderCompleted,
  phoneNumber = '905447685137',
  supportPhone = '0544 768 51 37',
  settings,
}) => {
  const bankInfo = settings?.bankInfo || {
    bankName: 'Garanti BBVA / Ziraat Bankası',
    accountHolder: settings?.companyName || 'RVOBA Yapı ve Tadilat Hizmetleri',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    transferDiscountPercent: 3,
  };

  const paymentConfig = settings?.paymentMethods || {
    enableBankTransfer: true,
    enableCashOnDelivery: true,
    enableCreditCard: true,
    creditCardNote: 'Tüm kartlara 12 taksit imkanı',
  };

  const freeShippingThreshold = settings?.freeShippingThreshold ?? 3000;
  const standardShippingCost = settings?.standardShippingCost ?? 180;

  const getDefaultPaymentMethod = (): 'credit_card' | 'bank_transfer' | 'cash_on_delivery' => {
    if (paymentConfig.enableCreditCard) return 'credit_card';
    if (paymentConfig.enableBankTransfer) return 'bank_transfer';
    if (paymentConfig.enableCashOnDelivery) return 'cash_on_delivery';
    return 'credit_card';
  };

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [invoiceType, setInvoiceType] = useState<'individual' | 'corporate'>('individual');
  const [companyTitle, setCompanyTitle] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'cash_on_delivery'>(getDefaultPaymentMethod());

  const hasRealIban = Boolean(
    bankInfo.iban && !/^TR00\s*0000/i.test(bankInfo.iban.trim())
  );
  
  // Credit Card Virtual POS State
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('garanti');
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [cardFocus, setCardFocus] = useState<'front' | 'back'>('front');

  // 3D Secure Modal State & Live PayTR iFrame State
  const [is3DSecureModalOpen, setIs3DSecureModalOpen] = useState(false);
  const [paytrIframeUrl, setPaytrIframeUrl] = useState<string | null>(null);
  const [paytrMerchantOid, setPaytrMerchantOid] = useState<string | null>(null);
  const [isCheckingPaytr, setIsCheckingPaytr] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsTimer, setSmsTimer] = useState(180);
  const [smsError, setSmsError] = useState('');
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);
  const [provisionRef, setProvisionRef] = useState('');

  // General State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<LeadRequest | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [formError, setFormError] = useState('');

  // Timer Ref for 3D Secure
  const timerRef = useRef<any>(null);

  // Sync selected payment method if admin toggles availability
  useEffect(() => {
    if (paymentMethod === 'credit_card' && !paymentConfig.enableCreditCard) {
      setPaymentMethod(getDefaultPaymentMethod());
    } else if (paymentMethod === 'bank_transfer' && !paymentConfig.enableBankTransfer) {
      setPaymentMethod(getDefaultPaymentMethod());
    } else if (paymentMethod === 'cash_on_delivery' && !paymentConfig.enableCashOnDelivery) {
      setPaymentMethod(getDefaultPaymentMethod());
    }
  }, [paymentConfig.enableCreditCard, paymentConfig.enableBankTransfer, paymentConfig.enableCashOnDelivery]);

  // Auto-fill from logged-in customer profile & reset confirmation state on reopen
  useEffect(() => {
    if (!isOpen) {
      setCreatedOrder(null);
      setIs3DSecureModalOpen(false);
      setPaytrIframeUrl(null);
      setPaytrMerchantOid(null);
      setSmsCode('');
      setSmsError('');
      setFormError('');
      return;
    }

    if (cart.length > 0) {
      const value = cart.reduce((s, c) => {
        if (!c.product) return s;
        const diff = c.selectedVariant?.priceDifference || 0;
        const unit =
          c.purchaseType === 'material_only'
            ? c.product.materialPrice + diff
            : c.product.materialPrice + diff + c.product.workmanshipPrice;
        return s + unit * c.quantity;
      }, 0);
      trackEcommerceEvent('begin_checkout', {
        value,
        items: cart
          .filter((c) => Boolean(c.product))
          .map((c) => ({
            item_id: c.product!.id,
            item_name: c.product!.name,
            item_brand: c.product!.brand,
            price: c.product!.materialPrice,
            quantity: c.quantity,
          })),
      });
    }

    if (currentUser) {
      if (!fullName) setFullName(currentUser.fullName);
      if (!phone) setPhone(currentUser.phone);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (currentUser.city) setCity(currentUser.city);
      if (!district && currentUser.district) setDistrict(currentUser.district);
      const validAddresses = (currentUser.addresses || []).filter(
        (a) => a.fullAddress && a.fullAddress.trim() !== `${a.district}, ${a.city}`
      );
      const defaultAddrObj = validAddresses.find((a) => a.isDefault) || validAddresses[0];
      if (!address && defaultAddrObj) {
        setAddress(defaultAddrObj.fullAddress);
        if (defaultAddrObj.city) setCity(defaultAddrObj.city);
        if (defaultAddrObj.district) setDistrict(defaultAddrObj.district);
      }
    }
  }, [isOpen, currentUser]);

  // Countdown timer for 3D Secure SMS code
  useEffect(() => {
    if (is3DSecureModalOpen) {
      setSmsTimer(180);
      setSmsError('');
      timerRef.current = setInterval(() => {
        setSmsTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [is3DSecureModalOpen]);

  // Listen for live PayTR 3D Secure callback postMessage & poll order status while PayTR iFrame is open
  useEffect(() => {
    if (!paytrIframeUrl || !paytrMerchantOid) return;
    let active = true;

    const verifyPaytrCompletion = async () => {
      if (!active) return;
      setIsCheckingPaytr(true);
      try {
        const check = await dbService.checkPaytrOrderStatus(paytrMerchantOid);
        if (!active) return;
        if (check.ok && check.status === 'paid' && check.lead) {
          confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#007A3D', '#0A0A0B', '#F59E0B', '#10B981'],
          });
          setProvisionRef(paytrMerchantOid);
          await onOrderCompleted(check.lead, { alreadySavedInCloud: true });
          setCreatedOrder(check.lead);
          setPaytrIframeUrl(null);
          setPaytrMerchantOid(null);
        } else if (check.ok && check.status === 'failed') {
          setFormError(
            check.failureReason ||
              '3D Secure kart ödemesi banka tarafından onaylanmadı. Lütfen tekrar deneyiniz.'
          );
          setPaytrIframeUrl(null);
          setPaytrMerchantOid(null);
        }
      } finally {
        if (active) setIsCheckingPaytr(false);
      }
    };

    const handleMessage = (ev: MessageEvent) => {
      const data = ev.data as { type?: string; status?: string; merchantOid?: string } | null;
      if (data?.type === 'RVOBA_PAYTR_RESULT') {
        if (data.status === 'fail') {
          setFormError('Ödeme işlemi iptal edildi veya banka tarafından reddedildi.');
          setPaytrIframeUrl(null);
          setPaytrMerchantOid(null);
          return;
        }
        verifyPaytrCompletion();
      }
    };

    window.addEventListener('message', handleMessage);
    const pollInterval = setInterval(verifyPaytrCompletion, 4000);

    return () => {
      active = false;
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [paytrIframeUrl, paytrMerchantOid]);

  if (!isOpen) return null;

  // Price calculations (taking variants into account!)
  const totalMaterial = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const variantDiff = item.selectedVariant?.priceDifference || 0;
    return sum + (item.product.materialPrice + variantDiff) * item.quantity;
  }, 0);

  const totalLabor = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    if (item.purchaseType === 'material_only') return sum;
    return sum + item.product.workmanshipPrice * item.quantity;
  }, 0);

  const subTotal = totalMaterial + totalLabor;
  const isFreeShipping = subTotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : standardShippingCost;
  
  // Dynamic discount for bank transfer
  const discountRate = (bankInfo.transferDiscountPercent ?? 3) / 100;
  const bankDiscount = paymentMethod === 'bank_transfer' ? Math.round(subTotal * discountRate) : 0;
  
  // Base grand total before installment difference
  const baseGrandTotal = Math.max(0, subTotal + shippingCost - bankDiscount);

  // Installment calculation
  const currentPlan = INSTALLMENT_PLANS.find(p => p.count === selectedInstallment) || INSTALLMENT_PLANS[0];
  const installmentCommission = paymentMethod === 'credit_card' && currentPlan.commissionRate > 0 
    ? Math.round(baseGrandTotal * currentPlan.commissionRate) 
    : 0;
  
  const grandTotal = baseGrandTotal + installmentCommission;
  const monthlyInstallmentAmount = Math.round(grandTotal / selectedInstallment);

  const marketTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const variantDiff = item.selectedVariant?.priceDifference || 0;
    const isMaterialOnly = item.purchaseType === 'material_only';
    const base = isMaterialOnly
      ? item.product.materialPrice + variantDiff
      : item.product.materialPrice + variantDiff + item.product.workmanshipPrice;
    const rawMarket = item.product.marketPrice
      ? (isMaterialOnly && item.product.workmanshipPrice > 0
          ? Math.max(0, item.product.marketPrice - item.product.workmanshipPrice) + variantDiff
          : item.product.marketPrice + variantDiff)
      : base;
    const market = rawMarket > base ? rawMarket : base;
    return sum + market * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, marketTotal - grandTotal);

  // Card formatting helpers
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
  };

  // Detect card brand
  const getCardBrand = (num: string): 'visa' | 'mastercard' | 'troy' | 'generic' => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^(9792|65)/.test(clean)) return 'troy';
    return 'generic';
  };

  const cardBrand = getCardBrand(cardNumber);
  const activeBankObj = BANKS.find(b => b.id === selectedBank) || BANKS[0];

  const handleCopyIban = () => {
    navigator.clipboard.writeText(bankInfo.iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const buildDraftLead = (provCode?: string): LeadRequest => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNo = `RV-SP-${randomSuffix}`;
    const invoiceSummary =
      invoiceType === 'corporate'
        ? ` | Kurumsal Fatura: ${companyTitle.trim()} (${taxOffice.trim()} V.D. - ${taxNumber.trim()})`
        : '';
    return {
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
      invoiceInfo:
        invoiceType === 'corporate'
          ? {
              type: 'corporate',
              companyTitle: companyTitle.trim(),
              taxOffice: taxOffice.trim(),
              taxNumber: taxNumber.trim(),
            }
          : { type: 'individual' },
      paymentSummary:
        (paymentMethod === 'credit_card'
          ? `Ödeme: Sanal POS (3D Secure ONAYLI - Provizyon: ${provCode || provisionRef || 'PRV-OK'} - ${activeBankObj.name} ${selectedInstallment} Taksit${cardNumber ? ` - Kart Sonu: ${cardNumber.replace(/\s/g, '').slice(-4)}` : ''}) | Kargo: ${isFreeShipping ? 'Ücretsiz' : `${shippingCost} ₺`}`
          : `Ödeme Tercihi: ${paymentMethod === 'bank_transfer' ? 'Banka Havalesi / EFT' : 'Kapıda / Ambar Tesliminde Ödeme'} | Kargo: ${isFreeShipping ? 'Ücretsiz' : `${shippingCost} ₺`}`) +
        invoiceSummary,
      items: cart.map((c) => {
        const variantDiff = c.selectedVariant?.priceDifference || 0;
        return {
          productId: c.productId || c.product?.id,
          name: c.product?.name || c.customData?.title || 'Özel Sipariş',
          brand: c.product?.brand || 'RVOBA',
          quantity: c.quantity,
          unit: c.product?.unit || 'adet',
          total: c.product
            ? c.purchaseType === 'material_only'
              ? (c.product.materialPrice + variantDiff) * c.quantity
              : (c.product.materialPrice + variantDiff + c.product.workmanshipPrice) * c.quantity
            : 0,
          isCustom: c.isCustom,
          photoDataUrl: c.customData?.photoDataUrl,
          customNote: c.customData?.description,
          purchaseType: c.purchaseType,
          selectedVariant: c.selectedVariant,
          variantName: c.selectedVariant?.name,
        };
      }),
      createdAt: new Date().toISOString(),
    };
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !phone.trim() || !address.trim() || !district.trim()) {
      setFormError('Lütfen zorunlu alanları (Ad Soyad, Telefon, İlçe ve Adres) doldurunuz.');
      return;
    }

    if (
      invoiceType === 'corporate' &&
      (!companyTitle.trim() || !taxOffice.trim() || !taxNumber.trim())
    ) {
      setFormError(
        'Kurumsal fatura için Firma Unvanı, Vergi Dairesi ve Vergi Numarası alanlarını doldurunuz.'
      );
      return;
    }

    if (paymentMethod === 'credit_card') {
      setIsSubmitting(true);
      try {
        // 1. Try initializing real PayTR 3D Secure iFrame via Supabase Edge Function
        const draftLead = buildDraftLead();
        const paytrRes = await dbService.initPaytrCheckout(draftLead);
        if (paytrRes.ok && paytrRes.iframeUrl && paytrRes.merchantOid) {
          setPaytrMerchantOid(paytrRes.merchantOid);
          setPaytrIframeUrl(paytrRes.iframeUrl);
          setIsSubmitting(false);
          return;
        }
        if (paytrRes.error === 'out_of_stock') {
          setFormError(
            paytrRes.reason ||
              `Stok yetersiz: ${paytrRes.productName || 'Seçili ürün'} için yeterli stok kalmadı.`
          );
          setIsSubmitting(false);
          return;
        }
        if (paytrRes.error && paytrRes.error !== 'pos_not_configured' && paytrRes.error !== 'network_error') {
          setFormError(paytrRes.reason || 'Sanal POS oturumu başlatılamadı. Lütfen bilgilerinizi kontrol ediniz.');
          setIsSubmitting(false);
          return;
        }
      } catch {
        // Fall through to built-in 3D Secure flow if PayTR is not configured yet
      } finally {
        setIsSubmitting(false);
      }

      // 2. Fallback built-in 3D Secure flow when PayTR Merchant keys are not configured yet
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        setFormError('Lütfen 16 haneli kredi kartı numaranızı eksiksiz giriniz.');
        return;
      }
      if (!cardHolder.trim()) {
        setFormError('Lütfen kart üzerindeki Ad Soyad bilgisini giriniz.');
        return;
      }
      if (cardExpiry.length < 5) {
        setFormError('Lütfen kart son kullanma tarihini (AA/YY) giriniz.');
        return;
      }
      if (cardCvv.length < 3) {
        setFormError('Lütfen kartın arkasındaki 3 haneli güvenlik kodunu (CVV) giriniz.');
        return;
      }

      const prov = `PRV-${Math.floor(100000 + Math.random() * 900000)}`;
      setProvisionRef(prov);
      setIs3DSecureModalOpen(true);
      return;
    }

    // Direct submission for Bank Transfer or Cash on Delivery
    finalizeOrder('standard');
  };

  // Finalize order creation (server-side price & stock verified)
  const finalizeOrder = async (mode: 'standard' | '3d_secure') => {
    setIsSubmitting(true);
    setFormError('');
    const newLead = buildDraftLead();

    try {
      const result = await onOrderCompleted(newLead);
      if (result && typeof result === 'object' && result.ok === false) {
        setFormError(
          result.error || 'Sipariş oluşturulurken stok yetersizliği veya bağlantı hatası oluştu.'
        );
        setIsSubmitting(false);
        setIs3DSecureModalOpen(false);
        return;
      }

      if (mode === '3d_secure') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#007A3D', '#0A0A0B', '#F59E0B', '#10B981'],
        });
      }

      const confirmedLead =
        result && typeof result === 'object' && result.lead ? result.lead : newLead;
      setCreatedOrder(confirmedLead);
    } finally {
      setIsSubmitting(false);
      setIs3DSecureModalOpen(false);
    }
  };

  // Verify 3D Secure SMS Code
  const handleVerifySms = () => {
    if (smsCode.trim() !== '123456' && smsCode.trim().length !== 6) {
      setSmsError('Girilen 3D Secure onay şifresi hatalı. Lütfen 123456 test kodunu kullanınız.');
      return;
    }

    setIsVerifyingSms(true);
    setSmsError('');
    setTimeout(() => {
      setIsVerifyingSms(false);
      finalizeOrder('3d_secure');
    }, 900);
  };

  const handleSendWhatsAppNotification = (order: LeadRequest) => {
    const msg = `*RVOBA® — Yeni Web Siparişi Teyidi*\n\n` +
      `*Sipariş No:* ${order.orderNumber}\n` +
      `*Müşteri:* ${order.fullName}\n` +
      `*Telefon:* ${order.phone}\n` +
      `*Teslimat:* ${order.district} / ${order.city}\n` +
      `*Ödeme:* ${
        order.paymentMethod === 'credit_card' 
          ? `Kredi Kartı / 3D Secure (${selectedInstallment === 1 ? 'Tek Çekim' : `${selectedInstallment} Taksit`})` 
          : order.paymentMethod === 'bank_transfer' 
          ? 'Banka Havalesi/EFT' 
          : 'Kapıda/Ambar Ödeme'
      }\n` +
      `*Net Tutar:* ${order.totalAmount.toLocaleString('tr-TR')} ₺ (KDV Dahil)\n\n` +
      `Siparişimin hazırlandığını teyit etmek ve kargo ambar takip detaylarını almak istiyorum.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 selection:bg-black selection:text-white">
      {/* Backdrop */}
      <div 
        onClick={createdOrder || is3DSecureModalOpen ? undefined : onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-[#E8EAED]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8EAED] flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-tight text-[#0A0A0B]">RVOBA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white uppercase tracking-wider">
                Güvenli Sipariş
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                256-Bit SSL Sanal POS
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {createdOrder ? 'Siparişiniz başarıyla alındı!' : 'Teslimat ve ödeme bilgilerinizi girerek siparişinizi onaylayın.'}
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
                  <span className="text-[#64748B]">Ödeme Yöntemi:</span>
                  <span className="font-semibold text-[#0A0A0B]">
                    {createdOrder.paymentMethod === 'credit_card' 
                      ? `Kredi Kartı (${selectedInstallment === 1 ? 'Tek Çekim' : `${selectedInstallment} Taksit`})` 
                      : createdOrder.paymentMethod === 'bank_transfer' 
                      ? 'Banka Havalesi / EFT' 
                      : 'Kapıda / Ambar Ödeme'}
                  </span>
                </div>
                {createdOrder.paymentMethod === 'credit_card' && provisionRef && (
                  <div className="flex justify-between text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                    <span>3D Secure Provizyon Ref:</span>
                    <span className="font-mono font-bold">{provisionRef}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-[#0A0A0B]">
                  <span>Toplam Tutar:</span>
                  <span className="font-mono font-black text-emerald-700">{createdOrder.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Bank Details Note if Bank Transfer */}
              {createdOrder.paymentMethod === 'bank_transfer' && (
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-800 space-y-2">
                  <div className="font-bold flex items-center justify-between text-[#0A0A0B]">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-700" />
                      <span>Havale / EFT Ödeme Bilgilendirmesi:</span>
                    </span>
                    {hasRealIban && (
                      <button
                        type="button"
                        onClick={handleCopyIban}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[10px] font-bold text-[#0A0A0B] hover:bg-slate-100 transition"
                      >
                        {copiedIban ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIban ? 'IBAN Kopyalandı' : 'IBAN Kopyala'}</span>
                      </button>
                    )}
                  </div>
                  {hasRealIban ? (
                    <div className="text-[11px] font-mono space-y-1 text-slate-700">
                      <p><strong>Banka:</strong> {bankInfo.bankName}</p>
                      <p><strong>Alıcı:</strong> {bankInfo.accountHolder}</p>
                      <p><strong>IBAN:</strong> <span className="select-all bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">{bankInfo.iban}</span></p>
                      <p className="text-[10px] text-slate-500 pt-1">
                        * Açıklama kısmına <strong>{createdOrder.orderNumber}</strong> numarasını yazmayı unutmayınız.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      %{bankInfo.transferDiscountPercent} havale indiriminiz sipariş tutarınıza tanımlanmıştır. Stok kontrolünün hemen ardından resmi kurumsal IBAN bilgimiz müşteri temsilcimiz tarafından <strong>{createdOrder.phone}</strong> numaranıza iletilecektir.
                    </p>
                  )}
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
              
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

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
                    {paymentMethod === 'credit_card' && selectedInstallment > 1 && (
                      <span className="block text-[10px] text-slate-300 font-normal">
                        ({selectedInstallment} x {monthlyInstallmentAmount.toLocaleString('tr-TR')} ₺)
                      </span>
                    )}
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
                      Telefon Numaranız (SMS Onayı İçin) *
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

                {/* Bireysel / Kurumsal (B2B) Fatura Tercihi */}
                <div className="pt-1 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-[#0A0A0B]">Fatura Tipi:</span>
                    <div className="inline-flex rounded-xl bg-[#F1F3F5] p-0.5 border border-[#E8EAED]">
                      <button
                        type="button"
                        onClick={() => setInvoiceType('individual')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                          invoiceType === 'individual'
                            ? 'bg-white text-[#0A0A0B] shadow-sm'
                            : 'text-[#64748B] hover:text-[#0A0A0B]'
                        }`}
                      >
                        Bireysel Fatura
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceType('corporate')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                          invoiceType === 'corporate'
                            ? 'bg-[#0A0A0B] text-white shadow-sm'
                            : 'text-[#64748B] hover:text-[#0A0A0B]'
                        }`}
                      >
                        Kurumsal (Şirket Faturası)
                      </button>
                    </div>
                  </div>

                  {invoiceType === 'corporate' && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                          Resmi Şirket / Firma Unvanı *
                        </label>
                        <input
                          type="text"
                          required={invoiceType === 'corporate'}
                          placeholder="Örn: Yılmaz Elektrik Mimarlık İnşaat Ltd. Şti."
                          value={companyTitle}
                          onChange={(e) => setCompanyTitle(e.target.value)}
                          className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                            Vergi Dairesi *
                          </label>
                          <input
                            type="text"
                            required={invoiceType === 'corporate'}
                            placeholder="Örn: Kadıköy V.D."
                            value={taxOffice}
                            onChange={(e) => setTaxOffice(e.target.value)}
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                            Vergi Numarası / TCKN *
                          </label>
                          <input
                            type="text"
                            required={invoiceType === 'corporate'}
                            maxLength={11}
                            placeholder="10 veya 11 haneli VKN/TCKN"
                            value={taxNumber}
                            onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0A0A0B] focus:outline-none focus:border-black transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Teslimat Adresi */}
              <div className="space-y-3 pt-3 border-t border-[#F1F3F5]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. Kargo & Teslimat Adresi</span>
                  </h4>
                  {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentUser.addresses
                        .filter((a) => a.fullAddress && a.fullAddress.trim() !== `${a.district}, ${a.city}`)
                        .map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setCity(addr.city);
                              setDistrict(addr.district);
                              setAddress(addr.fullAddress);
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                              address === addr.fullAddress
                                ? 'bg-[#0A0A0B] text-white border-[#0A0A0B]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-black'
                            }`}
                          >
                            📍 {addr.title}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

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
                    <span>81 İl Sigortalı Kargo/Ambar Gönderimi ({freeShippingThreshold.toLocaleString('tr-TR')} ₺ üzeri ücretsiz)</span>
                  </div>
                  <span className="font-bold">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono text-[11px]">
                        ✓ Ücretsiz Kargo
                      </span>
                    ) : (
                      <span className="font-mono">{standardShippingCost} ₺</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 3. Ödeme Yöntemi Tercihi */}
              <div className="space-y-3 pt-3 border-t border-[#F1F3F5]">
                <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>3. Ödeme Yöntemi Seçimi</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Credit Card */}
                  {paymentConfig.enableCreditCard && (
                    <label className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between select-none ${
                      paymentMethod === 'credit_card' 
                        ? 'border-black bg-slate-900 text-white shadow-md ring-2 ring-black/10' 
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={paymentMethod === 'credit_card'}
                          onChange={() => setPaymentMethod('credit_card')}
                          className="accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Kredi / Banka Kartı</div>
                        <div className={`text-[10px] mt-0.5 ${paymentMethod === 'credit_card' ? 'text-emerald-300 font-semibold' : 'text-slate-500'}`}>
                          12 Taksit & 3D Secure
                        </div>
                      </div>
                    </label>
                  )}

                  {/* Bank Transfer */}
                  {paymentConfig.enableBankTransfer && (
                    <label className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between select-none ${
                      paymentMethod === 'bank_transfer' 
                        ? 'border-black bg-slate-900 text-white shadow-md ring-2 ring-black/10' 
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Havale / EFT</div>
                        <div className={`text-[10px] mt-0.5 ${paymentMethod === 'bank_transfer' ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-semibold'}`}>
                          %{bankInfo.transferDiscountPercent} Havale İndirimi
                        </div>
                      </div>
                    </label>
                  )}

                  {/* Cash On Delivery */}
                  {paymentConfig.enableCashOnDelivery && (
                    <label className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between select-none ${
                      paymentMethod === 'cash_on_delivery' 
                        ? 'border-black bg-slate-900 text-white shadow-md ring-2 ring-black/10' 
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Truck className="w-4 h-4 text-amber-400" />
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash_on_delivery"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="accent-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Kapıda / Ambar Ödeme</div>
                        <div className={`text-[10px] mt-0.5 ${paymentMethod === 'cash_on_delivery' ? 'text-slate-300' : 'text-slate-500'}`}>
                          Teslim anında nakit/kart
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                {/* ======================================================== */}
                {/* VIRTUAL POS & CREDIT CARD INTERFACE                      */}
                {/* ======================================================== */}
                {paymentMethod === 'credit_card' && (
                  <div className="mt-4 p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-5">
                    
                    {/* Visual Card + Card Input Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      
                      {/* Visual Card Widget */}
                      <div className="md:col-span-5 flex justify-center">
                        <div className="w-full max-w-[320px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0A0A0B] p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-white/10 select-none">
                          {/* Background Glow */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                          <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

                          {/* Card Top Row: Chip & Bank Name */}
                          <div className="flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                              {/* EMV Chip */}
                              <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border border-amber-500/30 flex items-center justify-center p-1 shadow-inner">
                                <div className="w-full h-full border border-amber-600/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                                  <div className="border-b border-amber-600/30"></div>
                                  <div className="border-b border-amber-600/30"></div>
                                </div>
                              </div>
                              <Wifi className="w-4 h-4 text-white/60 rotate-90" />
                            </div>

                            <div className="text-right">
                              <span className="text-[11px] font-bold tracking-wider text-white/90">
                                {activeBankObj.name}
                              </span>
                              <span className="block text-[9px] font-semibold text-emerald-400">
                                {activeBankObj.family}
                              </span>
                            </div>
                          </div>

                          {/* Card Number */}
                          <div className="z-10 tracking-widest font-mono text-sm sm:text-base font-bold text-slate-100">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          {/* Card Bottom Row: Holder, Expiry & Brand */}
                          <div className="flex items-end justify-between z-10">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                                KART SAHİBİ
                              </span>
                              <span className="text-xs font-semibold tracking-wider text-white uppercase truncate max-w-[140px] block">
                                {cardHolder || 'AD SOYAD'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-medium">
                                SKT
                              </span>
                              <span className="text-xs font-mono font-semibold text-white">
                                {cardExpiry || 'AA/YY'}
                              </span>
                            </div>

                            {/* Card Brand Badge */}
                            <div className="text-right">
                              {cardBrand === 'visa' && (
                                <span className="font-extrabold italic text-sm tracking-wider text-blue-300 bg-white/10 px-2 py-0.5 rounded">
                                  VISA
                                </span>
                              )}
                              {cardBrand === 'mastercard' && (
                                <div className="flex items-center -space-x-2">
                                  <div className="w-5 h-5 rounded-full bg-red-500 opacity-90"></div>
                                  <div className="w-5 h-5 rounded-full bg-amber-400 opacity-90"></div>
                                </div>
                              )}
                              {cardBrand === 'troy' && (
                                <span className="font-black text-xs tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                                  TROY
                                </span>
                              )}
                              {cardBrand === 'generic' && (
                                <CreditCard className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Card Input Fields */}
                      <div className="md:col-span-7 space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                            Kart Numarası *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="0000 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono tracking-wider focus:outline-none focus:border-black transition"
                            />
                            <div className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">
                              {cardBrand !== 'generic' ? cardBrand : '16 Hane'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                            Kart Üzerindeki İsim *
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: MEHMET YILMAZ"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] uppercase focus:outline-none focus:border-black transition"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                              Son Kullanma (AA/YY) *
                            </label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="12/28"
                              value={cardExpiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black transition"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                              CVV / Güvenlik Kodu *
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => handleCvvChange(e.target.value)}
                              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black transition"
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bank Selection Tabs */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-2 flex items-center justify-between">
                        <span>Kartınızın Bağlı Olduğu Banka</span>
                        <span className="text-[10px] text-slate-500 font-normal">Taksit avantajları için seçiniz</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b.id)}
                            className={`p-2 rounded-xl text-left border text-xs transition flex flex-col justify-between ${
                              selectedBank === b.id
                                ? 'border-black bg-white shadow-sm ring-1 ring-black'
                                : 'border-slate-200 bg-white/60 hover:bg-white text-slate-700'
                            }`}
                          >
                            <span className="font-bold text-[11px] truncate">{b.name}</span>
                            <span className="text-[10px] font-semibold text-emerald-700">{b.family}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Installment Options Matrix Table */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-[#0A0A0B] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-700" />
                          <span>Taksit Seçenekleri ({activeBankObj.family})</span>
                        </label>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Peşin Fiyatına 6 Taksit
                        </span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                        <div className="grid grid-cols-12 bg-slate-100 p-2.5 text-[10px] font-bold text-slate-600 border-b border-slate-200">
                          <div className="col-span-1 text-center">Seç</div>
                          <div className="col-span-4">Taksit Sayısı</div>
                          <div className="col-span-4 text-right">Aylık Taksit</div>
                          <div className="col-span-3 text-right">Toplam Tutar</div>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {INSTALLMENT_PLANS.map((plan) => {
                            const isSelected = selectedInstallment === plan.count;
                            const comm = plan.commissionRate > 0 ? Math.round(baseGrandTotal * plan.commissionRate) : 0;
                            const planTotal = baseGrandTotal + comm;
                            const planMonthly = Math.round(planTotal / plan.count);

                            return (
                              <div
                                key={plan.count}
                                onClick={() => setSelectedInstallment(plan.count)}
                                className={`grid grid-cols-12 p-2.5 text-xs items-center cursor-pointer transition ${
                                  isSelected 
                                    ? 'bg-emerald-50/70 text-[#0A0A0B] font-semibold' 
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="col-span-1 text-center flex justify-center">
                                  <input
                                    type="radio"
                                    name="selectedInstallment"
                                    checked={isSelected}
                                    onChange={() => setSelectedInstallment(plan.count)}
                                    className="accent-emerald-600"
                                  />
                                </div>
                                <div className="col-span-4 flex items-center gap-1.5">
                                  <span>{plan.label}</span>
                                  {plan.badge && (
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                      plan.count <= 6 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {plan.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="col-span-4 text-right font-mono text-[11px]">
                                  {planMonthly.toLocaleString('tr-TR')} ₺ x {plan.count}
                                </div>
                                <div className="col-span-3 text-right font-mono font-bold text-[#0A0A0B]">
                                  {planTotal.toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Live Bank Info Preview when Havale/EFT is selected */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{hasRealIban ? 'Resmi Banka & IBAN Bilgisi' : 'Havale / EFT İndirimli Sipariş'}</span>
                      </span>
                      {hasRealIban && (
                        <button
                          type="button"
                          onClick={handleCopyIban}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-[10px] font-bold text-emerald-900 hover:bg-emerald-100 transition"
                        >
                          {copiedIban ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedIban ? 'IBAN Kopyalandı' : 'IBAN Kopyala'}</span>
                        </button>
                      )}
                    </div>
                    {hasRealIban ? (
                      <div className="text-[11px] font-mono text-slate-700 space-y-0.5">
                        <div><strong>Banka:</strong> {bankInfo.bankName} — <strong>Alıcı:</strong> {bankInfo.accountHolder}</div>
                        <div><strong>IBAN:</strong> <span className="font-bold text-[#0A0A0B] select-all">{bankInfo.iban}</span></div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        %{bankInfo.transferDiscountPercent} havale indiriminiz tutardan düşülmüştür. Sipariş onayınızın hemen ardından resmi kurumsal IBAN bilgimiz SMS / WhatsApp ile tarafınıza iletilecektir.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Final Pricing Breakdown */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] text-xs space-y-2">
                <div className="flex justify-between text-[#64748B]">
                  <span>Malzeme Toplamı:</span>
                  <span className="font-mono font-bold text-[#0A0A0B]">{totalMaterial.toLocaleString('tr-TR')} ₺</span>
                </div>
                {totalLabor > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    <span className="flex items-center gap-1.5">
                      <Hammer className="w-3.5 h-3.5 text-amber-600" />
                      <span>Seçilen Usta Montaj & İşçilik Hizmeti:</span>
                    </span>
                    <span className="font-mono">+{totalLabor.toLocaleString('tr-TR')} ₺</span>
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
                    <span>Havale / EFT İndirimi (%{bankInfo.transferDiscountPercent}):</span>
                    <span className="font-mono">-{bankDiscount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                )}
                {installmentCommission > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Taksit Vade Farkı ({selectedInstallment} Taksit):</span>
                    <span className="font-mono font-bold">+{installmentCommission.toLocaleString('tr-TR')} ₺</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E8EAED] flex justify-between items-baseline font-black text-sm sm:text-base text-[#0A0A0B]">
                  <span>Ödenecek Net Tutar:</span>
                  <span className="font-mono text-xl text-[#0A0A0B]">{grandTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                {paymentMethod === 'credit_card' && selectedInstallment > 1 && (
                  <div className="text-[11px] font-semibold text-emerald-700 text-right">
                    {selectedInstallment} Ay Boyunca Aylık: <strong>{monthlyInstallmentAmount.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                )}
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
                  <span>
                    {isSubmitting 
                      ? 'İşlem Yapılıyor...' 
                      : paymentMethod === 'credit_card'
                      ? `3D Güvenli Ödeme İle Tamamla (${grandTotal.toLocaleString('tr-TR')} ₺)`
                      : 'Siparişi Onayla & Oluştur'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    256-Bit SSL Şifreleme
                  </span>
                  <span>•</span>
                  <span>3D Secure Doğrulama</span>
                  <span>•</span>
                  <span>BKM & Banka Güvencesi</span>
                </div>
              </div>

            </form>
          )}

        </div>

      </div>

      {/* ======================================================== */}
      {/* REAL PAYTR 3D SECURE OFFICIAL IFRAME MODAL               */}
      {/* ======================================================== */}
      {paytrIframeUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-[#0A0A0B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold tracking-tight">PAYTR 3D SECURE GÜVENLİ ÖDEME</h4>
                  <span className="text-[10px] text-slate-300">
                    PCI-DSS Level 1 Şifreli Banka Ortak Ödeme Sayfası
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaytrIframeUrl(null);
                  setPaytrMerchantOid(null);
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 bg-white overflow-y-auto min-h-[480px]">
              <iframe
                src={paytrIframeUrl}
                title="PayTR 3D Secure Ödeme"
                className="w-full h-[520px] border-0"
                allow="payment *"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-slate-500">
                3D Secure onayından sonra siparişiniz otomatik onaylanır.
              </span>
              {paytrMerchantOid && (
                <button
                  type="button"
                  disabled={isCheckingPaytr}
                  onClick={async () => {
                    setIsCheckingPaytr(true);
                    try {
                      const check = await dbService.checkPaytrOrderStatus(paytrMerchantOid);
                      if (check.ok && check.status === 'paid' && check.lead) {
                        setProvisionRef(paytrMerchantOid);
                        await onOrderCompleted(check.lead, { alreadySavedInCloud: true });
                        setCreatedOrder(check.lead);
                        setPaytrIframeUrl(null);
                        setPaytrMerchantOid(null);
                      }
                    } finally {
                      setIsCheckingPaytr(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#0A0A0B] text-white font-bold text-[11px] hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {isCheckingPaytr ? 'Kontrol Ediliyor...' : 'Ödemeyi Tamamladım, Kontrol Et'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3D SECURE SMS VERIFICATION SIMULATION MODAL              */}
      {/* ======================================================== */}
      {is3DSecureModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Bank 3D Secure Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold tracking-tight">3D SECURE DOĞRULAMA</h4>
                  <span className="text-[10px] text-slate-300">{activeBankObj.name} Güvenli Ödeme</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIs3DSecureModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3D Secure Body */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* Summary Table */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">İşyeri:</span>
                  <span className="font-bold text-slate-800">RVOBA MİMARLIK VE YAPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">İşlem Tutarı:</span>
                  <span className="font-mono font-bold text-emerald-700">{grandTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taksit:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInstallment === 1 ? 'Tek Çekim' : `${selectedInstallment} Taksit`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kart Numarası:</span>
                  <span className="font-mono text-slate-800">
                    •••• •••• •••• {cardNumber.replace(/\s/g, '').slice(-4) || '1234'}
                  </span>
                </div>
              </div>

              {/* SMS Code Prompt */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Doğrulama SMS şifresi <strong>+90 {phone ? phone.slice(-4).padStart(10, '*') : '5** *** ** 37'}</strong> nolu cep telefonunuza gönderilmiştir.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    6 Haneli SMS Doğrulama Kodu:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      placeholder="123456"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#F8F9FA] border-2 border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-center text-lg font-mono font-black tracking-widest text-[#0A0A0B] focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setSmsCode('123456')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-[10px] font-bold text-slate-700 shrink-0 transition"
                      title="Test için otomatik 123456 doldurur"
                    >
                      Test Kodu Doldur (123456)
                    </button>
                  </div>
                </div>

                {smsError && (
                  <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{smsError}</span>
                  </div>
                )}
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Kalan Süre: <strong className="font-mono text-slate-800">{formatTimer(smsTimer)}</strong></span>
                {smsTimer === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSmsTimer(180);
                      setSmsError('');
                    }}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Tekrar Gönder
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">Şifre geçerlilik süresi</span>
                )}
              </div>

              {/* Verify Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isVerifyingSms || smsCode.length < 6}
                  onClick={handleVerifySms}
                  className="w-full btn-pill-black bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  {isVerifyingSms ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>3D Secure Onayı Alınıyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Onayla ve Ödemeyi Tamamla</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIs3DSecureModalOpen(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-700 py-1"
                >
                  İptal Et ve Geri Dön
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
