import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Layers, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Info,
  TrendingDown
} from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface SmartMeasurementCalculatorProps {
  product: Product;
  selectedVariant?: ProductVariant;
  onApplyCalculation: (quantity: number, variant?: ProductVariant) => void;
  onClose: () => void;
}

export const SmartMeasurementCalculator: React.FC<SmartMeasurementCalculatorProps> = ({
  product,
  selectedVariant: initialVariant,
  onApplyCalculation,
  onClose,
}) => {
  const rule = product.coverageRule || {
    coveragePerUnit: product.unit === 'paket' ? 1.83 : product.unit === 'kova' ? 130 : 1.5,
    unitLabel: product.unit === 'paket' ? 'm²' : product.unit === 'kova' ? 'm²' : 'm²',
    defaultWastePercent: product.unit === 'paket' ? 7 : 5,
    calculationType: 'area',
  };

  const [mode, setMode] = useState<'dimensions' | 'area'>('dimensions');
  const [width, setWidth] = useState<number>(4.0);
  const [length, setLength] = useState<number>(5.0);
  const [directArea, setDirectArea] = useState<number>(20.0);
  const [wastePercent, setWastePercent] = useState<number>(rule.defaultWastePercent || 7);
  const [activeVariant, setActiveVariant] = useState<ProductVariant | undefined>(
    initialVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined)
  );

  // Calculations
  const netArea = mode === 'dimensions' ? Math.round(width * length * 100) / 100 : directArea;
  const wasteArea = Math.round(netArea * (wastePercent / 100) * 100) / 100;
  const grossAreaNeeded = Math.round((netArea + wasteArea) * 100) / 100;

  // Package units needed
  const unitsNeeded = Math.max(1, Math.ceil(grossAreaNeeded / rule.coveragePerUnit));
  const totalCoveredArea = Math.round(unitsNeeded * rule.coveragePerUnit * 100) / 100;
  const surplusSafetyArea = Math.max(0, Math.round((totalCoveredArea - netArea) * 100) / 100);

  // Pricing
  const variantDiff = activeVariant?.priceDifference || 0;
  const unitPrice = product.materialPrice + variantDiff;
  const totalPrice = unitPrice * unitsNeeded;
  const marketUnitPrice = (product.marketPrice || Math.round(product.materialPrice * 1.35)) + variantDiff;
  const totalMarketPrice = marketUnitPrice * unitsNeeded;
  const totalSavings = Math.max(0, totalMarketPrice - totalPrice);

  const handleApply = () => {
    onApplyCalculation(unitsNeeded, activeVariant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 selection:bg-black selection:text-white">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[94vh] border border-[#E8EAED]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8EAED] flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0A0A0B] text-white flex items-center justify-center shadow-md">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-[#0A0A0B]">
                Akıllı Metraj & Kutu Hesaplayıcı
              </h3>
              <p className="text-xs text-[#64748B]">
                {product.brand} — {product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Mode Tabs */}
          <div className="p-1 rounded-2xl bg-slate-100 flex items-center">
            <button
              type="button"
              onClick={() => setMode('dimensions')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 ${
                mode === 'dimensions' 
                  ? 'bg-white text-[#0A0A0B] shadow-sm' 
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <span>Oda Ölçüleri (En x Boy)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('area')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 ${
                mode === 'area' 
                  ? 'bg-white text-[#0A0A0B] shadow-sm' 
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <span>Net Alan Girişi (m²)</span>
            </button>
          </div>

          {/* Inputs Section */}
          {mode === 'dimensions' ? (
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Oda Eni (Metre)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#0A0A0B] focus:border-black focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">m</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Oda Boyu (Metre)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={length}
                    onChange={(e) => setLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#0A0A0B] focus:border-black focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">m</span>
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Net Zemin/Duvar Alanı:</span>
                <span className="font-mono font-black text-sm text-[#0A0A0B]">{netArea.toFixed(2)} m²</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Kaplanacak Net Toplam Alan (m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="1000"
                  value={directArea}
                  onChange={(e) => setDirectArea(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-[#0A0A0B] focus:border-black focus:outline-none"
                />
                <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">m²</span>
              </div>
            </div>
          )}

          {/* Waste / Fire Margin Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <span>Önerilen Kesim Fire Payı:</span>
                <span className="text-emerald-700 font-mono">+{wastePercent}%</span>
              </span>
              <span className="text-[10px] text-slate-400">Usta kesim & süpürgelik payı</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Düz Döşeme', val: 5, note: '%5 Fire' },
                { label: 'Standart / Derzli', val: 7, note: '%7 (Önerilen)' },
                { label: 'Girintili / Çapraz', val: 10, note: '%10 Fire' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setWastePercent(opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    wastePercent === opt.val
                      ? 'border-black bg-slate-900 text-white font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px]">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${wastePercent === opt.val ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {opt.note}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Variant Selection if available */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#F1F3F5]">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>Model / Renk Varyantı:</span>
                <span className="text-slate-900 font-semibold">{activeVariant?.name || 'Seçiniz'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((v) => {
                  const isSelected = activeVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveVariant(v)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition ${
                        isSelected 
                          ? 'border-black bg-slate-50 font-bold ring-1 ring-black' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {v.colorHex && (
                        <span 
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs" 
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <div className="truncate">
                        <div className="text-[11px] truncate text-slate-900">{v.name}</div>
                        {v.priceDifference ? (
                          <div className="text-[9px] text-emerald-700 font-mono">
                            {v.priceDifference > 0 ? `+${v.priceDifference} ₺` : `${v.priceDifference} ₺`}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results Summary Box */}
          <div className="p-4 rounded-2xl bg-[#0A0A0B] text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">GEREKEN SİPARİŞ MİKTARI</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  {unitsNeeded} {product.unit}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">KAPSAM ALANI</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {totalCoveredArea} {rule.unitLabel}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  (Net: {netArea} m² + %{wastePercent} Fire)
                </div>
              </div>
            </div>

            {/* Price & Savings */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">TOPLAM MALZEME TUTARI</span>
                <div className="text-xl font-black font-mono text-white">
                  {totalPrice.toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[10px] text-slate-400">
                  ({unitPrice.toLocaleString('tr-TR')} ₺ / {product.unit})
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 block font-bold">PİYASA TASARRUFUNUZ</span>
                  <div className="text-sm font-black font-mono text-emerald-400">
                    -{totalSavings.toLocaleString('tr-TR')} ₺ Kazanç
                  </div>
                </div>
              )}
            </div>

            {surplusSafetyArea > 0 && (
              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Siparişinizde <strong>+{surplusSafetyArea} m²</strong> emniyet ve gelecekteki olası tadilat/hasar tamiri için yedek malzeme bulunacaktır.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E8EAED] bg-white flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-pill-outline py-3 px-4 text-xs font-semibold"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 btn-pill-black bg-[#0A0A0B] hover:bg-slate-800 text-white py-3 px-5 text-xs font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>{unitsNeeded} {product.unit} Olarak Sepete Ekle ({totalPrice.toLocaleString('tr-TR')} ₺)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
