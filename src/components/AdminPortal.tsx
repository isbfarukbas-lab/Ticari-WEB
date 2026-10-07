import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  RotateCcw, 
  Phone, 
  Calendar,
  Layers,
  Inbox,
  Upload,
  Image as ImageIcon,
  FileText,
  Camera,
  Clock,
  MapPin,
  Sparkles,
  Settings as SettingsIcon,
  Wrench,
  Compass,
  TrendingDown,
  Send,
  Check,
  Search,
  ArrowRight,
  ShoppingBag,
  Lock,
  LogOut
} from 'lucide-react';
import { 
  CategoryKey, 
  Product, 
  LeadRequest, 
  CategoryInfo, 
  SiteSettings, 
  BeforeAfterProject,
  ServiceArea 
} from '../types';

interface AdminPortalProps {
  categories: CategoryInfo[];
  products: Product[];
  leads: LeadRequest[];
  settings: SiteSettings;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleActive: (productId: string) => void;
  onResetDefaults: () => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadRequest['status'], adminNotes?: string) => void;
  onDeleteLead: (leadId: string) => void;
  onNavigateCustomer: () => void;
  onLogout?: () => void;
}

const COMMON_BRANDS = [
  'Filli Boya',
  'Marshall',
  'Kütahya Seramik',
  'Yıldız Parke (VarioClic)',
  'VitrA',
  'AGT',
  'Schneider Electric',
  'Knauf',
  'RVOBA Özel',
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  categories,
  products,
  leads,
  settings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onToggleActive,
  onResetDefaults,
  onUpdateSettings,
  onUpdateLeadStatus,
  onDeleteLead,
  onNavigateCustomer,
  onLogout,
}) => {
  // Active Admin Module Tab
  const [adminTab, setAdminTab] = useState<
    'products' | 'labor_rates' | 'durations' | 'areas' | 'gallery' | 'leads' | 'settings'
  >('products');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // TAB 1: ÜRÜN & KARTELA YÖNETİMİ STATE
  // ==========================================
  // TAB 1: ÜRÜN & KARTELA YÖNETİMİ STATE
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all' | 'store'>('all');
  const [productSearch, setProductSearch] = useState('');
  
  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMaterialPrice, setEditMaterialPrice] = useState<number>(0);
  const [editLaborPrice, setEditLaborPrice] = useState<number>(0);
  const [editMarketPrice, setEditMarketPrice] = useState<number>(0);

  // Add Product Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryKey>('boya');
  const [newBrand, setNewBrand] = useState('Filli Boya');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newRoomImage, setNewRoomImage] = useState('');
  const [newMaterialPrice, setNewMaterialPrice] = useState<number>(85);
  const [newLaborPrice, setNewLaborPrice] = useState<number>(105);
  const [newMarketPrice, setNewMarketPrice] = useState<number>(250);
  const [newDescription, setNewDescription] = useState('');
  const [newIsStoreProduct, setNewIsStoreProduct] = useState(false);
  const [newUnit, setNewUnit] = useState<Product['unit']>('m²');
  const [newSpecs, setNewSpecs] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const roomFileInputRef = useRef<HTMLInputElement>(null);

  // Full Edit Modal for existing product
  const [editModalProduct, setEditModalProduct] = useState<Product | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editRoomFileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // TAB 2: TABAN İŞÇİLİK FİYATLARI STATE
  // ==========================================
  const [localLaborRates, setLocalLaborRates] = useState(settings.laborRates);

  // ==========================================
  // TAB 3: TESLİMAT SÜRELERİ STATE
  // ==========================================
  const [localDurationRules, setLocalDurationRules] = useState(settings.durationRules);

  // ==========================================
  // TAB 4: HİZMET BÖLGELERİ STATE
  // ==========================================
  const [localServiceAreas, setLocalServiceAreas] = useState<ServiceArea[]>(settings.serviceAreas);
  const [localCoverageNotice, setLocalCoverageNotice] = useState(settings.coverageNotice);
  const [newCityName, setNewCityName] = useState('');
  const [newCityDistricts, setNewCityDistricts] = useState('');
  const [newDistrictInputs, setNewDistrictInputs] = useState<Record<string, string>>({});

  // ==========================================
  // TAB 5: BEFORE / AFTER GALERİ YÖNETİMİ STATE
  // ==========================================
  const [localProjects, setLocalProjects] = useState<BeforeAfterProject[]>(settings.beforeAfterProjects);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('Kadıköy, İstanbul');
  const [newProjDuration, setNewProjDuration] = useState('5 İş Günü');
  const [newProjScope, setNewProjScope] = useState('');
  const [newProjBeforeImg, setNewProjBeforeImg] = useState('');
  const [newProjAfterImg, setNewProjAfterImg] = useState('');
  const beforeProjInputRef = useRef<HTMLInputElement>(null);
  const afterProjInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // TAB 6: CRM & GELEN TALEPLER STATE
  // ==========================================
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'bekliyor' | 'arandi' | 'kesif_verildi' | 'sozlesme_imzalandi'>('all');
  const [leadTypeFilter, setLeadTypeFilter] = useState<'all' | 'callback' | 'inspection' | 'whatsapp' | 'store_order'>('all');
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<LeadRequest | null>(null);

  // ==========================================
  // TAB 7: GENEL İLETİŞİM & AYARLAR STATE
  // ==========================================
  const [localPhone, setLocalPhone] = useState(settings.phoneNumber);
  const [localSupportPhone, setLocalSupportPhone] = useState(settings.supportPhone);
  const [localCompanyName, setLocalCompanyName] = useState(settings.companyName);
  const [localStages, setLocalStages] = useState(settings.paymentStages);
  const [localKdvNotice, setLocalKdvNotice] = useState(settings.kdvNotice || 'Fiyatlarımız bireysel müşterilerimiz için anahtar teslim %20 KDV dahil net tutardır.');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 4) {
      alert('Şifre en az 4 karakter olmalıdır.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      alert('Girdiğiniz şifreler birbiriyle uyuşmuyor.');
      return;
    }
    onUpdateSettings({
      ...settings,
      adminPassword: newAdminPassword.trim(),
    });
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    showToast('Yönetici şifresi başarıyla güncellendi.');
  };

  // Handle Photo Uploads for Products
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isRoom = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Fotoğraf boyutu 3MB üzerinde olamaz.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isRoom) setNewRoomImage(reader.result);
        else setNewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isRoom = false) => {
    const file = e.target.files?.[0];
    if (!file || !editModalProduct) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Fotoğraf boyutu 3MB üzerinde olamaz.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isRoom) {
          setEditModalProduct({ ...editModalProduct, roomImage: reader.result });
        } else {
          setEditModalProduct({ ...editModalProduct, image: reader.result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Product Submit
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      alert('Lütfen ürün adı ve kodunu giriniz.');
      return;
    }
    const newProduct: Product = {
      id: `custom-prod-${Date.now()}`,
      category: newCategory,
      brand: newBrand,
      name: newName.trim(),
      code: newCode.trim(),
      image: newImage || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80',
      roomImage: newRoomImage || undefined,
      description: newDescription.trim() || `${newBrand} 1. sınıf mimari seri ürün.`,
      unit: (newUnit || categories.find(c => c.key === newCategory)?.unit || 'm²') as Product['unit'],
      materialPrice: newMaterialPrice,
      workmanshipPrice: newLaborPrice,
      marketPrice: newMarketPrice,
      isActive: true,
      isStoreProduct: newIsStoreProduct,
      specs: newSpecs.split('\n').map(s => s.trim()).filter(Boolean),
    };
    onAddProduct(newProduct);
    setIsAddOpen(false);
    setNewName('');
    setNewCode('');
    setNewImage('');
    setNewRoomImage('');
    setNewDescription('');
    setNewIsStoreProduct(false);
    setNewUnit('m²');
    setNewSpecs('');
    showToast('Yeni ürün kataloğa başarıyla eklendi.');
  };

  // Save Inline Edit
  const handleSaveInline = (p: Product) => {
    onUpdateProduct({
      ...p,
      materialPrice: editMaterialPrice,
      workmanshipPrice: editLaborPrice,
      marketPrice: editMarketPrice,
    });
    setEditingId(null);
    showToast(`${p.name} fiyatları güncellendi.`);
  };

  // Save Labor Rates
  const handleSaveLaborRates = () => {
    const updated: SiteSettings = {
      ...settings,
      laborRates: localLaborRates,
    };
    onUpdateSettings(updated);
    showToast('Taban işçilik fiyatları başarıyla kaydedildi.');
  };

  // Save Duration Rules
  const handleSaveDurations = () => {
    const updated: SiteSettings = {
      ...settings,
      durationRules: localDurationRules,
    };
    onUpdateSettings(updated);
    showToast('Teslimat süresi takvim kuralları kaydedildi.');
  };

  // Save Service Areas
  const handleSaveAreas = () => {
    const updated: SiteSettings = {
      ...settings,
      serviceAreas: localServiceAreas,
      coverageNotice: localCoverageNotice,
    };
    onUpdateSettings(updated);
    showToast('Hizmet bölgeleri ve duyuru metni kaydedildi.');
  };

  // Add City
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const districts = newCityDistricts
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
    const newArea: ServiceArea = {
      city: newCityName.trim(),
      districts: districts.length > 0 ? districts : ['Merkez'],
    };
    const updated = [...localServiceAreas, newArea];
    setLocalServiceAreas(updated);
    setNewCityName('');
    setNewCityDistricts('');
    showToast(`${newArea.city} şehri hizmet bölgelerine eklendi.`);
  };

  // Add District to City
  const handleAddDistrict = (cityName: string) => {
    const text = newDistrictInputs[cityName]?.trim();
    if (!text) return;
    setLocalServiceAreas(prev =>
      prev.map(area =>
        area.city === cityName
          ? { ...area, districts: [...area.districts, text] }
          : area
      )
    );
    setNewDistrictInputs(prev => ({ ...prev, [cityName]: '' }));
  };

  // Remove District from City
  const handleRemoveDistrict = (cityName: string, districtName: string) => {
    setLocalServiceAreas(prev =>
      prev.map(area =>
        area.city === cityName
          ? { ...area, districts: area.districts.filter(d => d !== districtName) }
          : area
      )
    );
  };

  // Delete City
  const handleDeleteCity = (cityName: string) => {
    if (confirm(`${cityName} şehrini hizmet bölgelerinden silmek istediğinize emin misiniz?`)) {
      setLocalServiceAreas(prev => prev.filter(a => a.city !== cityName));
    }
  };

  // Add Before/After Project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjBeforeImg || !newProjAfterImg) {
      alert('Lütfen proje başlığı, öncesi ve sonrası görsellerini yükleyin.');
      return;
    }
    const newProj: BeforeAfterProject = {
      id: `proj-${Date.now()}`,
      title: newProjTitle.trim(),
      location: newProjLocation.trim() || 'İstanbul',
      duration: newProjDuration.trim() || '5 İş Günü',
      scope: newProjScope.trim() || 'Boya ve zemin yenileme',
      beforeImage: newProjBeforeImg,
      afterImage: newProjAfterImg,
    };
    const updated = [...localProjects, newProj];
    setLocalProjects(updated);
    onUpdateSettings({ ...settings, beforeAfterProjects: updated });
    setIsAddProjectOpen(false);
    setNewProjTitle('');
    setNewProjScope('');
    setNewProjBeforeImg('');
    setNewProjAfterImg('');
    showToast('Yeni Öncesi/Sonrası projesi başarıyla eklendi.');
  };

  // Delete Project
  const handleDeleteProject = (projId: string) => {
    if (confirm('Bu dönüşüm projesini silmek istediğinize emin misiniz?')) {
      const updated = localProjects.filter(p => p.id !== projId);
      setLocalProjects(updated);
      onUpdateSettings({ ...settings, beforeAfterProjects: updated });
      showToast('Proje galeriden silindi.');
    }
  };

  // Save General Settings
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      phoneNumber: localPhone.trim(),
      supportPhone: localSupportPhone.trim(),
      companyName: localCompanyName.trim(),
      kdvNotice: localKdvNotice.trim(),
      paymentStages: localStages,
    };
    onUpdateSettings(updated);
    showToast('Genel iletişim, KDV ve hakediş ayarları kaydedildi.');
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchCat =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'store'
        ? p.isStoreProduct === true
        : p.category === selectedCategory;
    const matchSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const matchStatus = leadStatusFilter === 'all' || (l.status || 'bekliyor') === leadStatusFilter;
    const isStoreOrder = l.leadType === 'store_order' || l.id.startsWith('store-order');
    const isCallback = l.id.startsWith('callback') || l.leadType === 'callback';
    const isInspection = !isCallback && !isStoreOrder && !!l.preferredDate;
    const isWhatsapp = !isCallback && !isStoreOrder && !l.preferredDate;

    const matchType =
      leadTypeFilter === 'all' ||
      (leadTypeFilter === 'store_order' && isStoreOrder) ||
      (leadTypeFilter === 'callback' && isCallback) ||
      (leadTypeFilter === 'inspection' && isInspection) ||
      (leadTypeFilter === 'whatsapp' && isWhatsapp);

    return matchStatus && matchType;
  });

  // CSV Export for Leads
  const handleExportLeadsCSV = () => {
    if (leads.length === 0) {
      showToast('İndirilecek müşteri talebi bulunamadı.');
      return;
    }

    const headers = [
      'Tarih',
      'Talep Türü',
      'Müşteri Adı',
      'Telefon',
      'Şehir',
      'İlçe',
      'Açık Adres',
      'Randevu Tarihi',
      'Saat Dilimi',
      'Toplam Tutar (TL)',
      'Durum',
      'Seçilen Kalemler',
      'Mimar Notları'
    ];

    const rows = leads.map(l => {
      const isStoreOrder = l.leadType === 'store_order' || l.id.startsWith('store-order');
      const isCallback = l.id.startsWith('callback') || l.leadType === 'callback';
      const isInspection = !isCallback && !isStoreOrder && !!l.preferredDate;
      const typeStr = isStoreOrder
        ? 'Doğrudan Mağaza Siparişi'
        : isCallback
        ? 'Geri Arama Talebi'
        : isInspection
        ? 'Lazer Keşif Randevusu'
        : 'WhatsApp Teklifi';
      const statusMap = {
        bekliyor: 'Bekliyor',
        arandi: 'Arandı',
        kesif_verildi: 'Keşif Randevusu Verildi',
        sozlesme_imzalandi: 'Sözleşme İmzalandı'
      };
      const statusStr = statusMap[l.status || 'bekliyor'] || 'Bekliyor';
      const itemsStr = (l.items || [])
        .map(i => {
          const opt = i.purchaseType === 'material_only' ? ' [Sadece Malzeme]' : i.purchaseType === 'with_installation' ? ' [Montaj Dahil]' : '';
          return `${i.name} (${i.quantity} ${i.unit}${opt})`;
        })
        .join('; ');
      const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleDateString('tr-TR') : '';

      return [
        dateStr,
        typeStr,
        `"${(l.fullName || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.city || '').replace(/"/g, '""')}"`,
        `"${(l.district || '').replace(/"/g, '""')}"`,
        `"${(l.address || '').replace(/"/g, '""')}"`,
        l.preferredDate || '',
        l.timeSlot || '',
        l.totalAmount || 0,
        statusStr,
        `"${itemsStr.replace(/"/g, '""')}"`,
        `"${(l.adminNotes || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rvoba_talepler_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Talepler Excel/CSV formatında indirildi.');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0B] flex flex-col font-sans">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0A0A0B] text-white px-5 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-white/20">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-[#E8EAED] sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateCustomer}
            className="btn-pill-outline text-xs py-2 px-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Müşteri Sitesine Dön</span>
          </button>
          <div>
            <span className="font-display font-black text-lg tracking-tight">RVOBA®</span>
            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-black text-white">YÖNETİM PANELİ</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#64748B] hidden sm:inline">
            Aktif Kartela: <strong>{products.length}</strong> | Gelen Talep: <strong>{leads.length}</strong>
          </span>
          <button
            onClick={onResetDefaults}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition flex items-center gap-1.5"
            title="Varsayılan Fabrika Ayarlarına Dön"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Varsayılana Sıfırla</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs font-bold text-slate-700 hover:text-black transition flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-black bg-white shadow-xs"
              title="Yönetim Panelinden Güvenli Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Güvenli Çıkış</span>
            </button>
          )}
        </div>
      </header>

      {/* Navigation Sub-bar (6 Modules) */}
      <div className="bg-white border-b border-[#E8EAED] px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 max-w-7xl mx-auto min-w-max">
          <button
            onClick={() => setAdminTab('products')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'products'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Ürün & Kartela ({products.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('labor_rates')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'labor_rates'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>2. Taban İşçilik Fiyatları</span>
          </button>

          <button
            onClick={() => setAdminTab('durations')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'durations'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. Teslimat Süreleri</span>
          </button>

          <button
            onClick={() => setAdminTab('areas')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'areas'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. Hizmet Bölgeleri ({localServiceAreas.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('gallery')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'gallery'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>5. Öncesi / Sonrası ({localProjects.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('leads')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'leads'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>6. Gelen Talepler & CRM ({leads.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
              adminTab === 'settings'
                ? 'bg-[#0A0A0B] text-white shadow-sm'
                : 'text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>7. Genel & WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">

        {/* ======================================================== */}
        {/* MODÜL 1: ÜRÜN & KARTELA YÖNETİMİ                         */}
        {/* ======================================================== */}
        {adminTab === 'products' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Ürün ve Malzeme Kartelası Yönetimi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Fiyatları, fotoğrafları, markaları ve aktif/pasif durumlarını yönetin.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Ürün adı, kod veya marka ara..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-full pl-10 pr-4 py-2 text-xs text-[#0A0A0B] placeholder-[#94A3B8] focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  onClick={() => setIsAddOpen(true)}
                  className="btn-pill-black text-xs py-2.5 px-5 font-bold flex items-center gap-2 shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Ürün Ekle</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-[#0A0A0B] text-white shadow-sm'
                    : 'bg-white border border-[#E8EAED] text-[#4B5563] hover:text-[#0A0A0B]'
                }`}
              >
                Tümü ({products.length})
              </button>

              <button
                onClick={() => setSelectedCategory('store')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCategory === 'store'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-50'
                }`}
              >
                <span>🛍️ Mimari Mağaza ({products.filter(p => p.isStoreProduct).length})</span>
              </button>

              {categories.map((c) => {
                const count = products.filter(p => p.category === c.key).length;
                return (
                  <button
                    key={c.key}
                    onClick={() => setSelectedCategory(c.key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                      selectedCategory === c.key
                        ? 'bg-[#0A0A0B] text-white shadow-sm'
                        : 'bg-white border border-[#E8EAED] text-[#4B5563] hover:text-[#0A0A0B]'
                    }`}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] border-b border-[#E8EAED] text-[#64748B] font-bold">
                    <tr>
                      <th className="py-3 px-4">Görsel</th>
                      <th className="py-3 px-4">Ürün Adı & Marka</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Malzeme</th>
                      <th className="py-3 px-4 text-right">İşçilik</th>
                      <th className="py-3 px-4 text-right">Piyasa Ref.</th>
                      <th className="py-3 px-4 text-right">Toplam Fiyat</th>
                      <th className="py-3 px-4 text-center">Durum</th>
                      <th className="py-3 px-4 text-center">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F3F5]">
                    {filteredProducts.map((p) => {
                      const isEditing = editingId === p.id;
                      const unitTotal = p.materialPrice + p.workmanshipPrice;

                      return (
                        <tr key={p.id} className="hover:bg-[#FAFAFB] transition">
                          <td className="py-3 px-4">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover border border-[#E8EAED]"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#0A0A0B] text-xs">{p.name}</span>
                              {p.isStoreProduct && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800">
                                  Mağaza
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                              {p.brand} • Kod: {p.code}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#4B5563]">
                            {categories.find(c => c.key === p.category)?.label || p.category}
                          </td>

                          {/* Malzeme Fiyatı */}
                          <td className="py-3 px-4 text-right font-mono font-semibold">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editMaterialPrice}
                                onChange={(e) => setEditMaterialPrice(Number(e.target.value))}
                                className="w-16 bg-[#F8F9FA] border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-right font-bold"
                              />
                            ) : (
                              `${p.materialPrice} ₺`
                            )}
                          </td>

                          {/* İşçilik Fiyatı */}
                          <td className="py-3 px-4 text-right font-mono font-semibold">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editLaborPrice}
                                onChange={(e) => setEditLaborPrice(Number(e.target.value))}
                                className="w-16 bg-[#F8F9FA] border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-right font-bold"
                              />
                            ) : (
                              `${p.workmanshipPrice} ₺`
                            )}
                          </td>

                          {/* Piyasa Fiyatı */}
                          <td className="py-3 px-4 text-right font-mono text-[#94A3B8]">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editMarketPrice}
                                onChange={(e) => setEditMarketPrice(Number(e.target.value))}
                                className="w-16 bg-[#F8F9FA] border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-right font-bold"
                              />
                            ) : (
                              `${p.marketPrice || Math.round(unitTotal * 1.35)} ₺`
                            )}
                          </td>

                          {/* Toplam */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#0A0A0B]">
                            {unitTotal} ₺ / {p.unit}
                          </td>

                          {/* Aktif / Pasif */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleActive(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                p.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.isActive !== false ? 'Aktif' : 'Pasif'}
                            </button>
                          </td>

                          {/* Aksiyonlar */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveInline(p)}
                                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                    title="Kaydet"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                                    title="İptal"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingId(p.id);
                                      setEditMaterialPrice(p.materialPrice);
                                      setEditLaborPrice(p.workmanshipPrice);
                                      setEditMarketPrice(p.marketPrice || Math.round(unitTotal * 1.35));
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 text-[#4B5563] hover:bg-slate-200 transition"
                                    title="Hızlı Fiyat Düzenle"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditModalProduct(p)}
                                    className="p-1.5 rounded-lg bg-slate-100 text-[#4B5563] hover:bg-slate-200 transition"
                                    title="Tüm Detayları Düzenle (Fotoğraf & Marka)"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`${p.name} ürününü silmek istediğinize emin misiniz?`)) {
                                        onDeleteProduct(p.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-100 transition"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 2: TABAN İŞÇİLİK FİYATLARI ("Elimde Malzeme Var")   */}
        {/* ======================================================== */}
        {adminTab === 'labor_rates' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Taban İşçilik Fiyatları Yönetimi ("Elimde Malzeme Var" Modu)
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Müşteriniz malzemeyi kendisi temin ettiğinde sistemin uyguladığı birim işçilik ücretlerini buradan belirleyin.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveLaborRates}
                className="btn-pill-black text-xs py-3 px-6 font-bold flex items-center gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4" />
                <span>Tüm İşçilik Fiyatlarını Kaydet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const currentRate = localLaborRates[cat.key] || {
                  laborPrice: 100,
                  marketPrice: 160,
                  description: `${cat.label} profesyonel usta işçiliği`,
                };

                return (
                  <div
                    key={cat.key}
                    className="p-6 rounded-3xl bg-white border border-[#E8EAED] shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F5]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0A0A0B] text-white flex items-center justify-center text-xs font-bold">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0A0A0B]">{cat.label}</h4>
                          <span className="text-[11px] text-[#64748B]">Birim: {cat.unit}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Malzeme: 0 ₺
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                          Usta Birim İşçiliği (₺ / {cat.unit}):
                        </label>
                        <input
                          type="number"
                          value={currentRate.laborPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLocalLaborRates(prev => ({
                              ...prev,
                              [cat.key]: { ...prev[cat.key], laborPrice: val },
                            }));
                          }}
                          className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0A0A0B] focus:outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                          Piyasa Referans Fiyatı (₺ / {cat.unit}):
                        </label>
                        <input
                          type="number"
                          value={currentRate.marketPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLocalLaborRates(prev => ({
                              ...prev,
                              [cat.key]: { ...prev[cat.key], marketPrice: val },
                            }));
                          }}
                          className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0A0A0B] focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        İşçilik Kapsam Açıklaması (Müşteri Kartında Görünür):
                      </label>
                      <textarea
                        rows={2}
                        value={currentRate.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLocalLaborRates(prev => ({
                            ...prev,
                            [cat.key]: { ...prev[cat.key], description: val },
                          }));
                        }}
                        className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 3: TESLİMAT SÜRELERİ & TAKVİM                      */}
        {/* ======================================================== */}
        {adminTab === 'durations' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Teslimat Süreleri & Takvim Ayarları ("Kaç Günde Biter?")
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  İşlem bazlı baz gün sürelerini ve metrekare katsayılarını buradan ayarlayın.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveDurations}
                className="btn-pill-black text-xs py-3 px-6 font-bold flex items-center gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4" />
                <span>Teslimat Sürelerini Kaydet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Kategori Bazlı Tahmini İş Günü</span>
                </h3>

                {categories.map((cat) => {
                  const days = localDurationRules.baseDays[cat.key] || 2;
                  return (
                    <div key={cat.key} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
                      <span className="text-xs font-bold text-[#0A0A0B]">{cat.label}:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={days}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setLocalDurationRules(prev => ({
                              ...prev,
                              baseDays: { ...prev.baseDays, [cat.key]: val },
                            }));
                          }}
                          className="w-16 bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-bold text-center text-[#0A0A0B] focus:outline-none"
                        />
                        <span className="text-xs text-[#64748B]">İş Günü</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Kurallar ve Simülasyon */}
              <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2 mb-3">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Metrekare Çarpanı & Akıllı Kurallar</span>
                  </h3>

                  <div className="space-y-4 text-xs text-[#4B5563]">
                    <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
                      <strong className="text-[#0A0A0B] block mb-1">Büyük Evler İçin Ek Süre:</strong>
                      <p>
                        Daire alanı <strong>90 m²</strong> üzerinde ise otomatik <strong>+1 gün</strong>, <strong>120 m²</strong> üzerinde ise <strong>+2 gün</strong> teslimat takvimine ilave edilir.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED]">
                      <strong className="text-[#0A0A0B] block mb-1">Eşzamanlı Saha Çalışması:</strong>
                      <p>
                        Boya ve Parke birlikte seçildiğinde süreler düz toplanmaz (2+2=4 gün yerine sıralı kuruma süreleriyle 4-6 iş günü olarak optimize hesaplanır).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0A0B] text-white">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Müşteriye Verilen Taahhüt:</span>
                  <div className="text-xs text-slate-300">
                    Sitede verilen iş günü sözleşmeye yazılır. Belirlenen tarihte mimari teslim checklistiyle eksiksiz anahtar teslimi yapılır.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 4: HİZMET BÖLGELERİ İL / İLÇE                      */}
        {/* ======================================================== */}
        {adminTab === 'areas' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Hizmet Bölgeleri (İl & İlçe) Yönetimi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Platformun ücretsiz mimari lazer keşif ve uygulama hizmeti verdiği bölgeleri düzenleyin.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAreas}
                className="btn-pill-black text-xs py-3 px-6 font-bold flex items-center gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4" />
                <span>Bölgeleri Kaydet</span>
              </button>
            </div>

            {/* Duyuru Metni Alanı */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-[#0A0A0B] mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Sitede Gösterilen Kapsama Duyuru Metni:</span>
              </label>
              <input
                type="text"
                value={localCoverageNotice}
                onChange={(e) => setLocalCoverageNotice(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-xs text-[#0A0A0B] font-semibold focus:outline-none focus:border-black"
              />
            </div>

            {/* Şehirler Listesi */}
            <div className="space-y-4">
              {localServiceAreas.map((area) => (
                <div
                  key={area.city}
                  className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1F3F5]">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-base text-[#0A0A0B]">{area.city}</span>
                      <span className="text-xs text-[#64748B]">({area.districts.length} İlçe)</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCity(area.city)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Şehri Sil
                    </button>
                  </div>

                  {/* İlçeler Tag Listesi */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {area.districts.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E2E4E8] text-xs font-semibold text-[#0A0A0B]"
                      >
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDistrict(area.city, d)}
                          className="hover:text-rose-600 text-slate-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Yeni İlçe Ekle Girişi */}
                  <div className="flex items-center gap-2 max-w-sm">
                    <input
                      type="text"
                      placeholder="Yeni ilçe adı..."
                      value={newDistrictInputs[area.city] || ''}
                      onChange={(e) => setNewDistrictInputs({ ...newDistrictInputs, [area.city]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDistrict(area.city);
                        }
                      }}
                      className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddDistrict(area.city)}
                      className="btn-pill-black text-xs py-1.5 px-4 font-bold"
                    >
                      + Ekle
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Yeni Şehir Ekle Formu */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#0A0A0B] mb-3">Yeni Şehir Ekle</h3>
              <form onSubmit={handleAddCity} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Şehir Adı (Örn: Antalya)"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="İlçeler (virgülle ayırın: Muratpaşa, Konyaaltı...)"
                  value={newCityDistricts}
                  onChange={(e) => setNewCityDistricts(e.target.value)}
                  className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-pill-black text-xs py-2 px-6 font-bold"
                >
                  Şehri Sisteme Ekle
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 5: ÖNCESİ / SONRASI DÖNÜŞÜM GALERİSİ               */}
        {/* ======================================================== */}
        {adminTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Öncesi / Sonrası (Before - After) Galeri Yönetimi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Sitede müşterilere gösterilen interaktif dönüşüm projelerini ve fotoğraflarını yönetin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProjectOpen(true)}
                className="btn-pill-black text-xs py-2.5 px-6 font-bold flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Proje Ekle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-[#E8EAED] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Görseller Karşılaştırması */}
                    <div className="grid grid-cols-2 h-44 border-b border-[#E8EAED]">
                      <div className="relative overflow-hidden bg-slate-100 border-r border-[#E8EAED]">
                        <img src={p.beforeImage} alt="Öncesi" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Öncesi
                        </span>
                      </div>
                      <div className="relative overflow-hidden bg-slate-100">
                        <img src={p.afterImage} alt="Sonrası" className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Sonrası
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                        <span>{p.location}</span>
                        <span className="font-bold text-emerald-600">{p.duration}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0A0A0B]">{p.title}</h4>
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                        {p.scope}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex justify-end">
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Projeyi Sil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 6: GELEN TALEPLER & CRM                            */}
        {/* ======================================================== */}
        {adminTab === 'leads' && (
          <div className="space-y-6">
            
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Gelen Müşteri Talepleri & CRM Havuzu
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Lazer keşif randevuları, WhatsApp talepleri ve "Mimar Beni Arasın" çağrılarını tek ekranda yönetin.
                </p>
              </div>

              {/* Filtreler */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={leadTypeFilter}
                  onChange={(e) => setLeadTypeFilter(e.target.value as any)}
                  className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-full px-3 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none"
                >
                  <option value="all">Tüm Talep Türleri</option>
                  <option value="store_order">🛍️ Doğrudan Mağaza Siparişleri</option>
                  <option value="callback">📞 Mimar Beni Arasın (Çağrılar)</option>
                  <option value="inspection">📅 Lazer Keşif Randevuları</option>
                  <option value="whatsapp">💬 WhatsApp Talepleri</option>
                </select>

                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                  className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-full px-3 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="bekliyor">🟡 Bekliyor</option>
                  <option value="arandi">🔵 Arandı</option>
                  <option value="kesif_verildi">🟣 Keşif Randevusu Verildi</option>
                  <option value="sozlesme_imzalandi">🟢 Sözleşme İmzalandı</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportLeadsCSV}
                  className="btn-pill-black bg-[#0A0A0B] text-white hover:bg-slate-800 text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm"
                  title="Müşteri taleplerini Excel uyumlu CSV formatında bilgisayara indir"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Excel / CSV İndir</span>
                </button>
              </div>
            </div>

            {/* Talepler Listesi */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E8EAED] rounded-3xl">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#64748B]">Bu filtrede talep bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => {
                  const isStoreOrder = lead.leadType === 'store_order' || lead.id.startsWith('store-order');
                  const isCallback = lead.id.startsWith('callback') || lead.leadType === 'callback';
                  const isInspection = !isCallback && !isStoreOrder && !!lead.preferredDate;
                  const currentStatus = lead.status || 'bekliyor';

                  return (
                    <div
                      key={lead.id}
                      className="bg-white border border-[#E8EAED] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isStoreOrder ? 'bg-purple-100 text-purple-800' : isCallback ? 'bg-amber-100 text-amber-800' : isInspection ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isStoreOrder ? <ShoppingBag className="w-5 h-5" /> : isCallback ? <Phone className="w-5 h-5" /> : isInspection ? <Calendar className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-bold text-[#0A0A0B]">{lead.fullName}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {lead.city} / {lead.district}
                            </span>
                            {isStoreOrder && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                                🛍️ Doğrudan Ürün Siparişi
                              </span>
                            )}
                            {isCallback && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                📞 Hızlı Çağrı ({lead.timeSlot})
                              </span>
                            )}
                            {isInspection && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                                📅 Keşif: {lead.preferredDate} ({lead.timeSlot})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-[#64748B]">
                            <a href={`tel:${lead.phone}`} className="font-mono font-bold text-[#0A0A0B] hover:underline">
                              {lead.phone}
                            </a>
                            <span>•</span>
                            <span>Tutar: <strong className="font-mono text-[#0A0A0B]">{lead.totalAmount.toLocaleString('tr-TR')} ₺</strong></span>
                            <span>•</span>
                            <span>{new Date(lead.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#F1F3F5]">
                        {/* Durum Seçici */}
                        <select
                          value={currentStatus}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-full px-3 py-1.5 border focus:outline-none ${
                            currentStatus === 'bekliyor'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : currentStatus === 'arandi'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : currentStatus === 'kesif_verildi'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="bekliyor">🟡 Bekliyor</option>
                          <option value="arandi">🔵 Arandı</option>
                          <option value="kesif_verildi">🟣 Keşif Verildi</option>
                          <option value="sozlesme_imzalandi">🟢 Sözleşme İmzalandı</option>
                        </select>

                        <button
                          onClick={() => setSelectedLeadDetail(lead)}
                          className="btn-pill-outline text-xs py-1.5 px-3.5"
                        >
                          Detaylar
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`${lead.fullName} isimli müşterinin talebini silmek istiyor musunuz?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 transition"
                          title="Talebi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 7: GENEL İLETİŞİM, WHATSAPP & HAKEDİŞ              */}
        {/* ======================================================== */}
        {adminTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-display font-extrabold text-[#0A0A0B] mb-1">
                Genel İletişim, WhatsApp & Şirket Ayarları
              </h2>
              <p className="text-xs text-[#64748B] mb-6">
                Sitedeki iletişim numaralarını ve kurumsal hakediş oranlarını tek ekrandan düzenleyin.
              </p>

              <form onSubmit={handleSaveGeneralSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                      WhatsApp Teklif Yönlendirme Numarası (Ülke kodu ile) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="905550000000"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono font-bold focus:outline-none focus:border-black"
                    />
                    <span className="text-[10px] text-[#64748B] mt-0.5 block">
                      Müşteri "Teklifi WhatsApp ile Mimara Gönder" dediğinde bu numaraya yönlenir.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                      Müşteri Destek Telefonu (Header ve Footer'da görünür) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0850 123 45 67"
                      value={localSupportPhone}
                      onChange={(e) => setLocalSupportPhone(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                    Resmi Şirket Unvanı (Proforma Faturada Görünür)
                  </label>
                  <input
                    type="text"
                    value={localCompanyName}
                    onChange={(e) => setLocalCompanyName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-semibold focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                    KDV Duyuru & Şeffaflık Garantisi Metni (Footer, Proforma ve Sepette Görünür)
                  </label>
                  <input
                    type="text"
                    value={localKdvNotice}
                    onChange={(e) => setLocalKdvNotice(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-semibold focus:outline-none focus:border-black"
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">
                    Örn: Fiyatlarımız bireysel müşterilerimiz için anahtar teslim %20 KDV dahil net tutardır.
                  </span>
                </div>

                {/* Kademeli Hakediş Yüzdeleri */}
                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-3">
                  <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider">
                    Kademeli Hakediş Ödeme Yüzdeleri:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-[#64748B] block mb-1">1. Aşama (Sözleşme & Tedarik):</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">%</span>
                        <input
                          type="number"
                          value={localStages.stage1Percent}
                          onChange={(e) => setLocalStages({ ...localStages, stage1Percent: Number(e.target.value) })}
                          className="w-16 bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] block mb-1">2. Aşama (Saha İlerlemesi):</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">%</span>
                        <input
                          type="number"
                          value={localStages.stage2Percent}
                          onChange={(e) => setLocalStages({ ...localStages, stage2Percent: Number(e.target.value) })}
                          className="w-16 bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748B] block mb-1">3. Aşama (Mimari Teslim):</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">%</span>
                        <input
                          type="number"
                          value={localStages.stage3Percent}
                          onChange={(e) => setLocalStages({ ...localStages, stage3Percent: Number(e.target.value) })}
                          className="w-16 bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-pill-black text-xs py-3 px-8 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Genel Ayarları Kaydet
                  </button>
                </div>
              </form>
            </div>

            {/* Panel Güvenlik & Şifre Değiştirme */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                    Yönetim Paneli Giriş Şifresi
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    rvoba.com/#admin adresine girerken sorulan şifreyi buradan güncelleyebilirsiniz.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md mt-5">
                <div>
                  <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                    Yeni Yönetici Şifresi *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Yeni şifrenizi yazın..."
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                    Yeni Şifreyi Onaylayın *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Yeni şifreyi tekrar yazın..."
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-pill-black text-xs py-2.5 px-6 font-bold shadow-md bg-black hover:bg-slate-800 text-white flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Şifreyi Değiştir & Kaydet</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL: YENİ ÜRÜN EKLE                                    */}
      {/* ======================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsAddOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-extrabold mb-4">Yeni Ürün / Kartela Ekle</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Kategori *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryKey)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Marka *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Filli Boya / Marshall"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Ürün Adı & Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Momento Silan — Aydan Rengi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Ürün Kodu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: FB-AYD-201"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Malzeme (₺)</label>
                  <input
                    type="number"
                    value={newMaterialPrice}
                    onChange={(e) => setNewMaterialPrice(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">İşçilik (₺)</label>
                  <input
                    type="number"
                    value={newLaborPrice}
                    onChange={(e) => setNewLaborPrice(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Piyasa Ref (₺)</label>
                  <input
                    type="number"
                    value={newMarketPrice}
                    onChange={(e) => setNewMarketPrice(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono text-[#94A3B8]"
                  />
                </div>
              </div>

              {/* Fotoğraf Yükleme */}
              <div>
                <label className="block text-xs font-bold mb-1">Kartela Numune Fotoğrafı *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-pill-outline text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cihazdan Fotoğraf Seç</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Veya Görsel URL Yapıştır..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="flex-1 bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold mb-1">Hesaplama / Fiyatlandırma Birimi</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as Product['unit'])}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="m²">m² (Metrekare)</option>
                    <option value="adet">adet</option>
                    <option value="kova">kova (15L / 20kg)</option>
                    <option value="paket">paket (Zemin kutu)</option>
                    <option value="set">set (Kit / Paket)</option>
                  </select>
                </div>

                <div className="pt-2 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#F8F9FA] p-2.5 rounded-xl border border-[#CBD5E1]">
                    <input
                      type="checkbox"
                      checked={newIsStoreProduct}
                      onChange={(e) => setNewIsStoreProduct(e.target.checked)}
                      className="rounded text-black focus:ring-black w-4 h-4"
                    />
                    <span className="text-xs font-bold text-[#0A0A0B]">
                      🛍️ Mimari Mağazada (Ürünlerimiz) Sergile
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  placeholder="Ürün mimari özellikleri..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Öne Çıkan Mimari Özellikler (Her satıra bir özellik yazın - Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Doğal ahşap kaplama&#10;Kolay silinebilir mat doku&#10;E1 düşük formaldehit sertifikalı"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-pill-outline text-xs py-2.5 px-5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-pill-black text-xs py-2.5 px-6 font-bold"
                >
                  Kataloğa Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MEVCUT ÜRÜNÜ DÜZENLE                              */}
      {/* ======================================================== */}
      {editModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setEditModalProduct(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditModalProduct(null)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-extrabold mb-4">Ürün Detaylarını Düzenle</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateProduct(editModalProduct);
                setEditModalProduct(null);
                showToast(`${editModalProduct.name} güncellendi.`);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Marka</label>
                  <input
                    type="text"
                    value={editModalProduct.brand}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, brand: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Ürün Kodu</label>
                  <input
                    type="text"
                    value={editModalProduct.code}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, code: e.target.value })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Ürün Adı</label>
                <input
                  type="text"
                  value={editModalProduct.name}
                  onChange={(e) => setEditModalProduct({ ...editModalProduct, name: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Malzeme (₺)</label>
                  <input
                    type="number"
                    value={editModalProduct.materialPrice}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, materialPrice: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">İşçilik (₺)</label>
                  <input
                    type="number"
                    value={editModalProduct.workmanshipPrice}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, workmanshipPrice: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Piyasa Ref (₺)</label>
                  <input
                    type="number"
                    value={editModalProduct.marketPrice || 0}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, marketPrice: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Görsel Değiştirme */}
              <div>
                <label className="block text-xs font-bold mb-1">Kartela Görseli</label>
                <div className="flex items-center gap-3">
                  <img src={editModalProduct.image} alt="Önizleme" className="w-12 h-12 rounded-xl object-cover border" />
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleEditFileUpload(e, false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="btn-pill-outline text-xs py-2 px-4"
                  >
                    Fotoğraf Değiştir
                  </button>
                  <input
                    type="text"
                    value={editModalProduct.image}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, image: e.target.value })}
                    className="flex-1 bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold mb-1">Hesaplama / Fiyatlandırma Birimi</label>
                  <select
                    value={editModalProduct.unit || 'm²'}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, unit: e.target.value as Product['unit'] })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="m²">m² (Metrekare)</option>
                    <option value="adet">adet</option>
                    <option value="kova">kova (15L / 20kg)</option>
                    <option value="paket">paket (Zemin kutu)</option>
                    <option value="set">set (Kit / Paket)</option>
                  </select>
                </div>

                <div className="pt-2 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#F8F9FA] p-2.5 rounded-xl border border-[#CBD5E1]">
                    <input
                      type="checkbox"
                      checked={editModalProduct.isStoreProduct === true}
                      onChange={(e) => setEditModalProduct({ ...editModalProduct, isStoreProduct: e.target.checked })}
                      className="rounded text-black focus:ring-black w-4 h-4"
                    />
                    <span className="text-xs font-bold text-[#0A0A0B]">
                      🛍️ Mimari Mağazada (Ürünlerimiz) Sergile
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={editModalProduct.description}
                  onChange={(e) => setEditModalProduct({ ...editModalProduct, description: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Öne Çıkan Mimari Özellikler (Her satıra bir özellik yazın)
                </label>
                <textarea
                  rows={2}
                  placeholder="Doğal ahşap kaplama&#10;Kolay silinebilir mat doku"
                  value={(editModalProduct.specs || []).join('\n')}
                  onChange={(e) => setEditModalProduct({ 
                    ...editModalProduct, 
                    specs: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) 
                  })}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalProduct(null)}
                  className="btn-pill-outline text-xs py-2.5 px-5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-pill-black text-xs py-2.5 px-6 font-bold"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: YENİ ÖNCESİ / SONRASI PROJE EKLE                   */}
      {/* ======================================================== */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setIsAddProjectOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddProjectOpen(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-extrabold mb-4">Yeni Öncesi / Sonrası Dönüşüm Projesi Ekle</h3>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Proje Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3+1 Daire Salon & Mutfak Dönüşümü"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Konum / İlçe</label>
                  <input
                    type="text"
                    placeholder="Örn: Moda, Kadıköy"
                    value={newProjLocation}
                    onChange={(e) => setNewProjLocation(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Teslimat Süresi</label>
                  <input
                    type="text"
                    placeholder="Örn: 6 İş Günü"
                    value={newProjDuration}
                    onChange={(e) => setNewProjDuration(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Yapılan İşlemler Kapsamı</label>
                <input
                  type="text"
                  placeholder="Örn: İpeksi mat boya + derzli parke + tavan çıtalama"
                  value={newProjScope}
                  onChange={(e) => setNewProjScope(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              {/* Öncesi Görseli */}
              <div>
                <label className="block text-xs font-bold mb-1">Öncesi (Eski Hali) Fotoğrafı *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={beforeProjInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => typeof reader.result === 'string' && setNewProjBeforeImg(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => beforeProjInputRef.current?.click()}
                    className="btn-pill-outline text-xs py-2 px-3 shrink-0"
                  >
                    Fotoğraf Seç
                  </button>
                  <input
                    type="text"
                    placeholder="veya Görsel URL..."
                    value={newProjBeforeImg}
                    onChange={(e) => setNewProjBeforeImg(e.target.value)}
                    className="flex-1 bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Sonrası Görseli */}
              <div>
                <label className="block text-xs font-bold mb-1">Sonrası (RVOBA Teslimi) Fotoğrafı *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={afterProjInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => typeof reader.result === 'string' && setNewProjAfterImg(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => afterProjInputRef.current?.click()}
                    className="btn-pill-outline text-xs py-2 px-3 shrink-0"
                  >
                    Fotoğraf Seç
                  </button>
                  <input
                    type="text"
                    placeholder="veya Görsel URL..."
                    value={newProjAfterImg}
                    onChange={(e) => setNewProjAfterImg(e.target.value)}
                    className="flex-1 bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="btn-pill-outline text-xs py-2.5 px-5"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-pill-black text-xs py-2.5 px-6 font-bold"
                >
                  Projeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MÜŞTERİ TALEBİ DETAYLARI                          */}
      {/* ======================================================== */}
      {selectedLeadDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedLeadDetail(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedLeadDetail(null)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-extrabold mb-1">Müşteri Talep Detayı</h3>
            <div className="text-xs text-[#64748B] mb-4">
              Kayıt No: <span className="font-mono font-bold text-black">{selectedLeadDetail.id}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Müşteri:</span>
                <strong className="text-black">{selectedLeadDetail.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Telefon:</span>
                <a href={`tel:${selectedLeadDetail.phone}`} className="font-mono font-bold text-emerald-600 hover:underline">
                  {selectedLeadDetail.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Konum:</span>
                <span className="font-semibold text-black">{selectedLeadDetail.city} / {selectedLeadDetail.district}</span>
              </div>
              {selectedLeadDetail.timeSlot && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Tercih Edilen Saat:</span>
                  <span className="font-semibold text-black">{selectedLeadDetail.timeSlot}</span>
                </div>
              )}
              {selectedLeadDetail.preferredDate && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Keşif Randevu Tarihi:</span>
                  <span className="font-semibold text-black">{selectedLeadDetail.preferredDate}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#E8EAED]">
                <span className="text-[#64748B] font-bold">Toplam Teklif Tutarı:</span>
                <strong className="text-base font-black font-mono text-black">{selectedLeadDetail.totalAmount.toLocaleString('tr-TR')} ₺</strong>
              </div>
            </div>

            <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider mb-2">
              Seçilen Kalemler ({selectedLeadDetail.items.length}):
            </h4>
            <div className="space-y-2 mb-6">
              {selectedLeadDetail.items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FBFBFC] border border-[#E8EAED] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-black flex items-center gap-2">
                      <span>{it.name}</span>
                      {it.purchaseType === 'material_only' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                          Sadece Malzeme
                        </span>
                      )}
                      {it.purchaseType === 'with_installation' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Montaj Dahil
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {it.quantity} {it.unit} • {it.brand}
                      {it.customNote && <span className="italic block mt-0.5 text-amber-800 font-medium">"{it.customNote}"</span>}
                    </div>
                  </div>
                  <strong className="font-mono">{it.total > 0 ? `${it.total.toLocaleString('tr-TR')} ₺` : 'Keşifte Netleşecek'}</strong>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLeadDetail(null)}
                className="btn-pill-black text-xs py-2.5 px-6 font-bold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
