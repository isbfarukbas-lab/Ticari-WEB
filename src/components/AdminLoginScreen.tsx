import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginScreenProps {
  correctPassword?: string;
  onLoginSuccess: (rememberMe: boolean) => void;
  onNavigateHome: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  correctPassword = 'rvoba2026',
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (password.trim() === correctPassword) {
        onLoginSuccess(rememberMe);
      } else {
        setError('Girdiğiniz şifre hatalı. Lütfen tekrar deneyiniz.');
        setIsSubmitting(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden selection:bg-white selection:text-black">
      
      {/* Subtle architectural background pattern */}
      <div className="absolute inset-0 halftone-texture opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3.5 py-2 rounded-full border border-white/10 hover:border-white/30 bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>rvoba.com'a Dön</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit SSL Koruma</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#141416] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Header icon & title */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-white flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
                RVOBA® GÜVENLİ ERİŞİM
              </div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-white">
                Yönetici Portalı
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Katalog ürünleri, bayi fiyatları, siparişler ve teklif taleplerini yönetmek için şifrenizi girin.
              </p>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Yönetici Şifresi
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  placeholder="Şifrenizi yazın..."
                  className="w-full bg-[#1C1C1F] border border-white/15 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-white accent-white cursor-pointer"
                />
                <span>Bu cihazda beni hatırla</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full mt-2 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-black font-bold text-xs py-3.5 px-4 rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Giriş Yapılıyor...' : 'Yönetim Paneline Giriş Yap'}</span>
            </button>
          </form>

          {/* Initial setup hint */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              💡 Varsayılan Kurulum Şifresi: <code className="bg-white/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">rvoba2026</code>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Panel içine girdikten sonra "Site Ayarları" sekmesinden istediğiniz zaman şifrenizi değiştirebilirsiniz.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 py-4">
        © {new Date().getFullYear()} RVOBA® Mimarlık ve Yapı Çözümleri. Tüm hakları saklıdır.
      </footer>

    </div>
  );
};
