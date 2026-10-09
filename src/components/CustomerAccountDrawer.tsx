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
  Save
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

  const getStatusBadge = (status: LeadRequest['status']) => {
    switch (status) {
      case 'sozlesme_imzalandi':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">🟢 Sözleşme İmzalandı</span>;
      case 'kesif_verildi':
        return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">🟣 Keşif Randevusu Verildi</span>;
      case 'arandi':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">🔵 Mimar Aradı</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">🟡 İşleme Alındı</span>;
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
                Siparişlerim ({userOrders.length})
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
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sipariş & Teklif Geçmişiniz
                  </h4>
                  <span className="text-xs text-slate-400">{userOrders.length} kayıt</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-[#F8F9FA] rounded-3xl p-6 border border-[#E8EAED]">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <h5 className="font-bold text-sm text-[#0A0A0B]">Henüz Kayıtlı Talebiniz Yok</h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Mimari malzeme siparişleriniz veya anahtar teslim tadilat keşifleriniz burada listelenir.
                    </p>
                    <div className="flex flex-col gap-2 pt-2">
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
                    {userOrders.map((ord) => {
                      const isStore = ord.leadType === 'store_order' || ord.id.startsWith('store-order');
                      const isInspection = !isStore && !!ord.preferredDate;

                      return (
                        <div key={ord.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-3 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E8EAED]">
                            <div className="flex items-center gap-1.5">
                              {isStore ? (
                                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                              ) : isInspection ? (
                                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span className="font-bold text-black">
                                {isStore ? 'Mağaza Siparişi' : isInspection ? 'Lazer Keşif Randevusu' : 'Tadilat Teklifi'}
                              </span>
                            </div>
                            {getStatusBadge(ord.status)}
                          </div>

                          {/* Details */}
                          <div className="text-[11px] text-slate-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Tarih:</span>
                              <span className="font-mono text-black">{new Date(ord.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                            {ord.preferredDate && (
                              <div className="flex justify-between text-purple-700 font-semibold">
                                <span>Randevu:</span>
                                <span>{ord.preferredDate} ({ord.timeSlot || 'Gün Boyu'})</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Toplam Tutar:</span>
                              <span className="font-mono font-bold text-black text-xs">
                                {ord.totalAmount > 0 ? `${ord.totalAmount.toLocaleString('tr-TR')} ₺` : 'Keşif Sonrası'}
                              </span>
                            </div>
                          </div>

                          {/* Items summary */}
                          {ord.items && ord.items.length > 0 && (
                            <div className="pt-2 border-t border-[#E8EAED] space-y-1 text-[11px]">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-slate-700">
                                  <span>{it.quantity} {it.unit} • {it.name}</span>
                                  <span className="font-mono">{it.total > 0 ? `${it.total.toLocaleString('tr-TR')} ₺` : ''}</span>
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
