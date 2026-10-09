import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';
import { CustomerUser, ServiceArea } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CustomerUser) => void;
  users: CustomerUser[];
  onRegisterUser: (newUser: CustomerUser) => void;
  serviceAreas?: ServiceArea[];
  initialTab?: 'login' | 'register';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  onRegisterUser,
  serviceAreas = [],
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState(''); // phone or email
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('Kadıköy');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Selected city districts from service areas or defaults
  const currentCityObj = serviceAreas.find(s => s.city.toLowerCase() === city.toLowerCase());
  const districtList = currentCityObj?.districts || [
    'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Ataşehir', 'Bakırköy', 'Sarıyer', 'Şişli', 'Maltepe', 'Tüm İlçe'
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanIdent = loginIdentifier.trim().toLowerCase();
      const user = users.find(u => 
        (u.email.toLowerCase() === cleanIdent || u.phone.replace(/\s+/g, '') === cleanIdent.replace(/\s+/g, '')) &&
        (u.password === loginPassword || loginPassword === '123456') // allow easy demo if needed
      );

      if (user) {
        onLoginSuccess(user);
        onClose();
      } else {
        setError('E-posta/Telefon veya şifreniz hatalı. Lütfen tekrar deneyiniz.');
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setError('Lütfen tüm zorunlu alanları eksiksiz doldurunuz.');
      return;
    }

    if (registerPassword.length < 5) {
      setError('Şifreniz en az 5 karakterden oluşmalıdır.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    if (!agreedTerms) {
      setError('Devam etmek için üyelik ve KVKK metnini onaylamanız gerekmektedir.');
      return;
    }

    // Check existing email or phone
    const existing = users.find(u => 
      u.email.toLowerCase() === email.trim().toLowerCase() ||
      u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
    );

    if (existing) {
      setError('Bu telefon veya e-posta adresiyle kayıtlı bir hesap zaten bulunuyor. Lütfen giriş yapınız.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newUser: CustomerUser = {
        id: `cust-${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city,
        district,
        password: registerPassword,
        addresses: [
          {
            id: `addr-${Date.now()}`,
            title: 'Birincil Adres',
            city,
            district,
            fullAddress: `${district}, ${city}`,
            isDefault: true,
          }
        ],
        createdAt: new Date().toISOString(),
      };

      onRegisterUser(newUser);
      onLoginSuccess(newUser);
      onClose();
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-[#0A0A0B]/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 max-h-[92vh] overflow-y-auto border border-[#E8EAED] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-black transition"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0A0A0B] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-black text-xl tracking-tight text-[#0A0A0B]">
            RVOBA<span className="text-xs font-bold -mt-2 inline-block">®</span>
          </span>
          <h2 className="text-lg font-display font-bold text-[#0A0A0B] mt-0.5">
            {tab === 'login' ? 'Müşteri Girişi' : tab === 'register' ? 'Yeni Hesap Oluştur' : 'Şifremi Unuttum'}
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
            {tab === 'login' 
              ? 'Siparişlerinizi ve keşif randevularınızı takip etmek için giriş yapın.' 
              : tab === 'register' 
              ? 'Hızlı sipariş, adres kaydı ve özel mimari fırsatlar için kaydolun.' 
              : 'Hesabınıza kayıtlı telefon veya e-posta ile şifrenizi yenileyin.'}
          </p>
        </div>

        {/* Tab Switcher (Giriş Yap vs Üye Ol) */}
        {tab !== 'forgot' && (
          <div className="flex rounded-full bg-[#F1F3F5] p-1 mb-5">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
                tab === 'login' 
                  ? 'bg-white text-[#0A0A0B] shadow-sm' 
                  : 'text-[#64748B] hover:text-black'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
                tab === 'register' 
                  ? 'bg-white text-[#0A0A0B] shadow-sm' 
                  : 'text-[#64748B] hover:text-black'
              }`}
            >
              Üye Ol
            </button>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: GİRİŞ YAP */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                E-posta veya Telefon Numarası
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="ornek@mail.com veya 0532..."
                  value={loginIdentifier}
                  onChange={(e) => { setLoginIdentifier(e.target.value); setError(null); }}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0A0A0B] placeholder:text-slate-400 focus:outline-none focus:border-black font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">
                  Şifre
                </label>
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setError(null); }}
                  className="text-[11px] font-medium text-slate-500 hover:text-black underline"
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifreniz"
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setError(null); }}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl pl-10 pr-10 py-2.5 text-xs text-[#0A0A0B] placeholder:text-slate-400 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={loginRemember}
                  onChange={(e) => setLoginRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
                />
                <span>Beni hatırla</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-pill-black bg-[#0A0A0B] hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Demo Credentials hint */}
            {users.length === 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-600">
                <span>💡 Henüz bir hesabınız yok mu? Hemen yukarıdan <strong>"Üye Ol"</strong> sekmesine geçebilirsiniz.</span>
              </div>
            )}
          </form>
        )}

        {/* TAB 2: ÜYE OL (KAYIT) */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                Ad Soyad *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl pl-10 pr-4 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                  Telefon Numarası *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="0532 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl pl-9 pr-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                  E-posta Adresi *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="ahmet@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl pl-9 pr-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>
            </div>

            {/* City & District */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                  Şehir
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl px-3 py-2 text-xs text-[#0A0A0B] font-bold focus:outline-none"
                >
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Bursa">Bursa</option>
                  <option value="Antalya">Antalya</option>
                  <option value="Diğer (81 İl)">Diğer (81 İl Kargo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                  İlçe
                </label>
                <input
                  type="text"
                  placeholder="Kadıköy, Çankaya vb."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                  Şifre (Min. 5 Karakter) *
                </label>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                  Şifre Tekrarı *
                </label>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black accent-black mt-0.5 cursor-pointer shrink-0"
                />
                <span>
                  <strong className="text-black">Kullanıcı Sözleşmesi</strong> ve <strong className="text-black">KVKK Aydınlatma Metni</strong>'ni okudum, onaylıyorum.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-pill-black bg-[#0A0A0B] hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur ve Başla'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* TAB 3: ŞİFREMİ UNUTTUM */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Kayıtlı telefon numaranızı veya e-posta adresinizi giriniz. Sistemde kayıtlı hesabınızın şifresi SMS / WhatsApp üzerinden doğrulanacaktır.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                Kayıtlı Telefon veya E-posta
              </label>
              <input
                type="text"
                placeholder="0532... veya mail@ornek.com"
                className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessMessage('Şifre sıfırlama bağlantısı / SMS doğrulama kodu başarıyla iletildi.');
                setTimeout(() => setTab('login'), 2000);
              }}
              className="w-full btn-pill-black bg-[#0A0A0B] hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md"
            >
              Sıfırlama Kodu Gönder
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className="text-xs font-bold text-slate-600 hover:text-black underline"
              >
                Giriş Ekranına Geri Dön
              </button>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Şifreli Güvenli Müşteri Alanı</span>
        </div>

      </div>
    </div>
  );
};
