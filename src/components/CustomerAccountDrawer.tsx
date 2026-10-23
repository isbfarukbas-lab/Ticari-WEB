import React, { useState } from 'react';
import { 
  X, 
  User, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ShoppingBag, 
  ShieldCheck,
  Building,
  Edit2,
  Save,
  Truck
} from 'lucide-react';
import { CustomerUser, CustomerAddress, LeadRequest } from '../types';

interface CustomerAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerUser;
  leads: LeadRequest[];
  onLogout: () => void;
  onUpdateUser: (updatedUser: CustomerUser) => void;
  onNavigateStore: () => void;
  onNavigateConfigurator: () => void;
}

export const CustomerAccountDrawer: React.FC<CustomerAccountDrawerProps> = ({
  isOpen,
  onClose,
  user,
  leads,
  onLogout,
  onUpdateUser,
  onNavigateStore,
  onNavigateConfigurator,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orderSubTab, setOrderSubTab] = useState<'active' | 'archived'>('active');

  // New Address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('Evim');
  const [newAddrCity, setNewAddrCity] = useState(user.city || 'İstanbul');
  const [newAddrDistrict, setNewAddrDistrict] = useState(user.district || 'Kadıköy');
  const [newAddrDetails, setNewAddrDetails] = useState('');

  // Profile Edit state
  const [editFullName, setEditFullName] = useState(user.fullName);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editCity, setEditCity] = useState(user.city);
  const [editDistrict, setEditDistrict] = useState(user.district);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  if (!isOpen) return null;

  // Filter user orders & leads by customerId or phone match
  const userCleanPhone = user.phone.replace(/\D/g, '');
  const userOrders = leads.filter(l => {
    if (l.customerId === user.id) return true;
    const lCleanPhone = (l.phone || '').replace(/\D/g, '');
    return lCleanPhone.length > 8 && userCleanPhone.length > 8 && lCleanPhone.endsWith(userCleanPhone.slice(-8));
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrDetails.trim()) return;

    const newAddr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      title: newAddrTitle.trim() || 'Yeni Adres',
      city: newAddrCity,
      district: newAddrDistrict,
      fullAddress: newAddrDetails.trim(),
      isDefault: user.addresses.length === 0,
    };

    const updated: CustomerUser = {
      ...user,
      addresses: [...user.addresses, newAddr],
    };

    onUpdateUser(updated);
    setIsAddingAddress(false);
    setNewAddrDetails('');
  };

  const handleDeleteAddress = (addrId: string) => {
    const updated: CustomerUser = {
      ...user,
      addresses: user.addresses.filter(a => a.id !== addrId),
    };
    onUpdateUser(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerUser = {
      ...user,
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      city: editCity,
      district: editDistrict,
    };
    onUpdateUser(updated);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  const normalizeLeadStatus = (status?: string): LeadRequest['status'] => {
    if (status === 'sozlesme_imzalandi' || status === 'completed') return 'sozlesme_imzalandi';
    if (status === 'kesif_verildi' || status === 'scheduled') return 'kesif_verildi';
    if (status === 'arandi' || status === 'contacted') return 'arandi';
    return 'bekliyor';
  };

  const getStepIndex = (status?: string) => {
    const norm = normalizeLeadStatus(status);
    if (norm === 'sozlesme_imzalandi') return 3;
    if (norm === 'kesif_verildi') return 2;
    if (norm === 'arandi') return 1;
    return 0;
  };

  const activeUserOrders = userOrders.filter(
    (ord) => normalizeLeadStatus(ord.status) !== 'sozlesme_imzalandi'
  );
  const archivedUserOrders = userOrders.filter(
    (ord) => normalizeLeadStatus(ord.status) === 'sozlesme_imzalandi'
  );
  const displayedOrders = orderSubTab === 'active' ? activeUserOrders : archivedUserOrders;

  const getStatusBadge = (status: LeadRequest['status'] | string | undefined, isStore: boolean) => {
    const norm = normalizeLeadStatus(status);
    switch (norm) {
      case 'sozlesme_imzalandi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{isStore ? 'Teslim Edildi' : 'Sözleşme İmzalandı'}</span>
          </span>
        );
      case 'kesif_verildi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>{isStore ? 'Kargoya Verildi / Sevkiyatta' : 'Keşif Randevusu Verildi'}</span>
          </span>
        );
      case 'arandi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>{isStore ? 'Onaylandı & Hazırlanıyor' : 'Mimar Aradı'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>{isStore ? 'Sipariş Alındı' : 'Talep Alındı'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0A0B]/60 backdrop-blur-sm transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-sans">
          
          {/* Header */}
          <div className="p-6 bg-[#0A0A0B] text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-base shadow-inner">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base tracking-tight text-white">
                    {user.fullName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {user.phone} • {user.city}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Tabs */}
            <div className="flex items-center justify-between pt-3 text-xs">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-1.5 text-center font-bold rounded-lg transition ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Siparişlerim ({activeUserOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex-1 py-1.5 text-center font-bold rounded-lg transition ${
                  activeTab === 'addresses' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Adreslerim ({user.addresses.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-1.5 text-center font-bold rounded-lg transition ${
                  activeTab === 'profile' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hesap
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: SİPARİŞLERİM & TEKLİFLERİM */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Sub-tabs: Aktif Siparişler vs Geçmiş / Tamamlanan */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F1F3F5] border border-[#E8EAED]">
                  <button
                    type="button"
                    onClick={() => setOrderSubTab('active')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      orderSubTab === 'active'
                        ? 'bg-white text-[#0A0A0B] shadow-sm'
                        : 'text-slate-500 hover:text-[#0A0A0B]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Aktif Siparişler ({activeUserOrders.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSubTab('archived')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      orderSubTab === 'archived'
                        ? 'bg-white text-[#0A0A0B] shadow-sm'
                        : 'text-slate-500 hover:text-[#0A0A0B]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Geçmiş / Arşiv ({archivedUserOrders.length})</span>
                  </button>
                </div>

                {displayedOrders.length === 0 ? (
                  <div className="py-10 text-center space-y-3 bg-[#F8F9FA] rounded-3xl p-6 border border-[#E8EAED]">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <h5 className="font-bold text-sm text-[#0A0A0B]">
                      {orderSubTab === 'active'
                        ? 'Devam Eden Aktif Siparişiniz Yok'
                        : 'Henüz Tamamlanan Siparişiniz Bulunmuyor'}
                    </h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      {orderSubTab === 'active' && archivedUserOrders.length > 0
                        ? `Teslim edilen ${archivedUserOrders.length} adet siparişiniz otomatik olarak "Geçmiş / Arşiv" sekmesine taşınmıştır.`
                        : 'Mimari malzeme siparişleriniz veya anahtar teslim tadilat keşifleriniz burada listelenir.'}
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
                      {orderSubTab === 'active' && archivedUserOrders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setOrderSubTab('archived')}
                          className="btn-pill-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 font-bold"
                        >
                          Geçmiş Siparişlerimi Gör ({archivedUserOrders.length})
                        </button>
                      )}
                      <button
                        onClick={() => { onClose(); onNavigateStore(); }}
                        className="btn-pill-black text-xs py-2.5 font-bold"
                      >
                        Ürünlerimizi İncele
                      </button>
                      <button
                        onClick={() => { onClose(); onNavigateConfigurator(); }}
                        className="btn-pill-outline text-xs py-2"
                      >
                        Tadilat Teklifi Hesapla
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedOrders.map((ord) => {
                      const isStore = ord.leadType === 'web_order' || ord.leadType === 'store_order' || ord.id.startsWith('store-order') || ord.id.startsWith('order-');
                      const isInspection = !isStore && !!ord.preferredDate;
                      const stepIdx = getStepIndex(ord.status);
                      const steps = isStore
                        ? ['Sipariş Alındı', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi']
                        : ['Talep Alındı', 'Mimar Aradı', 'Keşif Planlandı', 'Sözleşme'];
                      const itemsSubtotal = (ord.items || []).reduce((s, it) => s + (it.total || 0), 0);
                      const hasTrackingNote =
                        ord.adminNotes &&
                        !ord.adminNotes.startsWith('Ödeme Tercihi:') &&
                        !ord.adminNotes.startsWith('Ödeme: Sanal POS');

                      return (
                        <div key={ord.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-3 text-xs">
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E8EAED]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isStore ? (
                                <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : isInspection ? (
                                <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              <span className="font-bold text-black">
                                {isStore ? 'Online Sipariş' : isInspection ? 'Lazer Keşif Randevusu' : 'Tadilat Teklifi'}
                              </span>
                              {ord.orderNumber && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-900">
                                  #{ord.orderNumber}
                                </span>
                              )}
                            </div>
                            {getStatusBadge(ord.status, isStore)}
                          </div>

                          {/* 4-Step Progress Bar */}
                          <div className="grid grid-cols-4 gap-1 pt-0.5">
                            {steps.map((label, idx) => {
                              const isDone = idx <= stepIdx;
                              const isCurrent = idx === stepIdx;
                              return (
                                <div key={label} className="space-y-1">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      isDone ? 'bg-emerald-600' : 'bg-slate-200'
                                    }`}
                                  />
                                  <div
                                    className={`text-[9.5px] leading-tight ${
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

                          {/* Tracking / Admin Note if provided */}
                          {hasTrackingNote && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                              <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-800">
                                  Kargo & Teslimat Bilgilendirmesi:
                                </span>
                                <span className="font-medium">{ord.adminNotes}</span>
                              </div>
                            </div>
                          )}

                          {/* Details */}
                          <div className="text-[11px] text-slate-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Tarih:</span>
                              <span className="font-mono text-black">{new Date(ord.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                            {(ord.city || ord.district) && (
                              <div className="flex justify-between gap-2">
                                <span>Teslimat Bölgesi:</span>
                                <span className="font-semibold text-black text-right">
                                  {ord.district ? `${ord.district} / ${ord.city}` : ord.city}
                                </span>
                              </div>
                            )}
                            {ord.paymentMethod && (
                              <div className="flex justify-between">
                                <span>Ödeme Yöntemi:</span>
                                <span className="font-semibold text-black">
                                  {ord.paymentMethod === 'bank_transfer'
                                    ? 'Banka Havalesi / EFT'
                                    : ord.paymentMethod === 'cash_on_delivery'
                                      ? 'Kapıda / Ambar Ödeme'
                                      : 'Kredi Kartı'}
                                </span>
                              </div>
                            )}
                            {ord.preferredDate && (
                              <div className="flex justify-between text-purple-700 font-semibold">
                                <span>Randevu:</span>
                                <span>{ord.preferredDate} ({ord.timeSlot || 'Gün Boyu'})</span>
                              </div>
                            )}
                            {isStore && ord.shippingCost !== undefined && (
                              <div className="flex justify-between">
                                <span>Kargo & Sevkiyat:</span>
                                <span className="font-mono font-semibold text-black">
                                  {ord.shippingCost > 0 ? `${ord.shippingCost.toLocaleString('tr-TR')} ₺` : 'Ücretsiz'}
                                </span>
                              </div>
                            )}
                            {isStore && itemsSubtotal > 0 && (itemsSubtotal + (ord.shippingCost || 0) > ord.totalAmount) && (
                              <div className="flex justify-between text-emerald-700 font-semibold">
                                <span>Havale / EFT İndirimi:</span>
                                <span className="font-mono">
                                  -{(itemsSubtotal + (ord.shippingCost || 0) - ord.totalAmount).toLocaleString('tr-TR')} ₺
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between pt-1 border-t border-slate-200/70">
                              <span className="font-semibold text-slate-700">Toplam Tutar:</span>
                              <span className="font-mono font-bold text-black text-xs">
                                {ord.totalAmount > 0 ? `${ord.totalAmount.toLocaleString('tr-TR')} ₺` : 'Keşif Sonrası'}
                              </span>
                            </div>
                          </div>

                          {/* Items summary */}
                          {ord.items && ord.items.length > 0 && (
                            <div className="pt-2 border-t border-[#E8EAED] space-y-1.5 text-[11px]">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 text-slate-700">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span>{it.quantity} {it.unit} • {it.name}</span>
                                    {it.variantName && (
                                      <span className="text-[9px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-full border border-slate-200">
                                        {it.variantName}
                                      </span>
                                    )}
                                    {it.purchaseType === 'with_installation' && (
                                      <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
                                        +Usta Montaj
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono shrink-0">{it.total > 0 ? `${it.total.toLocaleString('tr-TR')} ₺` : ''}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: KAYITLI ADRESLERİM */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Teslimat & Keşif Adresleriniz
                  </h4>
                  {!isAddingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Adres</span>
                    </button>
                  )}
                </div>

                {/* Add Address Form */}
                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-[#F8F9FA] border-2 border-dashed border-slate-300 space-y-3 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">Yeni Adres Bilgisi</span>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingAddress(false)}
                        className="text-slate-400 hover:text-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Adres Başlığı (Örn: Evim, Yazlık, Ofis)</label>
                      <input
                        type="text"
                        value={newAddrTitle}
                        onChange={(e) => setNewAddrTitle(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Şehir</label>
                        <input
                          type="text"
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">İlçe</label>
                        <input
                          type="text"
                          value={newAddrDistrict}
                          onChange={(e) => setNewAddrDistrict(e.target.value)}
                          className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Açık Adres (Cadde, Sokak, No, Daire)</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Mahalle, Cadde, No..."
                        value={newAddrDetails}
                        onChange={(e) => setNewAddrDetails(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl p-2 text-xs resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="btn-pill-outline text-xs py-1.5 px-3"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="btn-pill-black text-xs py-1.5 px-4 font-bold"
                      >
                        Adresi Kaydet
                      </button>
                    </div>
                  </form>
                )}

                {/* Address Cards */}
                {user.addresses.length === 0 && !isAddingAddress ? (
                  <div className="p-6 text-center bg-[#F8F9FA] rounded-2xl border text-xs text-slate-500">
                    <span>Kayıtlı teslimat adresiniz bulunmuyor. Yukarıdaki "Yeni Adres" butonundan ekleyebilirsiniz.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {user.addresses.map((addr) => (
                      <div key={addr.id} className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] flex items-start justify-between gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black">{addr.title}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Varsayılan</span>
                              )}
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                              {addr.fullAddress}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {addr.district} / {addr.city}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="Adresi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: HESAP BİLGİLERİ */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Profil & İletişim Bilgileri
                </h4>

                {isSavedFeedback && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Profil bilgileriniz başarıyla güncellendi.</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Telefon Numarası</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Varsayılan Şehir</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Varsayılan İlçe</label>
                    <input
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full btn-pill-black bg-[#0A0A0B] text-white py-2.5 font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Bilgileri Güncelle</span>
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer Logout */}
          <div className="p-4 border-t border-[#E8EAED] bg-[#FBFBFC] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              RVOBA® Müşteri Hesabı
            </span>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
