import React from 'react';
import { 
  ArrowUpRight, 
  TrendingDown, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Award, 
  Sparkles, 
  Check, 
  ArrowRight,
  Palette,
  Layers,
  Grid,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BeforeAfterProject } from '../types';

interface CustomerLandingPageProps {
  onStartConfiguring: () => void;
  onOpenInspection: () => void;
  onNavigateStore?: () => void;
  projects?: BeforeAfterProject[];
}

export const CustomerLandingPage: React.FC<CustomerLandingPageProps> = ({
  onStartConfiguring,
  onOpenInspection,
  onNavigateStore,
  projects,
}) => {
  return (
    <div className="space-y-24 pb-20">
      
      {/* ======================================================== */}
      {/* 1. HERO BÖLÜMÜ (Karşılama & Güçlü Manşet)               */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#E8EAED]">
        {/* Background Halftone Texture matching Image 1 */}
        <div className="absolute inset-0 halftone-texture opacity-35 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0B] text-white text-xs font-semibold mb-8 shadow-sm">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Piyasadan %20-30 Daha Uygun Toptan Bayi Fiyatı</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-[#0A0A0B] leading-[1.08] max-w-4xl mx-auto">
            Tadilatın en şeffaf hali: Usta stresi yok, piyasadan uygun fabrika fiyatı.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-[#4B5563] max-w-2xl mx-auto font-normal leading-relaxed">
            RestoLab doğrudan üretici ana bayi tedarikiyle çalışır. Aracı komisyonu olmadan, sözleşmeli sabit bütçe ve mimari teslim onayıyla ister evinizi anahtar teslim yenileriz, ister tasarım malzemelerimizi kapınıza sevk ederiz.
          </p>

          {/* 2 Clear Primary Paths / Service Gateways */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto text-left">
            
            {/* Kapı 1: Anahtar Teslim Tadilat & Mimarlık */}
            <div 
              onClick={onStartConfiguring}
              className="p-7 sm:p-8 rounded-3xl bg-[#0A0A0B] text-white cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all shadow-xl relative overflow-hidden group border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold">
                    <span>🏡 Hizmet & Mimarlık</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black flex items-center justify-center transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-black text-white tracking-tight">
                  Anahtar Teslim Tadilat
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                  Evinizi mimarımız ve usta kadromuz yönetsin. Malzeme + Usta + Sabit Bütçe tek kurumsal sözleşmeyle.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Tadilat Bütçeni Hesapla</span>
                <span>Ücretsiz Lazer Keşif →</span>
              </div>
            </div>

            {/* Kapı 2: Mimari Malzeme & Tasarım Mağazası */}
            <div 
              onClick={onNavigateStore}
              className="p-7 sm:p-8 rounded-3xl bg-white text-[#0A0A0B] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all shadow-lg relative overflow-hidden group border border-[#E8EAED] hover:border-[#0A0A0B] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>📦 Doğrudan Malzeme Satışı</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0A0A0B] group-hover:text-white flex items-center justify-center transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-black text-[#0A0A0B] tracking-tight">
                  Mimari Ürün Mağazası
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-2.5 leading-relaxed font-normal">
                  Usta aramıyorum, sadece 1. sınıf toptan bayi malzemelerimizi (Akustik panel, çıta, boya, batarya) kargoyla satın al.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8EAED] flex items-center justify-between text-xs font-bold text-[#0A0A0B]">
                <span>Ürünleri İncele & Sipariş Ver</span>
                <span>Tüm Türkiye'ye Kargo →</span>
              </div>
            </div>

          </div>

          {/* 4 Pillars of Guarantee Strip */}
          <div className="mt-20 pt-10 border-t border-[#E8EAED]">
            <p className="text-xs uppercase font-bold tracking-widest text-[#94A3B8] mb-6">
              RESTOLAB KURUMSAL GÜVENCELERİ
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
              <div className="p-5 rounded-3xl bg-white border border-[#E8EAED] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-3">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-xs font-bold text-[#0A0A0B]">Toptan Bayi Fiyatı</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">Aracı yok, piyasadan %25 daha uygun.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E8EAED] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#0A0A0B]">Tek Kurumsal Muhatap</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">Tüm süreci iç mimarımız yönetir.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E8EAED] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#0A0A0B]">Sözleşmeli Sabit Bütçe</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">Sürpriz masraf 1 TL dahi çıkmaz.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E8EAED] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#F1F3F5] flex items-center justify-center text-[#0A0A0B] mb-3">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#0A0A0B]">Mimari Teslim Onayı</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">Eksiksiz checklist, onayınızla teslim.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. NEDEN PİYASADAN DAHA UYGUNUZ? (Maliyet Stratejisi)    */}
      {/* ======================================================== */}
      <section id="neden-uygunuz" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            MALİYET VE ŞEFFAFLIK
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0A0A0B] mt-2">
            Neden Piyasadan Daha Uygunuz?
          </h2>
          <p className="text-sm text-[#64748B] mt-3">
            Geleneksel tadilattaki tüm aracıları ve gizli maliyetleri ortadan kaldırarak tasarrufu doğrudan fiyata yansıtıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-white border border-[#E8EAED] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-[#0A0A0B] mb-6 border border-[#E2E4E8]">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">Doğrudan Ana Dağıtım Kanalı</h3>
              <p className="text-xs text-[#64748B] mt-3 leading-relaxed">
                1. sınıf malzeme ve kartela gruplarını perakende hırdavatçıdan değil, doğrudan ana dağıtım kanallarından toptan palet bazlı tedarik ediyoruz. Perakende aracı kâr marjını fiyata yansıtmıyoruz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F1F3F5] text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>%25-35 Toptan Malzeme Avantajı</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E8EAED] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-[#0A0A0B] mb-6 border border-[#E2E4E8]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">Kendi Kadrolu Uzman Ekiplerimiz</h3>
              <p className="text-xs text-[#64748B] mt-3 leading-relaxed">
                Dışarıdan günübirlik taşeron aracı tutmayız. Kendi bünyemizdeki sigortalı ve sertifikalı boya, parke ve seramik ustalarımız çalışır. Her iş için ekstra taşeron komisyonu ödemezsiniz.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F1F3F5] text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Sıfır Taşeron & Aracı Komisyonu</span>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E8EAED] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F8F9FA] flex items-center justify-center text-[#0A0A0B] mb-6 border border-[#E2E4E8]">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0B]">Gizli Masraf Tuzağı Yok</h3>
              <p className="text-xs text-[#64748B] mt-3 leading-relaxed">
                Piyasadaki ustalar baştan ucuz söyleyip ortada "Astar, zımpara, bant örtü parası, nakliye" diyerek fiyatı ikiye katlar. Bizde astar, maskeleme, koruma, zımpara ve moloz atımı fiyata dahildir.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F1F3F5] text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Her Şey Dahil Sabit Bütçe</span>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SÜREÇ NASIL İŞLİYOR? (3 Basit Adım)                   */}
      {/* ======================================================== */}
      <section id="nasil-calisir" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            İŞLEYİŞ
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0A0A0B] mt-2">
            3 Adımda Zahmetsiz Ev Yenileme
          </h2>
          <p className="text-sm text-[#64748B] mt-3">
            Tadilatı karmaşık usta pazarlıklarından çıkarıp, şeffaf ve güvenli bir mimari sürece dönüştürdük.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] relative group">
            <span className="font-display font-black text-4xl text-[#E2E4E8] group-hover:text-[#0A0A0B] transition">
              01
            </span>
            <h3 className="text-base font-bold text-[#0A0A0B] mt-4 mb-2">
              Online Bütçeni Belirle
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Daire tipini seç; 1. Sınıf Duvar Boyası renk kartelasından ve Dayanıklı Laminat Zemin modellerinden seçimini yap. Net bütçeni anında gör. Özel bir isteğin varsa fotoğrafını yükle.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] relative group">
            <span className="font-display font-black text-4xl text-[#E2E4E8] group-hover:text-[#0A0A0B] transition">
              02
            </span>
            <h3 className="text-base font-bold text-[#0A0A0B] mt-4 mb-2">
              Numunelerle Ücretsiz Lazer Keşif
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Mimarımız geniş renk ve malzeme kartelalarıyla adresinize gelir; evinizin ışığında canlı seçim yaparsınız. Lazer metreyle net metraj çıkarılır.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-[#E8EAED] relative group">
            <span className="font-display font-black text-4xl text-[#E2E4E8] group-hover:text-[#0A0A0B] transition">
              03
            </span>
            <h3 className="text-base font-bold text-[#0A0A0B] mt-4 mb-2">
              Sözleşmeli Başlangıç veya İptal
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Sabit bütçeli sözleşme şartlarını onaylarsanız iş başlar. Şartlar veya bütçeniz uymazsa hiçbir ücret ödemezsiniz; hiçbir bağlayıcılık yoktur.
            </p>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. GERÇEK UYGULAMA VİTRİNİ (Gerçek Mekan Görselleri)      */}
      {/* ======================================================== */}
      <section id="vitrin" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            UYGULAMA GALERİSİ
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0A0A0B] mt-2">
            RestoLab Standartlarında Teslim Edilen Mekanlar
          </h2>
          <p className="text-sm text-[#64748B] mt-3">
            1. Sınıf silinebilir mat boyalar, dayanıklı derzli laminat zeminler ve 60x120 lüks granit seramik uygulamaları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group rounded-3xl overflow-hidden bg-white border border-[#E8EAED] shadow-sm">
            <div className="h-64 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
                alt="1. Sınıf Duvar Boyası"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-[10px] font-bold text-[#0A0A0B]">
                1. Sınıf Duvar Boyası
              </span>
            </div>
            <div className="p-5">
              <h4 className="text-xs font-bold text-[#0A0A0B]">1. Sınıf Duvar Boyaları — İpeksi Mat Kartela</h4>
              <p className="text-[11px] text-[#64748B] mt-1">İpeksi mat, leke tutmaz, astar ve rötuş işçiliği dahil.</p>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden bg-white border border-[#E8EAED] shadow-sm">
            <div className="h-64 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80"
                alt="Dayanıklı Laminat Zemin"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-[10px] font-bold text-[#0A0A0B]">
                Dayanıklı Laminat Zemin
              </span>
            </div>
            <div className="p-5">
              <h4 className="text-xs font-bold text-[#0A0A0B]">Dayanıklı Laminat Zeminler — Derzli Ahşap Seri</h4>
              <p className="text-[11px] text-[#64748B] mt-1">8cm lüks beyaz süpürgelik ve kapron şilte dahil uzman montaj.</p>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden bg-white border border-[#E8EAED] shadow-sm">
            <div className="h-64 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
                alt="Lüks Granit Seramik"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-[10px] font-bold text-[#0A0A0B]">
                Lüks Granit Seramik
              </span>
            </div>
            <div className="p-5">
              <h4 className="text-xs font-bold text-[#0A0A0B]">Lüks Granit Seramikler — 60x120 Geniş Ebat</h4>
              <p className="text-[11px] text-[#64748B] mt-1">Kırım, su yalıtımı izolasyonu ve lazer terazi montaj.</p>
            </div>
          </div>
        </div>

        {/* İnteraktif Öncesi / Sonrası Dönüşüm Kaydırıcısı */}
        <div className="mt-12">
          <BeforeAfterSlider projects={projects} />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. ALT ÇAĞRI BANNERI (Final CTA Banner)                  */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A0A0B] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>3 Dakikada Online Fiyatınızı Çıkarın</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
              Evinizi yenilemek için usta aramanıza gerek yok.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
              Geniş renk kartelasından ve zemin modellerinden seçiminizi yapın, anında net bütçenizi görün. Tek muhatabınız mimarımız.
            </p>

            <div className="pt-4 flex items-center justify-center">
              <button
                onClick={onStartConfiguring}
                className="btn-pill-black bg-white text-[#0A0A0B] hover:bg-slate-200 text-sm px-8 py-4 font-bold shadow-lg flex items-center gap-2"
              >
                <span>Tadilat Bütçeni Hesapla</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
