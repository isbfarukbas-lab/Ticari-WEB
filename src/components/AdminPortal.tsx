import React, { useState, useRef, useEffect } from 'react';
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
  LogOut,
  AlertTriangle,
  Globe,
  ShieldCheck,
  Users,
  Building2,
  CreditCard,
  Cloud,
  Download,
  Star,
  Calculator,
  Bell,
  Smartphone
} from 'lucide-react';
import { 
  CategoryKey, 
  Product, 
  ProductVariant,
  CoverageCalculationRule,
  LeadRequest, 
  CategoryInfo, 
  SiteSettings, 
  BeforeAfterProject,
  ServiceArea,
  SiteContentSettings,
  CustomerUser
} from '../types';
import { INITIAL_SETTINGS } from '../data/initialSettings';
import {
  getCustomCloudEndpoint,
  setCustomCloudEndpoint,
  normalizeCloudEndpoint,
  syncToCloudAndTabs,
} from '../utils/cloudSync';
import { dbService } from '../services/dbService';

interface AdminPortalProps {
  categories: CategoryInfo[];
  products: Product[];
  leads: LeadRequest[];
  settings: SiteSettings;
  customers?: CustomerUser[];
  onDeleteCustomer?: (customerId: string) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onClearAllProducts?: () => void;
  onToggleActive: (productId: string) => void;
  onResetDefaults: () => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadRequest['status'], adminNotes?: string) => void;
  onDeleteLead: (leadId: string) => void;
  onNavigateCustomer: () => void;
  onLogout?: () => void;
  onRefreshCloud?: () => Promise<void> | void;
  onImportFullBackup?: (data: {
    products?: Product[];
    settings?: SiteSettings;
    leads?: LeadRequest[];
    customers?: CustomerUser[];
  }) => void;
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
  customers = [],
  onDeleteCustomer,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onClearAllProducts,
  onToggleActive,
  onResetDefaults,
  onUpdateSettings,
  onUpdateLeadStatus,
  onDeleteLead,
  onNavigateCustomer,
  onLogout,
  onRefreshCloud,
  onImportFullBackup,
}) => {
  // Active Admin Module Tab
  const [adminTab, setAdminTab] = useState<
    'products' | 'cms' | 'labor_rates' | 'durations' | 'areas' | 'gallery' | 'leads' | 'settings' | 'customers'
  >('products');

  const [customerSearch, setCustomerSearch] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // TAB CMS: SAYFA METİNLERİ & VİTRİN STATE
  // ==========================================
  const [localContent, setLocalContent] = useState<SiteContentSettings>(() => {
    return {
      ...(INITIAL_SETTINGS.content || {}),
      ...(settings.content || {}),
    } as SiteContentSettings;
  });

  const handleSaveContent = () => {
    const updated: SiteSettings = {
      ...settings,
      content: localContent,
    };
    onUpdateSettings(updated);
    showToast('Sayfa metinleri ve vitrin ayarları başarıyla kaydedildi. Canlı site güncellendi!');
  };

  const handleResetContent = () => {
    if (confirm('Tüm sayfa metinlerini ve vitrin içeriklerini varsayılan fabrika ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      if (INITIAL_SETTINGS.content) {
        setLocalContent(INITIAL_SETTINGS.content);
        onUpdateSettings({
          ...settings,
          content: INITIAL_SETTINGS.content,
        });
        showToast('Sayfa metinleri varsayılana sıfırlandı.');
      }
    }
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
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [newRoomImage, setNewRoomImage] = useState('');
  const [newMaterialPrice, setNewMaterialPrice] = useState<number>(85);
  const [newLaborPrice, setNewLaborPrice] = useState<number>(0);
  const [newMarketPrice, setNewMarketPrice] = useState<number>(0);
  const [newDescription, setNewDescription] = useState('');
  const [newIsStoreProduct, setNewIsStoreProduct] = useState(true);
  const [newUnit, setNewUnit] = useState<Product['unit']>('m²');
  const [newPackageInfo, setNewPackageInfo] = useState('');
  const [newSpecs, setNewSpecs] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const roomFileInputRef = useRef<HTMLInputElement>(null);

  // Full Edit Modal for existing product
  const [editModalProduct, setEditModalProduct] = useState<Product | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editMultiFileInputRef = useRef<HTMLInputElement>(null);
  const editRoomFileInputRef = useRef<HTMLInputElement>(null);
  const [editUrlInput, setEditUrlInput] = useState('');

  // Variant manager state for editing products
  const [newVarName, setNewVarName] = useState('');
  const [newVarColor, setNewVarColor] = useState('#E4DEC8');
  const [newVarCode, setNewVarCode] = useState('');
  const [newVarPriceDiff, setNewVarPriceDiff] = useState<number>(0);

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
  const [leadArchiveTab, setLeadArchiveTab] = useState<'active' | 'archived'>('active');
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
  const [localBankInfo, setLocalBankInfo] = useState(
    settings.bankInfo || INITIAL_SETTINGS.bankInfo || {
      bankName: 'Garanti BBVA / Ziraat Bankası',
      accountHolder: 'RVOBA Yapı ve Tadilat Hizmetleri',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
      transferDiscountPercent: 3,
    }
  );
  const [localPaymentMethods, setLocalPaymentMethods] = useState(
    settings.paymentMethods || INITIAL_SETTINGS.paymentMethods || {
      enableBankTransfer: true,
      enableCashOnDelivery: true,
      enableCreditCard: true,
      creditCardNote: 'Tüm kartlara 12 taksit imkanı',
    }
  );
  const [localLegalInfo, setLocalLegalInfo] = useState(
    settings.legalInfo || INITIAL_SETTINGS.legalInfo || {
      taxOffice: 'Kadıköy Vergi Dairesi',
      taxNumber: 'Kuruluş Aşamasında',
      mersisNo: 'Kuruluş Aşamasında',
      companyAddress: 'Kadıköy / İstanbul',
      companyEmail: 'destek@rvoba.com',
    }
  );
  const [localFreeShipping, setLocalFreeShipping] = useState(settings.freeShippingThreshold ?? 3000);
  const [localStandardShipping, setLocalStandardShipping] = useState(settings.standardShippingCost ?? 180);
  const [cloudEndpoint, setCloudEndpoint] = useState(() => settings.cloudEndpoint || getCustomCloudEndpoint());
  const [localWebhookUrl, setLocalWebhookUrl] = useState(() => settings.notificationWebhookUrl || '');
  const [localTelegramConfig, setLocalTelegramConfig] = useState(() => settings.telegramConfig || { enabled: false, botToken: '', chatId: '' });
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Sync local form states when parent settings change (e.g. backup import, cross-tab sync, or factory reset)
  useEffect(() => {
    setLocalContent({
      ...(INITIAL_SETTINGS.content || {}),
      ...(settings.content || {}),
    } as SiteContentSettings);
    setLocalLaborRates(settings.laborRates);
    setLocalDurationRules(settings.durationRules);
    setLocalServiceAreas(settings.serviceAreas);
    setLocalCoverageNotice(settings.coverageNotice);
    setLocalProjects(settings.beforeAfterProjects);
    setLocalPhone(settings.phoneNumber);
    setLocalSupportPhone(settings.supportPhone);
    setLocalCompanyName(settings.companyName);
    setLocalStages(settings.paymentStages);
    setLocalKdvNotice(settings.kdvNotice || 'Fiyatlarımız bireysel müşterilerimiz için anahtar teslim %20 KDV dahil net tutardır.');
    if (settings.bankInfo) setLocalBankInfo(settings.bankInfo);
    if (settings.paymentMethods) setLocalPaymentMethods(settings.paymentMethods);
    if (settings.legalInfo) setLocalLegalInfo(settings.legalInfo);
    setLocalFreeShipping(settings.freeShippingThreshold ?? 3000);
    setLocalStandardShipping(settings.standardShippingCost ?? 180);
    if (settings.cloudEndpoint !== undefined) setCloudEndpoint(settings.cloudEndpoint);
    if (settings.notificationWebhookUrl !== undefined) setLocalWebhookUrl(settings.notificationWebhookUrl);
    if (settings.telegramConfig) setLocalTelegramConfig(settings.telegramConfig);
  }, [settings]);

  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const handleTestTelegram = async () => {
    if (!localTelegramConfig.botToken || !localTelegramConfig.chatId) {
      alert('Lütfen Telegram Bot Token ve Chat ID alanlarını doldurunuz.');
      return;
    }
    setIsTestingTelegram(true);
    const testMsg = `🔔 <b>RVOBA® TEST BİLDİRİMİ</b>\nTelegram bildirim entegrasyonunuz başarıyla çalışıyor! Canlı gelen siparişler ve keşif talepleri buraya otomatik düşecektir.`;
    const ok = await dbService.sendTelegramAlert(testMsg, localTelegramConfig.botToken, localTelegramConfig.chatId);
    setIsTestingTelegram(false);
    if (ok) {
      showToast('Telegram test bildirimi başarıyla cebinize gönderildi!');
    } else {
      alert('Telegram bildirimi gönderilemedi. Lütfen Bot Token ve Chat ID değerlerinizi kontrol ediniz.');
    }
  };

  const handleTestWebhook = async () => {
    if (!localWebhookUrl.trim()) {
      alert('Lütfen Webhook URL giriniz.');
      return;
    }
    setIsTestingWebhook(true);
    await dbService.sendWebhookNotification('test_ping', {
      source: 'RVOBA Admin Panel',
      message: 'Webhook bağlantı testi başarılı!',
      timestamp: new Date().toISOString(),
    }, localWebhookUrl.trim());
    setIsTestingWebhook(false);
    showToast('Test Webhook isteği başarıyla tetiklendi!');
  };

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
    if (file.size > 5 * 1024 * 1024) {
      alert('Fotoğraf boyutu 5MB üzerinde olamaz.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isRoom) setNewRoomImage(reader.result);
        else {
          setNewImage(reader.result);
          setNewImages((prev) => prev.includes(reader.result as string) ? prev : [reader.result as string, ...prev]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} boyutu 5MB üzerinde olduğu için yüklenemedi.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          if (isEdit) {
            setEditModalProduct((prev) => {
              if (!prev) return null;
              const current = prev.images && prev.images.length > 0 ? prev.images : [prev.image];
              const updated = [...current, res];
              return {
                ...prev,
                image: prev.image || res,
                images: updated,
              };
            });
          } else {
            setNewImages((prev) => {
              const updated = [...prev, res];
              if (!newImage) setNewImage(res);
              return updated;
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = (isEdit = false) => {
    if (isEdit) {
      if (!editUrlInput.trim() || !editModalProduct) return;
      const current = editModalProduct.images && editModalProduct.images.length > 0 ? editModalProduct.images : [editModalProduct.image];
      const updated = [...current, editUrlInput.trim()];
      setEditModalProduct({
        ...editModalProduct,
        image: editModalProduct.image || editUrlInput.trim(),
        images: updated,
      });
      setEditUrlInput('');
    } else {
      if (!newUrlInput.trim()) return;
      setNewImages((prev) => {
        const updated = [...prev, newUrlInput.trim()];
        if (!newImage) setNewImage(newUrlInput.trim());
        return updated;
      });
      setNewUrlInput('');
    }
  };

  const handleSetCoverImage = (index: number, isEdit = false) => {
    if (isEdit) {
      if (!editModalProduct) return;
      const current = editModalProduct.images && editModalProduct.images.length > 0 ? [...editModalProduct.images] : [editModalProduct.image];
      if (index >= 0 && index < current.length) {
        const [selected] = current.splice(index, 1);
        current.unshift(selected);
        setEditModalProduct({
          ...editModalProduct,
          image: selected,
          images: current,
        });
      }
    } else {
      if (index >= 0 && index < newImages.length) {
        const copy = [...newImages];
        const [selected] = copy.splice(index, 1);
        copy.unshift(selected);
        setNewImages(copy);
        setNewImage(selected);
      }
    }
  };

  const handleDeleteGalleryImage = (index: number, isEdit = false) => {
    if (isEdit) {
      if (!editModalProduct) return;
      const current = editModalProduct.images && editModalProduct.images.length > 0 ? [...editModalProduct.images] : [editModalProduct.image];
      current.splice(index, 1);
      const newCover = current[0] || '';
      setEditModalProduct({
        ...editModalProduct,
        image: newCover,
        images: current,
      });
    } else {
      const copy = [...newImages];
      copy.splice(index, 1);
      setNewImages(copy);
      setNewImage(copy[0] || '');
    }
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isRoom = false) => {
    const file = e.target.files?.[0];
    if (!file || !editModalProduct) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Fotoğraf boyutu 5MB üzerinde olamaz.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isRoom) {
          setEditModalProduct({ ...editModalProduct, roomImage: reader.result });
        } else {
          const current = editModalProduct.images && editModalProduct.images.length > 0 ? editModalProduct.images : [editModalProduct.image];
          setEditModalProduct({ 
            ...editModalProduct, 
            image: reader.result,
            images: [reader.result, ...current.filter(img => img !== reader.result)]
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddVariantToEditProduct = () => {
    if (!newVarName.trim() || !editModalProduct) return;
    const newVar: ProductVariant = {
      id: `v-${Date.now()}`,
      name: newVarName.trim(),
      colorHex: newVarColor,
      code: newVarCode.trim() || undefined,
      priceDifference: newVarPriceDiff !== 0 ? newVarPriceDiff : undefined,
    };
    const currentVariants = editModalProduct.variants || [];
    setEditModalProduct({
      ...editModalProduct,
      variants: [...currentVariants, newVar],
    });
    setNewVarName('');
    setNewVarCode('');
    setNewVarPriceDiff(0);
  };

  const handleDeleteVariantFromEditProduct = (varId: string) => {
    if (!editModalProduct || !editModalProduct.variants) return;
    setEditModalProduct({
      ...editModalProduct,
      variants: editModalProduct.variants.filter((v) => v.id !== varId),
    });
  };

  // Add Product Submit
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      alert('Lütfen ürün adı ve kodunu giriniz.');
      return;
    }
    const finalImages = newImages.length > 0 
      ? newImages 
      : (newImage ? [newImage, ...(newRoomImage ? [newRoomImage] : [])] : []);
    const mainImg = finalImages[0] || newImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80';

    const newProduct: Product = {
      id: `custom-prod-${Date.now()}`,
      category: newCategory,
      brand: newBrand,
      name: newName.trim(),
      code: newCode.trim(),
      image: mainImg,
      images: finalImages.length > 0 ? finalImages : [mainImg],
      roomImage: newRoomImage || undefined,
      description: newDescription.trim() || `${newBrand} 1. sınıf mimari seri ürün.`,
      unit: (newUnit || categories.find(c => c.key === newCategory)?.unit || 'm²') as Product['unit'],
      materialPrice: newMaterialPrice,
      workmanshipPrice: newLaborPrice,
      marketPrice: newMarketPrice,
      isActive: true,
      isStoreProduct: newIsStoreProduct,
      packageInfo: newPackageInfo.trim() || undefined,
      specs: newSpecs.split('\n').map(s => s.trim()).filter(Boolean),
    };
    onAddProduct(newProduct);
    setIsAddOpen(false);
    setNewName('');
    setNewCode('');
    setNewImage('');
    setNewImages([]);
    setNewUrlInput('');
    setNewRoomImage('');
    setNewDescription('');
    setNewIsStoreProduct(true);
    setNewUnit('m²');
    setNewPackageInfo('');
    setNewSpecs('');
    setNewMarketPrice(0);
    showToast('Yeni ürün ve fotoğraf albümü başarıyla eklendi.');
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
    onUpdateSettings({
      ...settings,
      serviceAreas: updated,
      coverageNotice: localCoverageNotice,
    });
    setNewCityName('');
    setNewCityDistricts('');
    showToast(`${newArea.city} şehri hizmet bölgelerine eklendi ve kaydedildi.`);
  };

  // Add District to City
  const handleAddDistrict = (cityName: string) => {
    const text = newDistrictInputs[cityName]?.trim();
    if (!text) return;
    const updated = localServiceAreas.map(area =>
      area.city === cityName
        ? { ...area, districts: [...area.districts, text] }
        : area
    );
    setLocalServiceAreas(updated);
    onUpdateSettings({
      ...settings,
      serviceAreas: updated,
      coverageNotice: localCoverageNotice,
    });
    setNewDistrictInputs(prev => ({ ...prev, [cityName]: '' }));
    showToast(`${text} ilçesi ${cityName} listesine eklendi.`);
  };

  // Remove District from City
  const handleRemoveDistrict = (cityName: string, districtName: string) => {
    const updated = localServiceAreas.map(area =>
      area.city === cityName
        ? { ...area, districts: area.districts.filter(d => d !== districtName) }
        : area
    );
    setLocalServiceAreas(updated);
    onUpdateSettings({
      ...settings,
      serviceAreas: updated,
      coverageNotice: localCoverageNotice,
    });
  };

  // Delete City
  const handleDeleteCity = (cityName: string) => {
    if (confirm(`${cityName} şehrini hizmet bölgelerinden silmek istediğinize emin misiniz?`)) {
      const updated = localServiceAreas.filter(a => a.city !== cityName);
      setLocalServiceAreas(updated);
      onUpdateSettings({
        ...settings,
        serviceAreas: updated,
        coverageNotice: localCoverageNotice,
      });
      showToast(`${cityName} şehri hizmet bölgelerinden silindi.`);
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
      bankInfo: localBankInfo,
      paymentMethods: localPaymentMethods,
      legalInfo: localLegalInfo,
      freeShippingThreshold: Number(localFreeShipping) || 0,
      standardShippingCost: Number(localStandardShipping) || 0,
    };
    onUpdateSettings(updated);
    showToast('Şirket, banka/IBAN, ödeme yöntemleri ve iletişim ayarları canlı siteye kaydedildi!');
  };

  // Full System JSON Backup Export
  const handleExportFullBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      products,
      settings,
      leads,
      customers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rvoba_tam_yedek_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Tam sistem yedeği (JSON) bilgisayara indirildi.');
  };

  // Full System JSON Backup Import
  const handleImportFullBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (onImportFullBackup) {
          onImportFullBackup(parsed);
          if (parsed.settings) {
            setLocalPhone(parsed.settings.phoneNumber || localPhone);
            setLocalSupportPhone(parsed.settings.supportPhone || localSupportPhone);
            setLocalCompanyName(parsed.settings.companyName || localCompanyName);
            if (parsed.settings.bankInfo) setLocalBankInfo(parsed.settings.bankInfo);
            if (parsed.settings.paymentMethods) setLocalPaymentMethods(parsed.settings.paymentMethods);
            if (parsed.settings.legalInfo) setLocalLegalInfo(parsed.settings.legalInfo);
          }
          showToast('Tam sistem yedeği başarıyla geri yüklendi ve canlı site güncellendi!');
        }
      } catch {
        alert('Geçersiz yedek dosyası formatı. Lütfen RVOBA JSON yedek dosyası seçin.');
      }
    };
    reader.readAsText(file);
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

  // Normalize lead status (including backwards-compatibility for legacy values)
  const normalizeLeadStatus = (status?: string): NonNullable<LeadRequest['status']> => {
    if (status === 'sozlesme_imzalandi' || status === 'completed') return 'sozlesme_imzalandi';
    if (status === 'kesif_verildi' || status === 'scheduled') return 'kesif_verildi';
    if (status === 'arandi' || status === 'contacted') return 'arandi';
    return 'bekliyor';
  };

  const getLeadStatusLabel = (status?: string, isStoreOrder?: boolean) => {
    const norm = normalizeLeadStatus(status);
    if (isStoreOrder) {
      if (norm === 'sozlesme_imzalandi') return 'Teslim Edildi';
      if (norm === 'kesif_verildi') return 'Kargoya Verildi / Sevkiyatta';
      if (norm === 'arandi') return 'Onaylandı & Hazırlanıyor';
      return 'Sipariş Alındı';
    }
    if (norm === 'sozlesme_imzalandi') return 'Sözleşme İmzalandı';
    if (norm === 'kesif_verildi') return 'Keşif Randevusu Verildi';
    if (norm === 'arandi') return 'Mimar Aradı';
    return 'Bekliyor';
  };

  const activeLeadsCount = leads.filter(
    (l) => normalizeLeadStatus(l.status) !== 'sozlesme_imzalandi'
  ).length;
  const archivedLeadsCount = leads.filter(
    (l) => normalizeLeadStatus(l.status) === 'sozlesme_imzalandi'
  ).length;

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const normStatus = normalizeLeadStatus(l.status);
    const isArchivedLead = normStatus === 'sozlesme_imzalandi';
    const matchArchiveTab = leadArchiveTab === 'archived' ? isArchivedLead : !isArchivedLead;
    const matchStatus = leadStatusFilter === 'all' || normStatus === leadStatusFilter;
    const isStoreOrder =
      l.leadType === 'store_order' ||
      l.leadType === 'web_order' ||
      l.id.startsWith('store-order') ||
      l.id.startsWith('order-');
    const isCallback = l.id.startsWith('callback') || l.leadType === 'callback';
    const isInspection = !isCallback && !isStoreOrder && !!l.preferredDate;
    const isWhatsapp = !isCallback && !isStoreOrder && !l.preferredDate;

    const matchType =
      leadTypeFilter === 'all' ||
      (leadTypeFilter === 'store_order' && isStoreOrder) ||
      (leadTypeFilter === 'callback' && isCallback) ||
      (leadTypeFilter === 'inspection' && isInspection) ||
      (leadTypeFilter === 'whatsapp' && isWhatsapp);

    return matchArchiveTab && matchStatus && matchType;
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
      const isStoreOrder =
        l.leadType === 'store_order' ||
        l.leadType === 'web_order' ||
        l.id.startsWith('store-order') ||
        l.id.startsWith('order-');
      const isCallback = l.id.startsWith('callback') || l.leadType === 'callback';
      const isInspection = !isCallback && !isStoreOrder && !!l.preferredDate;
      const typeStr = isStoreOrder
        ? 'Doğrudan Mağaza Siparişi'
        : isCallback
        ? 'Geri Arama Talebi'
        : isInspection
        ? 'Lazer Keşif Randevusu'
        : 'WhatsApp Teklifi';
      const statusStr = getLeadStatusLabel(l.status, isStoreOrder);
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
      <header className="bg-[#0A0A0B] text-white border-b border-white/10 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateCustomer}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition px-3.5 py-1.5 rounded-full border border-white/20 hover:border-white bg-white/5"
            title="Müşterilerin gördüğü canlı web sitesini aç"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Canlı Siteyi Gör</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg tracking-tight text-white">RVOBA®</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              YÖNETİM & BACKOFFICE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 border-r border-white/10 pr-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Güvenli Oturum</span>
            </span>
            <span>•</span>
            <span>Ürün: <strong className="text-white">{products.length}</strong></span>
            <span>•</span>
            <span>CRM: <strong className="text-white">{leads.length}</strong></span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-600 transition flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-500/30 hover:border-rose-600 bg-rose-500/10 shadow-sm"
              title="Yönetim Panelinden Güvenli Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Güvenli Çıkış</span>
            </button>
          )}
        </div>
      </header>

      {/* 4 Ana Sütunlu Sadeleştirilmiş Yönetim Menüsü */}
      <div className="bg-white border-b border-[#E8EAED] px-6 py-3 overflow-x-auto scrollbar-none shadow-xs sticky top-[57px] z-20">
        <div className="max-w-7xl mx-auto space-y-2.5 min-w-max">
          {/* 4 Ana Kategori */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAdminTab('leads')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                adminTab === 'leads' || adminTab === 'customers'
                  ? 'bg-[#0A0A0B] text-white shadow-md'
                  : 'bg-[#F8F9FA] text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B] border border-[#E8EAED]'
              }`}
            >
              <Inbox className="w-4 h-4 text-blue-400" />
              <span>1. Siparişler, Usta Talepleri & Müşteriler ({leads.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('products')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                adminTab === 'products' || adminTab === 'labor_rates' || adminTab === 'durations'
                  ? 'bg-[#0A0A0B] text-white shadow-md'
                  : 'bg-[#F8F9FA] text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B] border border-[#E8EAED]'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. Ürünler & Usta İşçilik Fiyatları ({products.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('cms')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                adminTab === 'cms' || adminTab === 'areas' || adminTab === 'gallery'
                  ? 'bg-[#0A0A0B] text-white shadow-md'
                  : 'bg-[#F8F9FA] text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B] border border-[#E8EAED]'
              }`}
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>3. Vitrin, Bölgeler & Referanslar</span>
            </button>

            <button
              onClick={() => setAdminTab('settings')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                adminTab === 'settings'
                  ? 'bg-[#0A0A0B] text-white shadow-md'
                  : 'bg-[#F8F9FA] text-[#4B5563] hover:bg-[#F1F3F5] hover:text-[#0A0A0B] border border-[#E8EAED]'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-purple-400" />
              <span>4. Şirket, Ödeme (IBAN/POS) & Güvenlik</span>
            </button>
          </div>

          {/* Alt Sekmeler (Seçili Ana Sütuna Göre Gösterilir) */}
          {(adminTab === 'leads' || adminTab === 'customers') && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Alt Bölüm:</span>
              <button
                onClick={() => setAdminTab('leads')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'leads'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Inbox className="w-3 h-3" />
                <span>Gelen Siparişler & Keşif Talepleri ({leads.length})</span>
              </button>
              <button
                onClick={() => setAdminTab('customers')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'customers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Kayıtlı Müşteri Portföyü ({customers.length})</span>
              </button>
            </div>
          )}

          {(adminTab === 'products' || adminTab === 'labor_rates' || adminTab === 'durations') && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Alt Bölüm:</span>
              <button
                onClick={() => setAdminTab('products')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'products'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Ürün Kataloğu & Mağaza Fiyatları ({products.length})</span>
              </button>
              <button
                onClick={() => setAdminTab('labor_rates')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'labor_rates'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Wrench className="w-3 h-3" />
                <span>Taban Usta İşçilik Fiyatları ("Malzeme Bende")</span>
              </button>
              <button
                onClick={() => setAdminTab('durations')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'durations'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Tadilat Teslimat Süreleri</span>
              </button>
            </div>
          )}

          {(adminTab === 'cms' || adminTab === 'areas' || adminTab === 'gallery') && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Alt Bölüm:</span>
              <button
                onClick={() => setAdminTab('cms')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'cms'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Sayfa Metinleri & Vitrin (CMS)</span>
              </button>
              <button
                onClick={() => setAdminTab('areas')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'areas'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Usta Hizmet Bölgeleri ({localServiceAreas.length} İl)</span>
              </button>
              <button
                onClick={() => setAdminTab('gallery')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                  adminTab === 'gallery'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Öncesi / Sonrası Referanslar ({localProjects.length})</span>
              </button>
            </div>
          )}
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

              <div className="flex flex-wrap items-center gap-2.5">
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

                {products.length > 0 && onClearAllProducts && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Katalogdaki TÜM ÜRÜNLERİ kalıcı olarak silmek istediğinize emin misiniz? (Kendi ürünlerinizi sıfırdan eklemek için kullanabilirsiniz)')) {
                        onClearAllProducts();
                        showToast('Tüm ürünler kalıcı olarak silindi. Artık kendi ürünlerinizi ekleyebilirsiniz.');
                      }
                    }}
                    className="btn-pill-outline border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Tüm Ürünleri Sil</span>
                  </button>
                )}

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
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-14 px-6 text-center text-slate-500">
                          <div className="max-w-md mx-auto space-y-3">
                            <p className="text-sm font-bold text-[#0A0A0B]">
                              {products.length === 0 ? 'Katalogda Henüz Hiç Ürün Yok' : 'Bu Filtrede Ürün Bulunamadı'}
                            </p>
                            <p className="text-xs text-[#64748B]">
                              {products.length === 0
                                ? 'Kendi ürünlerinizi sıfırdan ekleyebilir veya dilerseniz örnek katalog ürünlerini geri yükleyebilirsiniz.'
                                : 'Arama kelimenizi veya seçili kategoriyi değiştirerek tekrar deneyebilirsiniz.'}
                            </p>
                            {products.length === 0 && (
                              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setIsAddOpen(true)}
                                  className="btn-pill-black text-xs py-2.5 px-5 font-bold flex items-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>İlk Ürününü Ekle</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('Örnek katalog ürünlerini geri yüklemek istiyor musunuz?')) {
                                      onResetDefaults();
                                      showToast('Örnek katalog ürünleri geri yüklendi.');
                                    }
                                  }}
                                  className="btn-pill-outline text-xs py-2.5 px-4 font-semibold flex items-center gap-1.5"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Örnek Ürünleri Geri Yükle</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
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
                              `${p.marketPrice && p.marketPrice > 0 ? p.marketPrice : 0} ₺`
                            )}
                          </td>

                          {/* Toplam */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#0A0A0B]">
                            {unitTotal} ₺ / {p.unit}
                          </td>

                          {/* Aktif / Pasif & Stok Durumu */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onToggleActive(p.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                  p.isActive !== false
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                                title="Sitede Göster / Gizle"
                              >
                                {p.isActive !== false ? 'Aktif' : 'Pasif'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextStock = p.inStock === false ? true : false;
                                  onUpdateProduct({ ...p, inStock: nextStock });
                                  showToast(
                                    `${p.name}: ${nextStock ? 'Stokta (Satışa Açık)' : 'Tükendi (Stok Yenileniyor)'}`
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                  p.inStock !== false
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                }`}
                                title="Stok Durumunu Değiştir (Stokta / Tükendi)"
                              >
                                {p.inStock !== false ? 'Stokta' : 'Tükendi'}
                              </button>
                            </div>
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
                                      setEditMarketPrice(p.marketPrice && p.marketPrice > 0 ? p.marketPrice : 0);
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
        {/* MODÜL 2: SAYFA İÇERİKLERİ & VİTRİN YÖNETİMİ (CMS)       */}
        {/* ======================================================== */}
        {adminTab === 'cms' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm sticky top-[105px] z-10 backdrop-blur-md bg-white/95">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Canlı Siteyle %100 Senkronize CMS</span>
                </div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                  Sayfa Metinleri & Vitrin Yönetimi (CMS)
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Müşterinin sitede gördüğü tüm başlıkları, sloganları, güvence maddelerini ve vitrin kartlarını buradan anında değiştirin.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetContent}
                  className="btn-pill-outline text-xs py-2 px-4 border-slate-300 hover:border-slate-400 text-slate-600 flex items-center gap-1.5"
                  title="Metinleri varsayılan fabrika ayarlarına döndür"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Varsayılana Döndür</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveContent}
                  className="btn-pill-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 px-5 font-bold shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Değişiklikleri Canlı Siteye Kaydet</span>
                </button>
              </div>
            </div>

            {/* 1. BÖLÜM: HERO / KARŞILAMA VE MANŞET */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-[#E8EAED] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>1. Ana Sayfa Manşeti & Hero Bölümü</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Müşteri siteye girdiğinde ilk gördüğü büyük manşet, rozet ve açıklama metni.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">
                    Hero Üst Rozet Metni
                  </label>
                  <input
                    type="text"
                    value={localContent.heroBadge || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, heroBadge: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl px-4 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black font-medium"
                    placeholder="Piyasadan %20-30 Daha Uygun Bayi Fiyatı & 81 İl Kargo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">
                    Ana Manşet Başlığı (H1)
                  </label>
                  <textarea
                    rows={2}
                    value={localContent.heroTitle || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl p-3 text-xs text-[#0A0A0B] focus:outline-none focus:border-black font-semibold resize-none"
                    placeholder="İster Anahtar Teslim Mimari Tadilat, İster Fabrika Bayi Fiyatıyla Tasarım Malzemeleri."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">
                    Alt Açıklama Metni (Paragraf)
                  </label>
                  <textarea
                    rows={3}
                    value={localContent.heroSubtitle || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-2xl p-3 text-xs text-[#0A0A0B] focus:outline-none focus:border-black resize-none"
                    placeholder="Usta stresi ve aracı komisyonu olmadan evinizi yenileyin..."
                  />
                </div>
              </div>
            </div>

            {/* 2. BÖLÜM: İKİ HİZMET GİRİŞ KAPISI (KARTLAR) */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-[#E8EAED] pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>2. Ana Sayfadaki İki Giriş Kapısı (Tadilat & Mağaza Kartları)</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Müşteriyi "Tadilat Hesapla" veya "Doğrudan Malzeme Satın Al" yönlendiren iki ana interaktif kart.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Kapı 1: Tadilat Kartı */}
                <div className="p-5 rounded-2xl bg-[#0A0A0B] text-white border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">🏡 Kapı 1: Tadilat & Mimarlık</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Kart Rozeti</label>
                    <input
                      type="text"
                      value={localContent.cardRenovationBadge || ''}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, cardRenovationBadge: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Kart Başlığı</label>
                    <input
                      type="text"
                      value={localContent.cardRenovationTitle || ''}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, cardRenovationTitle: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Açıklama</label>
                    <textarea
                      rows={2}
                      value={localContent.cardRenovationDesc || ''}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, cardRenovationDesc: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-2 text-xs text-slate-200 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Hizmet Kapsamı Notu</label>
                      <input
                        type="text"
                        value={localContent.cardRenovationNote || ''}
                        onChange={(e) => setLocalContent(prev => ({ ...prev, cardRenovationNote: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Buton Metni</label>
                      <input
                        type="text"
                        value={localContent.cardRenovationBtnText || ''}
                        onChange={(e) => setLocalContent(prev => ({ ...prev, cardRenovationBtnText: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Kapı 2: Mağaza Kartı */}
                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#CBD5E1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">📦 Kapı 2: Malzeme Mağazası (Kargo)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Kart Rozeti</label>
                    <input
                      type="text"
                      value={localContent.cardStoreBadge || ''}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, cardStoreBadge: e.target.value }))}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Kart Başlığı</label>
                    <input
                      type="text"
                      value={localContent.cardStoreTitle || ''}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, cardStoreTitle: e.target.value }))}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4B5563] mb-1">Açıklama</label>
                    <textarea
                      rows={2}
                      value={localContent.cardStoreDesc || ''}
                      onChange={(e) => setLocalContent(prev => ({ ...prev, cardStoreDesc: e.target.value }))}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl p-2 text-xs text-[#4B5563] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">Teslimat Notu</label>
                      <input
                        type="text"
                        value={localContent.cardStoreNote || ''}
                        onChange={(e) => setLocalContent(prev => ({ ...prev, cardStoreNote: e.target.value }))}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs text-amber-700 font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] mb-1">Buton Metni</label>
                      <input
                        type="text"
                        value={localContent.cardStoreBtnText || ''}
                        onChange={(e) => setLocalContent(prev => ({ ...prev, cardStoreBtnText: e.target.value }))}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#0A0A0B] font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. BÖLÜM: "NEDEN RVOBA?" GÜVENCE MODELİ & 3 SÜTUN */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-[#E8EAED] pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3. "Neden RVOBA?" Güvence Modeli & Slogan</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Her sayfanın altında yer alan kurumsal güvence başlığı, sloganı ve 3 ana taahhüt kartı.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Üst Küçük Rozet</label>
                  <input
                    type="text"
                    value={localContent.trustBadge || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, trustBadge: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Ana Slogan Başlığı</label>
                  <input
                    type="text"
                    value={localContent.trustTitle || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, trustTitle: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5563] mb-1">Slogan Alt Açıklaması</label>
                <textarea
                  rows={2}
                  value={localContent.trustSubtitle || ''}
                  onChange={(e) => setLocalContent(prev => ({ ...prev, trustSubtitle: e.target.value }))}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0A0A0B] focus:outline-none resize-none"
                />
              </div>

              {/* 3 Sütun */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Sütun 1 */}
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">Sütun 01</span>
                  <input
                    type="text"
                    value={localContent.pillar1Title || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar1Title: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none"
                    placeholder="Sütun Başlığı"
                  />
                  <textarea
                    rows={3}
                    value={localContent.pillar1Desc || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar1Desc: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[11px] text-[#4B5563] focus:outline-none resize-none"
                    placeholder="Açıklama"
                  />
                  <input
                    type="text"
                    value={localContent.pillar1Note || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar1Note: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[11px] text-emerald-700 font-semibold focus:outline-none"
                    placeholder="Alt Onay Metni"
                  />
                </div>

                {/* Sütun 2 */}
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">Sütun 02</span>
                  <input
                    type="text"
                    value={localContent.pillar2Title || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar2Title: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none"
                    placeholder="Sütun Başlığı"
                  />
                  <textarea
                    rows={3}
                    value={localContent.pillar2Desc || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar2Desc: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[11px] text-[#4B5563] focus:outline-none resize-none"
                    placeholder="Açıklama"
                  />
                  <input
                    type="text"
                    value={localContent.pillar2Note || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar2Note: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[11px] text-emerald-700 font-semibold focus:outline-none"
                    placeholder="Alt Onay Metni"
                  />
                </div>

                {/* Sütun 3 */}
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">Sütun 03</span>
                  <input
                    type="text"
                    value={localContent.pillar3Title || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar3Title: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none"
                    placeholder="Sütun Başlığı"
                  />
                  <textarea
                    rows={3}
                    value={localContent.pillar3Desc || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar3Desc: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[11px] text-[#4B5563] focus:outline-none resize-none"
                    placeholder="Açıklama"
                  />
                  <input
                    type="text"
                    value={localContent.pillar3Note || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, pillar3Note: e.target.value }))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[11px] text-emerald-700 font-semibold focus:outline-none"
                    placeholder="Alt Onay Metni"
                  />
                </div>
              </div>
            </div>

            {/* 4. BÖLÜM: MAĞAZA (STORE) VE VİTRİN KUTUSU */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-[#E8EAED] pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>4. Mağaza (Store) Başlıkları & "Haftanın Yıldızı" Vitrini</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Ürün mağazasının en üstünde yer alan karşılama bannerı, kargo/taksit rozetleri ve sağdaki vitrin ürünü.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Mağaza Banner Rozeti</label>
                  <input
                    type="text"
                    value={localContent.storeBadge || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, storeBadge: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Mağaza Ana Başlığı</label>
                  <input
                    type="text"
                    value={localContent.storeTitle || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, storeTitle: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4B5563] mb-1">Mağaza Açıklama Metni</label>
                <textarea
                  rows={2}
                  value={localContent.storeSubtitle || ''}
                  onChange={(e) => setLocalContent(prev => ({ ...prev, storeSubtitle: e.target.value }))}
                  className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0A0A0B] focus:outline-none resize-none"
                />
              </div>

              {/* 3 Perks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">Rozet 1 (Kargo)</label>
                  <input
                    type="text"
                    value={localContent.storePerk1 || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, storePerk1: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">Rozet 2 (Taksit)</label>
                  <input
                    type="text"
                    value={localContent.storePerk2 || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, storePerk2: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">Rozet 3 (Garanti)</label>
                  <input
                    type="text"
                    value={localContent.storePerk3 || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, storePerk3: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. BÖLÜM: ÜST DUYURU BANDI */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-[#E8EAED] pb-3">
                <h3 className="text-sm font-bold text-[#0A0A0B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>5. Sitenin En Üstündeki Siyah Duyuru Bandı Metinleri</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Sayfanın en tepesinde sürekli görünen 3 kısa avantaj ve bildirim metni.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Duyuru 1 (Yeşil İkonlu)</label>
                  <input
                    type="text"
                    value={localContent.announcementText1 || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, announcementText1: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Duyuru 2</label>
                  <input
                    type="text"
                    value={localContent.announcementText2 || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, announcementText2: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] mb-1">Duyuru 3</label>
                  <input
                    type="text"
                    value={localContent.announcementText3 || ''}
                    onChange={(e) => setLocalContent(prev => ({ ...prev, announcementText3: e.target.value }))}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveContent}
                className="btn-pill-black bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-3 px-8 font-bold shadow-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Tüm Sayfa Değişikliklerini Canlı Siteye Kaydet</span>
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 4: TABAN İŞÇİLİK FİYATLARI ("Elimde Malzeme Var")   */}
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
                  const days = localDurationRules.baseDays[cat.key] ?? 2;
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
            
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-[#0A0A0B]">
                    Gelen Müşteri Talepleri & CRM Havuzu
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Teslim edilen siparişler ve sözleşmesi tamamlanan talepler otomatik olarak <strong>Tamamlananlar / Arşiv</strong> sekmesine taşınır.
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

                  {leadArchiveTab === 'active' && (
                    <select
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                      className="bg-[#F8F9FA] border border-[#CBD5E1] rounded-full px-3 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none"
                    >
                      <option value="all">Tüm Aktif Durumlar</option>
                      <option value="bekliyor">🟡 Sipariş / Talep Alındı (Bekliyor)</option>
                      <option value="arandi">🔵 Hazırlanıyor / Mimar Aradı</option>
                      <option value="kesif_verildi">🟣 Kargoya Verildi / Keşif Planlandı</option>
                    </select>
                  )}

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

              {/* Aktif Siparişler vs Tamamlananlar / Arşiv Sekmeleri */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#F1F3F5]">
                <button
                  type="button"
                  onClick={() => {
                    setLeadArchiveTab('active');
                    setLeadStatusFilter('all');
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                    leadArchiveTab === 'active'
                      ? 'bg-[#0A0A0B] text-white shadow-sm'
                      : 'bg-[#F8F9FA] text-[#4B5563] hover:bg-[#F1F3F5] border border-[#E8EAED]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aktif Sipariş & Talepler ({activeLeadsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLeadArchiveTab('archived');
                    setLeadStatusFilter('all');
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
                    leadArchiveTab === 'archived'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-[#F8F9FA] text-[#4B5563] hover:bg-[#F1F3F5] border border-[#E8EAED]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tamamlananlar / Arşiv ({archivedLeadsCount})</span>
                </button>
              </div>
            </div>

            {/* Talepler Listesi */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#E8EAED] rounded-3xl space-y-2">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#64748B]">
                  {leadArchiveTab === 'active'
                    ? 'Bekleyen veya devam eden aktif sipariş/talep bulunmuyor.'
                    : 'Henüz tamamlanan / arşivlenen sipariş bulunmuyor.'}
                </p>
                {leadArchiveTab === 'active' && archivedLeadsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setLeadArchiveTab('archived')}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Tamamlanan {archivedLeadsCount} siparişi arşivde görüntüle →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => {
                  const isStoreOrder =
                    lead.leadType === 'store_order' ||
                    lead.leadType === 'web_order' ||
                    lead.id.startsWith('store-order') ||
                    lead.id.startsWith('order-');
                  const isCallback = lead.id.startsWith('callback') || lead.leadType === 'callback';
                  const isInspection = !isCallback && !isStoreOrder && !!lead.preferredDate;
                  const currentStatus = normalizeLeadStatus(lead.status);

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
                          onChange={(e) => {
                            const nextVal = e.target.value as LeadRequest['status'];
                            onUpdateLeadStatus(lead.id, nextVal);
                            if (nextVal === 'sozlesme_imzalandi') {
                              showToast(
                                isStoreOrder
                                  ? 'Sipariş "Teslim Edildi" olarak işaretlendi ve Tamamlananlar / Arşiv sekmesine taşındı.'
                                  : 'Talep tamamlandı ve Tamamlananlar / Arşiv sekmesine taşındı.'
                              );
                            }
                          }}
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
                          {isStoreOrder ? (
                            <>
                              <option value="bekliyor">🟡 Sipariş Alındı</option>
                              <option value="arandi">🔵 Onaylandı & Hazırlanıyor</option>
                              <option value="kesif_verildi">🟣 Kargoya Verildi</option>
                              <option value="sozlesme_imzalandi">🟢 Teslim Edildi</option>
                            </>
                          ) : (
                            <>
                              <option value="bekliyor">🟡 Bekliyor</option>
                              <option value="arandi">🔵 Mimar Aradı</option>
                              <option value="kesif_verildi">🟣 Keşif Verildi</option>
                              <option value="sozlesme_imzalandi">🟢 Sözleşme İmzalandı</option>
                            </>
                          )}
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
                      placeholder="905447685137"
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
                      placeholder="0544 768 51 37"
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

                {/* BANKA, IBAN & KARGO BAREMİ AYARLARI */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2.5">
                    <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>Banka, IBAN & Kargo Ayarları (Müşteri Ödeme Ekranında Görünür)</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Dinamik Tahsilat
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Banka Adı / Şube
                      </label>
                      <input
                        type="text"
                        value={localBankInfo.bankName}
                        onChange={(e) => setLocalBankInfo({ ...localBankInfo, bankName: e.target.value })}
                        placeholder="Örn: Garanti BBVA / Ziraat Bankası"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-semibold focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Hesap Sahibi / Alıcı Unvanı
                      </label>
                      <input
                        type="text"
                        value={localBankInfo.accountHolder}
                        onChange={(e) => setLocalBankInfo({ ...localBankInfo, accountHolder: e.target.value })}
                        placeholder="Şirket Unvanı veya Şahıs AdSoyad"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-semibold focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Resmi IBAN Numarası
                      </label>
                      <input
                        type="text"
                        value={localBankInfo.iban}
                        onChange={(e) => setLocalBankInfo({ ...localBankInfo, iban: e.target.value })}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-mono font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Havale/EFT İndirimi (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={localBankInfo.transferDiscountPercent}
                        onChange={(e) => setLocalBankInfo({ ...localBankInfo, transferDiscountPercent: Number(e.target.value) })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-mono font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/50">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Ücretsiz Kargo Alt Limiti (₺)
                      </label>
                      <input
                        type="number"
                        value={localFreeShipping}
                        onChange={(e) => setLocalFreeShipping(Number(e.target.value))}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-mono font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Standart Kargo / Ambar Ücreti (₺)
                      </label>
                      <input
                        type="number"
                        value={localStandardShipping}
                        onChange={(e) => setLocalStandardShipping(Number(e.target.value))}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-mono font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* ÖDEME YÖNTEMİ ŞALTERLERİ */}
                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h4 className="text-xs font-extrabold text-[#0A0A0B] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>Aktif Ödeme Yöntemi Şalterleri (Şirket POS Kurulumuna Göre Aç/Kapat)</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localPaymentMethods.enableBankTransfer}
                        onChange={(e) => setLocalPaymentMethods({ ...localPaymentMethods, enableBankTransfer: e.target.checked })}
                        className="mt-0.5 rounded text-black focus:ring-black w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0A0A0B]">Havale / EFT ile Ödeme</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">IBAN bilgilerinizi göstererek sipariş alır.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localPaymentMethods.enableCashOnDelivery}
                        onChange={(e) => setLocalPaymentMethods({ ...localPaymentMethods, enableCashOnDelivery: e.target.checked })}
                        className="mt-0.5 rounded text-black focus:ring-black w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0A0A0B]">Kapıda / Ambar Tesliminde Ödeme</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Malzeme tesliminde veya keşifte ödeme alır.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localPaymentMethods.enableCreditCard}
                        onChange={(e) => setLocalPaymentMethods({ ...localPaymentMethods, enableCreditCard: e.target.checked })}
                        className="mt-0.5 rounded text-black focus:ring-black w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0A0A0B]">Online Kredi Kartı (Sanal POS)</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Şirket Sanal POS'unuz açıldığında aktif edin.</div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                      Kredi Kartı Açıklama Notu (Örn: "Tüm kartlara 12 taksit" veya "Sanal POS yakında aktif")
                    </label>
                    <input
                      type="text"
                      value={localPaymentMethods.creditCardNote || ''}
                      onChange={(e) => setLocalPaymentMethods({ ...localPaymentMethods, creditCardNote: e.target.value })}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* RESMİ ŞİRKET, VERGİ DAİRESİ & MERSİS BİLGİLERİ */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>Resmi Şirket & Vergi Bilgileri (Sözleşmeler ve Proforma İçin)</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Şirket Kuruluşu Tamamlandığında Güncelleyin
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Vergi Dairesi
                      </label>
                      <input
                        type="text"
                        value={localLegalInfo.taxOffice}
                        onChange={(e) => setLocalLegalInfo({ ...localLegalInfo, taxOffice: e.target.value })}
                        placeholder="Örn: Kadıköy V.D."
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Vergi Numarası / TCKN
                      </label>
                      <input
                        type="text"
                        value={localLegalInfo.taxNumber}
                        onChange={(e) => setLocalLegalInfo({ ...localLegalInfo, taxNumber: e.target.value })}
                        placeholder="Kuruluş Aşamasında"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        MERSİS Numarası
                      </label>
                      <input
                        type="text"
                        value={localLegalInfo.mersisNo}
                        onChange={(e) => setLocalLegalInfo({ ...localLegalInfo, mersisNo: e.target.value })}
                        placeholder="Kuruluş Aşamasında"
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] font-mono focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Resmi Tebligat / Merkez Adresi
                      </label>
                      <input
                        type="text"
                        value={localLegalInfo.companyAddress}
                        onChange={(e) => setLocalLegalInfo({ ...localLegalInfo, companyAddress: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0A0A0B] mb-1">
                        Resmi Kurumsal E-Posta
                      </label>
                      <input
                        type="email"
                        value={localLegalInfo.companyEmail}
                        onChange={(e) => setLocalLegalInfo({ ...localLegalInfo, companyEmail: e.target.value })}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Kademeli Hakediş Yüzdeleri */}
                <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] space-y-3">
                  <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider">
                    Tadilat & Usta Hizmeti Kademeli Hakediş Ödeme Yüzdeleri:
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
                    className="btn-pill-black text-xs py-3.5 px-8 font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Tüm Şirket, Banka/IBAN ve Ödeme Ayarlarını Kaydet</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Canlı Bulut Senkronizasyonu & Tam Sistem Yedeği (JSON) */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-extrabold text-[#0A0A0B]">
                      Canlı Senkronizasyon & Tam Sistem Yedekleme
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Tüm ürünleri, fiyatları, siparişleri ve şirket ayarlarını tek tıkla yedekleyin veya başka bir cihaza aktarın.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={backupFileInputRef}
                    accept=".json,application/json"
                    onChange={handleImportFullBackupFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleExportFullBackup}
                    className="btn-pill-black bg-[#0A0A0B] hover:bg-slate-800 text-white text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tam Yedeği İndir (.JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => backupFileInputRef.current?.click()}
                    className="btn-pill-outline text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Yedekten Geri Yükle</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div>
                      <span className="block text-xs font-extrabold text-emerald-950">
                        Supabase PostgreSQL Bulut Veritabanı Aktif (eu-central-1 • Tüm Cihazlar Canlı Senkron)
                      </span>
                      <span className="block text-[11px] text-emerald-800">
                        Eklediğiniz/sildiğiniz ürünler, fiyatlar, siparişler ve müşteri hesapları tüm tarayıcılarda ve telefonlarda anında ortak veritabanından çalışır.
                      </span>
                    </div>
                  </div>

                  {onRefreshCloud && (
                    <button
                      type="button"
                      onClick={async () => {
                        await onRefreshCloud();
                        showToast('Veriler Supabase bulut veritabanından başarıyla yenilendi!');
                      }}
                      className="btn-pill-black bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2 px-4 font-bold shrink-0 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Buluttan Yenile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Telegram Anlık Mobil Sipariş Bildirimi */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-950">
                        Anlık Telegram Sipariş Bildirimi (Cep Telefonunuza Push Mesaj)
                      </h4>
                      <p className="text-[10px] text-blue-800">
                        Müşteri WhatsApp'a tıklamasa bile sipariş verildiği an tüm detaylar Telegram üzerinden cebinize düşer.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localTelegramConfig.enabled === true}
                      onChange={(e) => setLocalTelegramConfig({ ...localTelegramConfig, enabled: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-blue-950">Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-blue-950 mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 7123456789:AAHk..."
                      value={localTelegramConfig.botToken || ''}
                      onChange={(e) => setLocalTelegramConfig({ ...localTelegramConfig, botToken: e.target.value.trim() })}
                      className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    <span className="text-[10px] text-blue-700">Telegram'da @BotFather üzerinden 30 saniyede ücretsiz alınır.</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-950 mb-1">
                      Telegram Chat ID (Hesabınızın veya Grubunuzun ID'si)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 123456789"
                      value={localTelegramConfig.chatId || ''}
                      onChange={(e) => setLocalTelegramConfig({ ...localTelegramConfig, chatId: e.target.value.trim() })}
                      className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                    <span className="text-[10px] text-blue-700">Telegram'da @userinfobot botundan Chat ID'nizi öğrenebilirsiniz.</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isTestingTelegram || !localTelegramConfig.botToken || !localTelegramConfig.chatId}
                    onClick={handleTestTelegram}
                    className="btn-pill-outline text-xs py-2 px-4 font-bold border-blue-300 text-blue-900 hover:bg-blue-100 disabled:opacity-50"
                  >
                    {isTestingTelegram ? 'Gönderiliyor...' : 'Test Bildirimi Gönder'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...settings,
                        telegramConfig: localTelegramConfig,
                      };
                      onUpdateSettings(updated);
                      showToast('Telegram bildirim ayarları başarıyla kaydedildi!');
                    }}
                    className="btn-pill-black bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-5 font-bold shadow-md"
                  >
                    Telegram Ayarlarını Kaydet
                  </button>
                </div>
              </div>

              {/* Harici Webhook Bildirimi (Zapier / Make / Slack) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0A0A0B]">
                      Harici Sipariş Webhook'u (Make.com, Zapier, E-Posta veya CRM)
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Her yeni siparişte bu adrese anında JSON formatında sipariş verisi POST edilir.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Örn: https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxx"
                    value={localWebhookUrl}
                    onChange={(e) => setLocalWebhookUrl(e.target.value.trim())}
                    className="flex-1 bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-mono text-[#0A0A0B] focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    disabled={isTestingWebhook || !localWebhookUrl}
                    onClick={handleTestWebhook}
                    className="btn-pill-outline text-xs py-2 px-4 font-bold disabled:opacity-50"
                  >
                    {isTestingWebhook ? 'Test Ediliyor...' : 'Test İsteği Gönder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...settings,
                        notificationWebhookUrl: localWebhookUrl.trim(),
                      };
                      onUpdateSettings(updated);
                      showToast('Webhook adresi başarıyla kaydedildi!');
                    }}
                    className="btn-pill-black text-xs py-2 px-5 font-bold"
                  >
                    Webhook Kaydet
                  </button>
                </div>
              </div>
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

            {/* Tehlikeli Bölge: Fabrika Ayarlarına Dön */}
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm mt-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-rose-900">
                    Tehlikeli Bölge: Fabrika Ayarlarına Sıfırla
                  </h2>
                  <p className="text-xs text-rose-700">
                    Bu işlem tüm katalog ürünlerini, m² fiyatlarını ve ayarları sistemin orijinal ilk kurulum ayarlarına döndürür.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between flex-wrap gap-4">
                <p className="text-xs text-rose-800 max-w-lg">
                  ⚠️ Bu işlem geri alınamaz. Kendi eklediğiniz özel ürünler ve fiyat değişiklikleri silinir.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('DİKKAT: Tüm özel ürünleriniz, fiyat değişiklikleriniz ve ayarlarınız sıfırlanacaktır. Fabrika ayarlarına dönmek istediğinize emin misiniz?')) {
                      if (window.confirm('SON ONAY: Bu işlem geri alınamaz! Gerçekten sıfırlansın mı?')) {
                        onResetDefaults();
                        onUpdateSettings(INITIAL_SETTINGS);
                        showToast('Sistem ve tüm ayarlar fabrika ayarlarına sıfırlandı.');
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tüm Verileri Fabrika Ayarlarına Sıfırla</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODÜL 9: KAYITLI MÜŞTERİLER                              */}
        {/* ======================================================== */}
        {adminTab === 'customers' && (
          <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0A0A0B] flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Kayıtlı Müşteri Portföyü</span>
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Siteden kayıt olan müşteriler, kayıtlı teslimat adresleri ve sipariş geçmişi.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Müşteri adı, telefon, e-posta veya ilçe ara..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-full pl-10 pr-4 py-2 text-xs text-[#0A0A0B] placeholder-[#94A3B8] focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E8EAED] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Toplam Kayıtlı Üye</div>
                <div className="text-2xl font-extrabold text-[#0A0A0B] mt-1 font-mono">
                  {customers.length}
                </div>
              </div>

              <div className="bg-white border border-[#E8EAED] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Adres Ekleyen Müşteriler</div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                  {customers.filter(c => c.addresses && c.addresses.length > 0).length}
                </div>
              </div>

              <div className="bg-white border border-[#E8EAED] rounded-2xl p-4 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Siparişi / Talebi Bulunanlar</div>
                <div className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">
                  {customers.filter(c => leads.some(l => l.customerId === c.id || l.phone.replace(/\D/g, '') === c.phone.replace(/\D/g, ''))).length}
                </div>
              </div>
            </div>

            {/* Customer List / Table */}
            {(() => {
              const filteredCustomers = customers.filter(c => {
                if (!customerSearch.trim()) return true;
                const q = customerSearch.toLowerCase();
                return (
                  c.fullName.toLowerCase().includes(q) ||
                  c.email.toLowerCase().includes(q) ||
                  c.phone.includes(q) ||
                  (c.city && c.city.toLowerCase().includes(q)) ||
                  (c.district && c.district.toLowerCase().includes(q))
                );
              });

              if (filteredCustomers.length === 0) {
                return (
                  <div className="bg-white border border-[#E8EAED] rounded-3xl p-12 text-center text-slate-500 shadow-sm">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-sm font-bold text-slate-800">
                      {customerSearch ? 'Aramanızla eşleşen müşteri bulunamadı.' : 'Henüz kayıtlı müşteri bulunmuyor.'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Müşteriler web sitesi üst çubuğundaki "Giriş Yap / Üye Ol" butonundan kayıt olduklarında burada listelenir.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredCustomers.map(customer => {
                    const customerLeads = leads.filter(l => 
                      l.customerId === customer.id || 
                      l.phone.replace(/\D/g, '') === customer.phone.replace(/\D/g, '')
                    );
                    const totalSpend = customerLeads.reduce((sum, l) => sum + (l.totalAmount || 0), 0);

                    return (
                      <div 
                        key={customer.id} 
                        className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm hover:border-black/20 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          
                          {/* Name & Identity */}
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-display font-black text-lg shrink-0">
                              {customer.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-[#0A0A0B]">
                                  {customer.fullName}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Aktif Üye
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>Kayıt: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</span>
                                <span>•</span>
                                <span className="font-mono text-[11px] text-slate-500">ID: {customer.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Contact & Location Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={`tel:${customer.phone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200 transition"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{customer.phone}</span>
                            </a>

                            {customer.email && (
                              <a
                                href={`mailto:${customer.email}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition"
                              >
                                <span className="text-slate-400">@</span>
                                <span>{customer.email}</span>
                              </a>
                            )}

                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{customer.district ? `${customer.district}, ` : ''}{customer.city || 'Belirtilmedi'}</span>
                            </span>

                            {onDeleteCustomer && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`${customer.fullName} isimli müşteriyi silmek istediğinize emin misiniz?`)) {
                                    onDeleteCustomer(customer.id);
                                    showToast(`${customer.fullName} silindi.`);
                                  }
                                }}
                                className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Müşteri Kaydını Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer Details: Addresses & Orders */}
                        <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          
                          {/* Saved Addresses */}
                          <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <span>Kayıtlı Teslimat Adresleri ({customer.addresses?.length || 0})</span>
                              </span>
                            </div>

                            {customer.addresses && customer.addresses.length > 0 ? (
                              <div className="space-y-2">
                                {customer.addresses.map((addr) => (
                                  <div key={addr.id} className="text-xs bg-white p-2.5 rounded-xl border border-slate-200/70">
                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                      <span>{addr.title}</span>
                                      {addr.isDefault && (
                                        <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-bold">
                                          Varsayılan
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-600 text-[11px] mt-0.5">
                                      {addr.fullAddress} — {addr.district} / {addr.city}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">
                                Henüz adres tanımlanmamış.
                              </div>
                            )}
                          </div>

                          {/* Orders / Leads History */}
                          <div className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100">
                            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                                <span>Sipariş & Teklif Geçmişi ({customerLeads.length})</span>
                              </span>
                              {totalSpend > 0 && (
                                <span className="font-mono text-emerald-700 font-bold">
                                  Toplam: {totalSpend.toLocaleString('tr-TR')} ₺
                                </span>
                              )}
                            </div>

                            {customerLeads.length > 0 ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {customerLeads.map((ld) => {
                                  const isLdStore =
                                    ld.leadType === 'store_order' ||
                                    ld.leadType === 'web_order' ||
                                    ld.id.startsWith('store-order') ||
                                    ld.id.startsWith('order-');
                                  return (
                                    <div 
                                      key={ld.id} 
                                      onClick={() => setSelectedLeadDetail(ld)}
                                      className="text-xs bg-white p-2.5 rounded-xl border border-slate-200/70 hover:border-black cursor-pointer transition flex items-center justify-between"
                                    >
                                      <div>
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                          <span>{ld.orderNumber || ld.id}</span>
                                          <span className="text-[10px] font-bold text-slate-500">
                                            ({ld.items?.length || 0} Kalem)
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                          {ld.createdAt ? new Date(ld.createdAt).toLocaleDateString('tr-TR') : ''} • Durum: <strong className="text-slate-700">{getLeadStatusLabel(ld.status, isLdStore)}</strong>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold font-mono text-slate-900">
                                          {ld.totalAmount.toLocaleString('tr-TR')} ₺
                                        </div>
                                        <div className="text-[10px] text-blue-600 font-bold hover:underline">
                                          İncele →
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">
                                Henüz verilmiş bir sipariş veya keşif talebi bulunmuyor.
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}

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

              {/* Çoklu Fotoğraf Albümü Yükleme */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Ürün Fotoğraf Albümü (Çoklu Fotoğraf)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {newImages.length} Fotoğraf
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={multiFileInputRef}
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleFileUpload(e, false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => multiFileInputRef.current?.click()}
                    className="btn-pill-black text-xs py-2 px-4 flex items-center justify-center gap-1.5 shrink-0 bg-slate-900 hover:bg-black text-white"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cihazdan Fotoğraf(lar) Seç</span>
                  </button>

                  <div className="flex-1 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Veya Görsel URL'si yapıştırıp ekleyin..."
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl(false);
                        }
                      }}
                      className="flex-1 bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImageUrl(false)}
                      className="btn-pill-outline text-xs py-2 px-3 shrink-0"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Albüm Önizleme Grid */}
                {newImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                    {newImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 group shadow-sm ${
                          idx === 0 ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <img src={imgUrl} alt={`Ürün ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Kapak Rozeti */}
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            ★ Kapak
                          </div>
                        )}

                        {/* Aksiyon Butonları Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(idx, false)}
                              className="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-black hover:bg-emerald-100 transition shadow"
                            >
                              Kapak Yap
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(idx, false)}
                            className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition shadow"
                            title="Fotoğrafı Kaldır"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Henüz fotoğraf eklenmedi. Cihazınızdan tek seferde birden fazla fotoğraf seçebilir veya URL yapıştırabilirsiniz. İlk sıradaki fotoğraf vitrin kapak resmi olur.
                  </p>
                )}
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

                <div>
                  <label className="block text-xs font-bold mb-1">Paket / Kutu / Ölçü Bilgisi (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: 15 Litre Kova veya 280x60 cm Panel"
                    value={newPackageInfo}
                    onChange={(e) => setNewPackageInfo(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Kategori</label>
                  <select
                    value={editModalProduct.category}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, category: e.target.value as CategoryKey })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
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

              {/* Çoklu Fotoğraf Albümü Düzenleme */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Ürün Fotoğraf Albümü (Çoklu Galeri)</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {((editModalProduct.images && editModalProduct.images.length > 0) ? editModalProduct.images.length : (editModalProduct.image ? 1 : 0))} Fotoğraf
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={editMultiFileInputRef}
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleFileUpload(e, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editMultiFileInputRef.current?.click()}
                    className="btn-pill-black text-xs py-2 px-4 flex items-center justify-center gap-1.5 shrink-0 bg-slate-900 hover:bg-black text-white"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cihazdan Fotoğraf(lar) Ekle</span>
                  </button>

                  <div className="flex-1 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Veya Görsel URL'si yapıştırıp ekleyin..."
                      value={editUrlInput}
                      onChange={(e) => setEditUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl(true);
                        }
                      }}
                      className="flex-1 bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImageUrl(true)}
                      className="btn-pill-outline text-xs py-2 px-3 shrink-0"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Albüm Önizleme Grid */}
                {(() => {
                  const gallery = (editModalProduct.images && editModalProduct.images.length > 0)
                    ? editModalProduct.images
                    : (editModalProduct.image ? [editModalProduct.image] : []);

                  return gallery.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-1">
                      {gallery.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 group shadow-sm ${
                            idx === 0 ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <img src={imgUrl} alt={`Ürün ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Kapak Rozeti */}
                          {idx === 0 && (
                            <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              ★ Kapak
                            </div>
                          )}

                          {/* Aksiyon Butonları Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(idx, true)}
                                className="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-black hover:bg-emerald-100 transition shadow"
                              >
                                Kapak Yap
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryImage(idx, true)}
                              className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition shadow"
                              title="Fotoğrafı Kaldır"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Henüz fotoğraf eklenmedi. Cihazınızdan tek seferde birden fazla fotoğraf seçebilir veya URL yapıştırabilirsiniz.
                    </p>
                  );
                })()}
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

                <div>
                  <label className="block text-xs font-bold mb-1">Paket / Kutu / Ölçü Bilgisi (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: 15 Litre Kova veya 280x60 cm Panel"
                    value={editModalProduct.packageInfo || ''}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, packageInfo: e.target.value || undefined })}
                    className="w-full bg-[#F8F9FA] border border-[#CBD5E1] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <label className="flex items-center gap-2 cursor-pointer bg-[#F8F9FA] p-2.5 rounded-xl border border-[#CBD5E1]">
                  <input
                    type="checkbox"
                    checked={editModalProduct.inStock !== false}
                    onChange={(e) => setEditModalProduct({ ...editModalProduct, inStock: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#0A0A0B]">
                    📦 Stokta Mevcut (İşaret Kaldırılırsa "Tükendi" Yazar)
                  </span>
                </label>
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

              {/* Model / Renk Varyantları Yöneticisi */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Ürün Model & Renk Kartelası Varyantları</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {(editModalProduct.variants || []).length} Varyant
                  </span>
                </div>

                {/* Mevcut Varyantlar Listesi */}
                {(editModalProduct.variants && editModalProduct.variants.length > 0) ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {editModalProduct.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-sm"
                            style={{ backgroundColor: v.colorHex || '#CBD5E1' }}
                          />
                          <span className="font-bold text-slate-900">{v.name}</span>
                          {v.code && <span className="font-mono text-[10px] text-slate-500">({v.code})</span>}
                          {v.priceDifference && v.priceDifference !== 0 && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {v.priceDifference > 0 ? `+${v.priceDifference}` : v.priceDifference} ₺
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariantFromEditProduct(v.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Varyantı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Henüz renk/model varyantı eklenmedi. Tek bir standart model olarak satılıyor.
                  </p>
                )}

                {/* Yeni Varyant Ekleme Satırı */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Yeni Renk / Model Ekle:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Varyant Adı (Örn: Doğal Meşe)"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Kod (Opsiyonel)"
                        value={newVarCode}
                        onChange={(e) => setNewVarCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <input
                        type="color"
                        value={newVarColor}
                        onChange={(e) => setNewVarColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 shrink-0"
                        title="Renk Seç"
                      />
                      <span className="text-[10px] font-mono text-slate-500">{newVarColor}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        placeholder="± Fiyat Farkı"
                        value={newVarPriceDiff || ''}
                        onChange={(e) => setNewVarPriceDiff(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddVariantToEditProduct}
                        className="w-full bg-slate-900 hover:bg-black text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center shadow-sm"
                        title="Varyantı Kaydet"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Akıllı Metraj & Paket Fire Kuralı (Coverage Rule) */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0A0A0B] flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span>Akıllı Metraj & Kutu / Fire Hesaplayıcı Kuralı</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editModalProduct.coverageRule}
                      onChange={(e) => {
                        if (!editModalProduct) return;
                        if (e.target.checked) {
                          setEditModalProduct({
                            ...editModalProduct,
                            coverageRule: {
                              coveragePerUnit: editModalProduct.unit === 'kova' ? 130 : 1.83,
                              unitLabel: 'm²',
                              defaultWastePercent: 7,
                              calculationType: 'area',
                            },
                          });
                        } else {
                          setEditModalProduct({
                            ...editModalProduct,
                            coverageRule: undefined,
                          });
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4"
                    />
                    <span className="text-[11px] font-bold text-blue-950">Aktif</span>
                  </label>
                </div>

                {editModalProduct.coverageRule ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        1 {editModalProduct.unit || 'paket'} Kapsamı:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editModalProduct.coverageRule.coveragePerUnit}
                        onChange={(e) => {
                          if (!editModalProduct || !editModalProduct.coverageRule) return;
                          setEditModalProduct({
                            ...editModalProduct,
                            coverageRule: {
                              ...editModalProduct.coverageRule,
                              coveragePerUnit: Number(e.target.value) || 1,
                            },
                          });
                        }}
                        className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-500">Örn: Parkede 1.83, Boyada 130 m²</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Standart Fire Payı (%):
                      </label>
                      <input
                        type="number"
                        value={editModalProduct.coverageRule.defaultWastePercent}
                        onChange={(e) => {
                          if (!editModalProduct || !editModalProduct.coverageRule) return;
                          setEditModalProduct({
                            ...editModalProduct,
                            coverageRule: {
                              ...editModalProduct.coverageRule,
                              defaultWastePercent: Number(e.target.value) || 0,
                            },
                          });
                        }}
                        className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-500">Örn: Parkede %7, Boyada %5</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Hesap Tipi:
                      </label>
                      <select
                        value={editModalProduct.coverageRule.calculationType}
                        onChange={(e) => {
                          if (!editModalProduct || !editModalProduct.coverageRule) return;
                          setEditModalProduct({
                            ...editModalProduct,
                            coverageRule: {
                              ...editModalProduct.coverageRule,
                              calculationType: e.target.value as any,
                            },
                          });
                        }}
                        className="w-full bg-white border border-blue-300 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                      >
                        <option value="area">m² Alan Hesabı</option>
                        <option value="length">Metre Uzunluk Hesabı</option>
                        <option value="set">Hazır Set / Kit Hesabı</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Bu ürün için akıllı metraj hesaplayıcı kapalı. "Aktif" kutusunu işaretleyerek müşterilerin oda ölçüsü girip kutu adedi hesaplamasını sağlayabilirsiniz.
                  </p>
                )}
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
      {selectedLeadDetail && (() => {
        const isDetailStoreOrder =
          selectedLeadDetail.leadType === 'store_order' ||
          selectedLeadDetail.leadType === 'web_order' ||
          selectedLeadDetail.id.startsWith('store-order') ||
          selectedLeadDetail.id.startsWith('order-');
        const normalizedDetailStatus = normalizeLeadStatus(selectedLeadDetail.status);
        const paymentAndShippingText =
          selectedLeadDetail.paymentSummary ||
          (selectedLeadDetail.paymentMethod
            ? `${
                selectedLeadDetail.paymentMethod === 'bank_transfer'
                  ? 'Banka Havalesi / EFT'
                  : selectedLeadDetail.paymentMethod === 'cash_on_delivery'
                  ? 'Kapıda / Ambar Tesliminde Ödeme'
                  : 'Kredi Kartı (3D Secure)'
              }${
                selectedLeadDetail.shippingCost !== undefined
                  ? ` | Kargo: ${selectedLeadDetail.shippingCost > 0 ? `${selectedLeadDetail.shippingCost} ₺` : 'Ücretsiz'}`
                  : ''
              }`
            : '');

        return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedLeadDetail(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-[#0A0A0B] z-10 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedLeadDetail(null)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-display font-extrabold mb-1">
              {isDetailStoreOrder ? 'Online Sipariş Detayı' : 'Müşteri Talep Detayı'}
            </h3>
            <div className="text-xs text-[#64748B] mb-4">
              Kayıt / Sipariş No: <span className="font-mono font-bold text-black">{selectedLeadDetail.orderNumber || selectedLeadDetail.id}</span>
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
              {selectedLeadDetail.address && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] shrink-0">Açık Adres / Not:</span>
                  <span className="font-semibold text-black text-right">{selectedLeadDetail.address}</span>
                </div>
              )}
              {paymentAndShippingText && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B] shrink-0">Ödeme & Kargo:</span>
                  <span className="font-semibold text-emerald-800 text-right">{paymentAndShippingText}</span>
                </div>
              )}
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
                <span className="text-[#64748B] font-bold">Toplam Tutar:</span>
                <strong className="text-base font-black font-mono text-black">{selectedLeadDetail.totalAmount.toLocaleString('tr-TR')} ₺</strong>
              </div>
            </div>

            {/* Sipariş Durumu & Müşteri Bilgilendirme / Kargo Takip Notu Güncelleme */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-extrabold text-emerald-950">
                  {isDetailStoreOrder ? 'Sipariş Durumu & Kargo Takip Notu' : 'Keşif Durumu & Müşteri Takip Notu'}
                </label>
                <select
                  value={normalizedDetailStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as LeadRequest['status'];
                    setSelectedLeadDetail({ ...selectedLeadDetail, status: nextStatus });
                  }}
                  className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0A0A0B]"
                >
                  {isDetailStoreOrder ? (
                    <>
                      <option value="bekliyor">🟡 Sipariş Alındı (Bekliyor)</option>
                      <option value="arandi">🔵 Onaylandı & Hazırlanıyor</option>
                      <option value="kesif_verildi">🟣 Kargoya Verildi / Sevkiyatta</option>
                      <option value="sozlesme_imzalandi">🟢 Teslim Edildi</option>
                    </>
                  ) : (
                    <>
                      <option value="bekliyor">🟡 Yeni Talep (Bekliyor)</option>
                      <option value="arandi">🔵 Mimar Aradı / İncelendi</option>
                      <option value="kesif_verildi">🟣 Keşif & Usta Planlandı</option>
                      <option value="sozlesme_imzalandi">🟢 Sözleşme İmzalandı</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Örn: Yurtiçi Kargo Takip: 908123456 veya Ustamız Cuma 10:30'da adresinizde olacak"
                  value={selectedLeadDetail.adminNotes || ''}
                  onChange={(e) =>
                    setSelectedLeadDetail({ ...selectedLeadDetail, adminNotes: e.target.value })
                  }
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-xs text-[#0A0A0B] focus:outline-none focus:border-emerald-700"
                />
                <p className="text-[10px] text-emerald-800 mt-1">
                  * Buraya yazdığınız not, müşteriniz <strong>"Siparişlerim"</strong> ve <strong>"Sipariş / Keşif Sorgula"</strong> ekranından baktığında canlı olarak gösterilir.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateLeadStatus(
                      selectedLeadDetail.id,
                      normalizeLeadStatus(selectedLeadDetail.status),
                      selectedLeadDetail.adminNotes || ''
                    );
                    showToast('Sipariş durumu ve müşteri takip notu güncellendi.');
                  }}
                  className="btn-pill-black bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2 px-4 font-bold"
                >
                  Durumu & Takip Notunu Kaydet
                </button>
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
                      {it.variantName && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                          Seçilen Renk/Model: {it.variantName}
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
        );
      })()}

    </div>
  );
};
