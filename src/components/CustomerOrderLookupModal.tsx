import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Calendar,
  Phone,
  MessageCircle,
  AlertCircle,
  Wrench,
  FileText,
} from 'lucide-react';
import { LeadRequest } from '../types';

interface CustomerOrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LeadRequest[];
  phoneNumber?: string;
  supportPhone?: string;
}

export const CustomerOrderLookupModal: React.FC<CustomerOrderLookupModalProps> = ({
  isOpen,
  onClose,
  leads,
  phoneNumber = '905447685137',
  supportPhone = '0544 768 51 37',
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizePhone = (val: string) => val.replace(/\D/g, '').slice(-10);

  const matchedLeads = (() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const upper = trimmed.toUpperCase().replace(/^#/, '');
    const digits = normalizePhone(trimmed);

    return leads.filter((lead) => {
      const orderMatch =
        (lead.orderNumber && lead.orderNumber.toUpperCase().replace(/^#/, '') === upper) ||
        lead.id.toUpperCase() === upper;
      const phoneMatch = digits.length >= 7 && normalizePhone(lead.phone || '').includes(digits);
      return orderMatch || phoneMatch;
    });
  })();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
  };

  const getStepIndex = (status?: LeadRequest['status']) => {
    if (status === 'sozlesme_imzalandi') return 3;
    if (status === 'kesif_verildi') return 2;
    if (status === 'arandi') return 1;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8EAED] overflow-hidden z-10 max-h-[90vh] flex flex-col text-[#0A0A0B]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0A0A0B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-extrabold">
                Sipariş & Usta Keşif Durumu Sorgula
              </h3>
              <p className="text-[11px] text-slate-400">
                Üye olmadan verdiğiniz siparişleri veya keşif randevularınızı telefon numaranızla takip edin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Telefon Numaranız (05XX...) veya Sipariş No (RV-SP-...)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searched) setSearched(false);
                }}
                className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-[#0A0A0B] placeholder:text-slate-400 focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="submit"
              className="btn-pill-black text-xs py-3 px-6 font-bold shrink-0 justify-center"
            >
              Sorgula
            </button>
          </form>

          {searched && matchedLeads.length === 0 && (
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-[#0A0A0B]">
                Bu numara veya sipariş koduyla eşleşen kayıt bulunamadı.
              </p>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Sipariş verirken kullandığınız telefon numarasını (Örn: 0532...) doğru yazdığınızdan emin olun veya doğrudan destek hattımızdan bilgi alın.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <a
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(`Merhaba, ${query} bilgisiyle verdiğim siparişin/talebin durumunu öğrenmek istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Destek Hattına Sor</span>
                </a>
              </div>
            </div>
          )}

          {matchedLeads.length > 0 && (
            <div className="space-y-4">
              {matchedLeads.map((lead) => {
                const isStore =
                  lead.leadType === 'store_order' ||
                  lead.leadType === 'web_order' ||
                  lead.id.startsWith('store-order') ||
                  lead.id.startsWith('order-');
                const stepIdx = getStepIndex(lead.status);

                const steps = isStore
                  ? [
                      'Sipariş Alındı',
                      'Onaylandı & Hazırlanıyor',
                      'Sevkiyat / Usta Planlandı',
                      'Teslim Edildi',
                    ]
                  : [
                      'Talep Alındı',
                      'Mimar İnceledi / Arandı',
                      'Keşif & Usta Planlandı',
                      'Sözleşme & Uygulama',
                    ];

                return (
                  <div
                    key={lead.id}
                    className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8EAED]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#0A0A0B]">
                            {isStore ? '🛍️ Malzeme / Montaj Siparişi' : '📐 Mimari Keşif & Tadilat Talebi'}
                          </span>
                          {lead.orderNumber && (
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-black text-white">
                              #{lead.orderNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {lead.fullName} • {lead.city} / {lead.district} •{' '}
                          {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#64748B] block">Toplam Tutar</span>
                        <strong className="text-base font-black font-mono text-[#0A0A0B]">
                          {lead.totalAmount.toLocaleString('tr-TR')} ₺
                        </strong>
                      </div>
                    </div>

                    {/* 4-Step Visual Progress Bar */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {steps.map((label, idx) => {
                        const isDone = idx <= stepIdx;
                        const isCurrent = idx === stepIdx;
                        return (
                          <div key={label} className="space-y-1.5">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-emerald-600' : 'bg-slate-200'
                              }`}
                            />
                            <div
                              className={`text-[10px] leading-tight ${
                                isCurrent
                                  ? 'font-extrabold text-emerald-800'
                                  : isDone
                                  ? 'font-semibold text-[#0A0A0B]'
                                  : 'text-slate-400'
                              }`}
                            >
                              {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Note / Tracking Info */}
                    {lead.adminNotes && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                        <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-800">
                            Sipariş & Teslimat Bilgilendirmesi:
                          </span>
                          <span className="font-medium">{lead.adminNotes}</span>
                        </div>
                      </div>
                    )}

                    {/* Items list */}
                    {lead.items && lead.items.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {lead.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-[#E8EAED]"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#0A0A0B]">{item.name}</span>
                              <span className="text-[11px] text-[#64748B]">
                                ({item.quantity} {item.unit})
                              </span>
                              {item.purchaseType === 'with_installation' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                  <Wrench className="w-2.5 h-2.5" />
                                  <span>+Usta Montaj</span>
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-[#0A0A0B]">
                              {item.total > 0 ? `${item.total.toLocaleString('tr-TR')} ₺` : 'Keşifte Netleşecek'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8EAED] text-[11px]">
                      <span className="text-[#64748B] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Destek: {supportPhone}</span>
                      </span>
                      <a
                        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                          `Merhaba, ${lead.orderNumber ? `#${lead.orderNumber} numaralı siparişim` : `${lead.fullName} adına kaydım`} hakkında bilgi almak istiyorum.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Bu Sipariş İçin WhatsApp'tan Yaz</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
