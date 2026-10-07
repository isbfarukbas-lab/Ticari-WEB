import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowLeftRight, Clock, MapPin, CheckCircle } from 'lucide-react';

export interface BeforeAfterProject {
  id: string;
  title: string;
  location: string;
  duration: string;
  scope: string;
  beforeImage: string;
  afterImage: string;
}

export const DEFAULT_BEFORE_AFTER_PROJECTS: BeforeAfterProject[] = [
  {
    id: 'proj-1',
    title: '3+1 Daire Salon & Zemin Dönüşümü',
    location: 'Kadıköy, İstanbul',
    duration: '5 İş Günü',
    scope: 'Aydan Silinir Boya + 10mm Derzli Meşe Parke + Lake Süpürgelik',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'proj-2',
    title: 'Ebeveyn Banyo & Seramik Yenileme',
    location: 'Beşiktaş, İstanbul',
    duration: '4 İş Günü',
    scope: 'Kırım + Su Yalıtımı + 60x120 Granit Seramik + Gömme Rezervuar',
    beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    afterImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
  },
];

interface BeforeAfterSliderProps {
  projects?: BeforeAfterProject[];
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  projects = DEFAULT_BEFORE_AFTER_PROJECTS,
}) => {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const activeProj = projects[activeProjectIndex] || projects[0];

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      setSliderPosition(percent);
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button or touch/pen
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - (e.shiftKey ? 10 : 2)));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + (e.shiftKey ? 10 : 2)));
    }
  };

  return (
    <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-10 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0B] text-white text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MİMARİ DÖNÜŞÜM VİTRİNİ</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0A0A0B]">
            Öncesi & Sonrası: RVOBA Dönüşümleri
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl leading-relaxed">
            Eski, yıpranmış mekanların şeffaf bütçeli sözleşmeyle nasıl modern mimari yaşam alanlarına dönüştüğünü çubuğu kaydırarak canlı inceleyin.
          </p>
        </div>

        {/* Proje Değiştirme Butonları */}
        {projects.length > 1 && (
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {projects.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActiveProjectIndex(idx);
                  setSliderPosition(50);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition ${
                  activeProjectIndex === idx
                    ? 'bg-[#0A0A0B] text-white shadow-sm'
                    : 'bg-[#F1F3F5] text-[#4B5563] hover:text-[#0A0A0B]'
                }`}
              >
                Proje {idx + 1}: {p.title.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* İnteraktif Öncesi / Sonrası Slider Alanı */}
      <div
        ref={containerRef}
        role="slider"
        aria-label="Öncesi ve sonrası görsel karşılaştırma kaydırıcısı"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
        className={`relative w-full h-[320px] sm:h-[480px] rounded-3xl overflow-hidden cursor-ew-resize select-none border border-[#CBD5E1] shadow-inner touch-none outline-none focus-visible:ring-2 focus-visible:ring-black ${
          isDragging ? 'cursor-grabbing' : 'cursor-ew-resize'
        }`}
      >
        {/* Sonrası Görseli (Arka Planda Tam Görsel) */}
        <img
          src={activeProj.afterImage}
          alt="Sonrası — RVOBA Teslimi"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Öncesi Görseli (CSS GPU clip-path ile donanımsal hızlandırmalı kırpma) */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden will-change-[clip-path]"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <img
            src={activeProj.beforeImage}
            alt="Öncesi — Eski Hali"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
          {/* Sol Görsel Üzerindeki Karartma & Etiket */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md border border-white/20 select-none">
            ÖNCESİ: Eski / Yıpranmış Hali
          </div>
        </div>

        {/* Sağ Görsel Etiketi */}
        <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md border border-white/20 flex items-center gap-1.5 select-none pointer-events-none">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>SONRASI: RVOBA Mimari Teslimi</span>
        </div>

        {/* Dikey Kaydırma Çizgisi & Buton */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none select-none will-change-[left]"
          style={{
            left: `${sliderPosition}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-black/25 transition-transform duration-75 ${
              isDragging ? 'scale-110 ring-black/40' : 'scale-100 hover:scale-105'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* Alt Talimat İpucu */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold px-4 py-1.5 rounded-full shadow pointer-events-none select-none flex items-center gap-2 transition-opacity duration-300 ${
            isDragging ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <ArrowLeftRight className="w-3 h-3 text-slate-300" />
          <span>Karşılaştırmak için çubuğu sağa sola kaydırın</span>
        </div>
      </div>

      {/* Proje Detay Kartı */}
      <div className="mt-6 p-5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
            <span>{activeProj.title}</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-[#64748B] flex items-center gap-1 font-normal text-xs">
              <MapPin className="w-3.5 h-3.5" />
              {activeProj.location}
            </span>
          </h4>
          <p className="text-slate-600 mt-1">
            <strong>Yapılan İşlemler:</strong> {activeProj.scope}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-white border border-[#E2E4E8] text-right">
            <div className="text-[10px] text-[#64748B] flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Teslimat Süresi:</span>
            </div>
            <strong className="text-xs font-bold text-[#0A0A0B] font-mono">
              {activeProj.duration}
            </strong>
          </div>
        </div>
      </div>

    </div>
  );
};
