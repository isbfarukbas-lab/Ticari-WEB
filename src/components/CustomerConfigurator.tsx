import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Check, 
  Eye, 
  ArrowRight, 
  ArrowLeft,
  Upload, 
  Camera, 
  Trash2, 
  ShieldCheck, 
  TrendingDown,
  ShoppingBag,
  Send,
  Calendar,
  FileText,
  RotateCcw,
  Palette,
  Wrench,
  Compass,
  Sparkles,
  HelpCircle,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import { CategoryInfo, CategoryKey, Product, CartItem, CustomRequestItem, SiteSettings } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface CustomerConfiguratorProps {
  categories: CategoryInfo[];
  products: Product[];
  cart: CartItem[];
  settings?: SiteSettings;
  onAddToCart: (product: Product, quantity: number, roomType: string) => void;
  onSetCategoryItem?: (category: CategoryKey, product: Product, quantity: number, roomType: string) => void;
  onAddCustomRequest: (custom: CustomRequestItem) => void;
  onOpenCart: () => void;
  onOpenInspection?: () => void;
  onOpenProforma?: () => void;
  onOpenCallback?: () => void;
  activeRoom: string;
  setActiveRoom: (room: string) => void;
  defaultSqM: number;
  setDefaultSqM: (sqm: number) => void;
  phoneNumber?: string;
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (district: string) => void;
  onNavigateStore?: () => void;
}

export const TURKEY_SERVICE_AREAS = [
  {
    city: 'İstanbul',
    districts: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Ataşehir', 'Bakırköy', 'Sarıyer', 'Şişli', 'Maltepe', 'Kartal', 'Beylikdüzü', 'Pendik', 'Tüm İstanbul'],
  },
  {
    city: 'Ankara',
    districts: ['Çankaya', 'Yenimahalle', 'Etimesgut', 'Keçiören', 'Gölbaşı', 'Tüm Ankara'],
  },
  {
    city: 'İzmir',
    districts: ['Karşıyaka', 'Bornova', 'Konak', 'Urla', 'Çeşme', 'Bayraklı', 'Tüm İzmir'],
  },
  {
    city: 'Bursa',
    districts: ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya'],
  },
  {
    city: 'Kocaeli',
    districts: ['İzmit', 'Gebze', 'Kartepe', 'Başiskele'],
  },
];

const ROOM_PRESETS = [
  { name: '2+1 Komple Ev', sqM: 85 },
  { name: '3+1 Komple Ev', sqM: 120 },
  { name: '1+1 Daire', sqM: 55 },
  { name: 'Sadece Salon', sqM: 30 },
  { name: 'Sadece Mutfak', sqM: 15 },
  { name: 'Sadece Banyo', sqM: 8 },
];

const STEPS = [
  { step: 1, title: 'Kapsam & Daire', subtitle: 'Daire ve İşlemler' },
  { step: 2, title: 'Sırayla Malzeme', subtitle: 'Kalem Kalem Seçim' },
  { step: 3, title: 'Varsa Özel İstek', subtitle: 'Fotoğraf & Notlar' },
  { step: 4, title: 'Teklif & Keşif', subtitle: 'Şeffaf Özet & Onay' },
];

export const CustomerConfigurator: React.FC<CustomerConfiguratorProps> = ({
  categories,
  products,
  cart,
  settings,
  onAddToCart,
  onSetCategoryItem,
  onAddCustomRequest,
  onOpenCart,
  onOpenInspection,
  onOpenProforma,
  onOpenCallback,
  activeRoom,
  setActiveRoom,
  defaultSqM,
  setDefaultSqM,
  phoneNumber = '905550000000',
  selectedCity = 'İstanbul',
  setSelectedCity,
  selectedDistrict = 'Kadıköy',
  setSelectedDistrict,
  onNavigateStore,
}) => {
  // Wizard Sequential Step State (1: Kapsam, 2: Malzeme/İşçilik, 3: Özel İstek, 4: Özet/Keşif)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [city, setCity] = useState(selectedCity);
  const [district, setDistrict] = useState(selectedDistrict);

  // Tahmini Teslimat Süresi Hesaplayıcı
  const calculateEstimatedDays = () => {
    const activeKeys = Object.entries(selectedServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key as CategoryKey);

    if (activeKeys.length === 0) return { min: 2, max: 4 };

    // Yönetici panelinde özel süre kuralları varsa onları kullan
    if (settings?.durationRules?.baseDays) {
      const activeDays = activeKeys
        .map((k) => settings.durationRules.baseDays[k])
        .filter((d): d is number => typeof d === 'number');

      if (activeDays.length > 0) {
        let baseMin = Math.max(...activeDays);
        let baseMax = Math.round(baseMin * 1.4);

        // Birden fazla alan seçilmişse paralel ve ardışık iş akışı payı
        if (activeDays.length > 1) {
          baseMin = Math.min(30, Math.round(baseMin * 1.3));
          baseMax = Math.min(45, Math.round(baseMax * 1.35));
        }

        if (defaultSqM > settings.durationRules.sqmThreshold) {
          baseMin += 2;
          baseMax += 3;
        }

        return { min: Math.max(1, baseMin), max: Math.max(2, baseMax) };
      }
    }

    let baseMin = 2;
    let baseMax = 3;

    const hasBoya = activeKeys.includes('boya');
    const hasParke = activeKeys.includes('parke');
    const hasSeramik = activeKeys.includes('seramik');
    const hasAlci = activeKeys.includes('alci_tavan');
    const hasMutfak = activeKeys.includes('mutfak_banyo');

    if (hasBoya && hasParke && (hasSeramik || hasMutfak)) {
      baseMin = 10;
      baseMax = 14;
    } else if (hasBoya && hasParke) {
      baseMin = 4;
      baseMax = 6;
    } else if (hasSeramik) {
      baseMin = 5;
      baseMax = 8;
    } else if (hasMutfak) {
      baseMin = 7;
      baseMax = 10;
    } else if (hasAlci) {
      baseMin = 3;
      baseMax = 5;
    } else {
      baseMin = 2;
      baseMax = 4;
    }

    if (defaultSqM > 120) {
      baseMin += 2;
      baseMax += 3;
    } else if (defaultSqM > 90) {
      baseMin += 1;
      baseMax += 1;
    }

    return { min: baseMin, max: baseMax };
  };

  // Step 1: Selected Services Checklist
  const [propertyCondition, setPropertyCondition] = useState<'empty' | 'furnished'>('empty');
  const [selectedServices, setSelectedServices] = useState<Record<CategoryKey, boolean>>({
    boya: true,
    parke: true,
    seramik: false,
    elektrik: false,
    alci_tavan: false,
    mutfak_banyo: false,
    ozel: false,
  });

  // Step 2: Sequential Category Tracking
  // Müşteri seçtiği kategorileri sırayla (0, 1, 2...) teker teker belirler
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  // Her kategori için seçilen mod: 'catalog' | 'labor_only' | 'on_site'
  const [categoryModes, setCategoryModes] = useState<Record<CategoryKey, 'catalog' | 'labor_only' | 'on_site'>>({
    boya: 'catalog',
    parke: 'catalog',
    seramik: 'catalog',
    elektrik: 'catalog',
    alci_tavan: 'catalog',
    mutfak_banyo: 'catalog',
    ozel: 'catalog',
  });

  // Keşifte canlı seçim veya özel notlar
  const [categoryNotes, setCategoryNotes] = useState<Record<CategoryKey, string>>({
    boya: '',
    parke: '',
    seramik: '',
    elektrik: '',
    alci_tavan: '',
    mutfak_banyo: '',
    ozel: '',
  });

  // Filtreler & Durumlar
  const [selectedBrand, setSelectedBrand] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeRoomViewId, setActiveRoomViewId] = useState<string | null>(null);
  const [transitionToast, setTransitionToast] = useState<string | null>(null);

  // Step 3: Custom Request Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [customRoom, setCustomRoom] = useState('Salon');
  const [customPhoto, setCustomPhoto] = useState<string>('');
  const [customAddedToast, setCustomAddedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setTransitionToast(msg);
    setTimeout(() => setTransitionToast(null), 3500);
  };

  const scrollToTop = () => {
    const el = document.getElementById('katalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToStep = (step: number) => {
    if (step === 2) {
      setActiveCategoryIndex(0);
    }
    setCurrentStep(step);
    scrollToTop();
  };

  // Toggle service selection in Step 1
  const toggleService = (key: CategoryKey) => {
    setSelectedServices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Step 1'de işaretlenen kategoriler listesi
  const enabledCategories = categories.filter((c) => selectedServices[c.key]);

  // Aktif olarak ayarlanmakta olan kategori
  const safeIndex = Math.min(activeCategoryIndex, Math.max(0, enabledCategories.length - 1));
  const currentCategory = enabledCategories[safeIndex] || enabledCategories[0];

  // Helper: Suggested Qty based on defaultSqM
  const getSuggestedQtyForCategory = (catKey: CategoryKey) => {
    if (quantities[catKey] !== undefined) return quantities[catKey];
    if (catKey === 'boya') return Math.round(defaultSqM * 2.5);
    if (catKey === 'parke') return Math.round(defaultSqM * 0.85);
    if (catKey === 'seramik') return 20;
    if (catKey === 'elektrik') return 4;
    if (catKey === 'alci_tavan') return Math.round(defaultSqM * 0.4);
    if (catKey === 'mutfak_banyo') return 1;
    return 1;
  };

  const handleQtyChange = (key: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, val),
    }));
  };

  // "Elimde Malzeme Var" için sanal ürün oluşturucu
  const getLaborOnlyProduct = (catKey: CategoryKey): Product => {
    const catInfo = categories.find((c) => c.key === catKey);
    const label = catInfo?.label || catKey;
    const unit = catInfo?.unit || 'm²';

    let laborPrice = 105;
    let marketPrice = 180;
    let desc = 'Müşterinin temin ettiği malzemenin usta kadromuz tarafından anahtar teslim uygulanması.';
    let image = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80';

    if (settings?.laborRates && settings.laborRates[catKey]) {
      laborPrice = settings.laborRates[catKey].laborPrice;
      marketPrice = settings.laborRates[catKey].marketPrice;
      desc = settings.laborRates[catKey].description;
    } else {
      if (catKey === 'boya') {
        laborPrice = 105;
        marketPrice = 175;
        desc = 'Astar, 2 kat profesyonel boya, çatlak ve macun tamiratı, zımpara, maskeleme ve temiz teslim dahil.';
      } else if (catKey === 'parke') {
        laborPrice = 120;
        marketPrice = 190;
        desc = 'Laminat parke usta döşemesi, kapron şilte serimi, 8cm süpürgelik montajı ve geçiş profilleri dahil.';
      } else if (catKey === 'seramik') {
        laborPrice = 380;
        marketPrice = 550;
        desc = 'Eski kaplama kırım ve hafriyat atımı, su yalıtımı, yapıştırıcı harç, profesyonel döşeme ve derz dolgu dahil.';
      } else if (catKey === 'elektrik') {
        laborPrice = 250;
        marketPrice = 380;
        desc = 'Armatür montajı, anahtar-priz hatlarının yenilenmesi, sigorta kutusu bağlantıları ve güvenlik testi.';
      } else if (catKey === 'alci_tavan') {
        laborPrice = 220;
        marketPrice = 340;
        desc = 'Tavan karkas montajı, alçıpan kaplama, saten alçı çekimi ve pürüzsüz zımpara işçiliği.';
      } else if (catKey === 'mutfak_banyo') {
        laborPrice = 4500;
        marketPrice = 7000;
        desc = 'Müşteri tarafından temin edilen dolap, tezgah veya vitrifiye ürünlerinin uzman montajı.';
      }
    }

    if (catKey === 'boya') {
      image = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'parke') {
      image = 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'seramik') {
      image = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'elektrik') {
      image = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'alci_tavan') {
      image = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'mutfak_banyo') {
      image = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80';
    }

    return {
      id: `labor-${catKey}`,
      category: catKey,
      brand: 'Müşteri Malzemesi',
      name: `${label} (Yalnızca Usta & İşçilik)`,
      code: `ISC-${catKey.toUpperCase()}`,
      image,
      description: desc,
      unit: unit as any,
      materialPrice: 0, // Malzeme 0 ₺
      workmanshipPrice: laborPrice,
      marketPrice,
      isActive: true,
    };
  };

  // "Keşifte Canlı Kartela / Özel Ürün" için ürün oluşturucu
  const getOnSiteProduct = (catKey: CategoryKey, note?: string): Product => {
    const catInfo = categories.find((c) => c.key === catKey);
    const label = catInfo?.label || catKey;
    const unit = catInfo?.unit || 'm²';

    let baseMat = 85;
    let baseLabor = 105;
    let marketPrice = 250;
    let image = 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=700&q=80';

    if (catKey === 'boya') {
      baseMat = 85;
      baseLabor = 105;
      marketPrice = 250;
      image = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'parke') {
      baseMat = 380;
      baseLabor = 120;
      marketPrice = 650;
      image = 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'seramik') {
      baseMat = 420;
      baseLabor = 380;
      marketPrice = 1100;
      image = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=700&q=80';
    } else if (catKey === 'elektrik') {
      baseMat = 150;
      baseLabor = 250;
      marketPrice = 550;
    } else if (catKey === 'alci_tavan') {
      baseMat = 280;
      baseLabor = 220;
      marketPrice = 700;
    } else if (catKey === 'mutfak_banyo') {
      baseMat = 8500;
      baseLabor = 4500;
      marketPrice = 18000;
    }

    const noteDesc = note?.trim() ? ` Müşteri Talebi: "${note.trim()}".` : '';

    return {
      id: `onsite-${catKey}`,
      category: catKey,
      brand: 'Özel / Keşifte Canlı Seçim',
      name: `${label} — Keşifte Canlı Karteladan Belirlenecek`,
      code: `KSF-${catKey.toUpperCase()}`,
      image,
      description: `Mimarımız ücretsiz lazer keşifte geniş fiziki kartelalarla adresinize gelir; evinizin ışığında seçim yaparsınız.${noteDesc}`,
      unit: unit as any,
      materialPrice: baseMat,
      workmanshipPrice: baseLabor,
      marketPrice,
      isActive: true,
    };
  };

  // Save selection and advance to NEXT category or Step 3!
  const commitCategoryAndAdvance = (product: Product, qty: number, modeName: string) => {
    if (onSetCategoryItem) {
      onSetCategoryItem(product.category, product, qty, activeRoom);
    } else {
      onAddToCart(product, qty, activeRoom);
    }

    // Check if there is a next category in Step 2
    if (activeCategoryIndex < enabledCategories.length - 1) {
      const nextCategory = enabledCategories[activeCategoryIndex + 1];
      showToast(`✓ ${product.name} kaydedildi. Şimdi ${nextCategory.label} seçimine geçiliyor.`);
      setActiveCategoryIndex((prev) => prev + 1);
      setSelectedBrand('Tümü');
      setSearchQuery('');
      scrollToTop();
    } else {
      // Last category finished -> Proceed to Step 3 (Özel İstek)
      showToast(`✓ Tüm kalemler belirlendi! Varsa özel isteklerinizi ekleyebilirsiniz.`);
      setCurrentStep(3);
      scrollToTop();
    }
  };

  // Current category products
  const currentCategoryProducts = products.filter(
    (p) => currentCategory && p.category === currentCategory.key && p.isActive !== false
  );

  const availableBrands = [
    'Tümü',
    ...Array.from(new Set(currentCategoryProducts.map((p) => p.brand))),
  ];

  const filteredProducts = currentCategoryProducts.filter((p) => {
    const matchBrand = selectedBrand === 'Tümü' || p.brand === selectedBrand;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBrand && matchSearch;
  });

  // Current selected item in cart for active category
  const currentCartItem = cart.find(
    (c) => !c.isCustom && currentCategory && c.product?.category === currentCategory.key
  );

  // Custom photo upload in Step 3
  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Fotoğraf boyutu 3MB üzerinde olamaz.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCustomPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim() && !customPhoto) {
      alert('Lütfen bir not yazın veya örnek fotoğraf yükleyin.');
      return;
    }

    const customItem: CustomRequestItem = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim() || 'Özel İstek / İlave Kalem',
      description: customNote.trim() || 'Müşteri özel fotoğraf ve detay iletti.',
      roomType: customRoom,
      photoDataUrl: customPhoto || undefined,
    };

    onAddCustomRequest(customItem);
    setCustomTitle('');
    setCustomNote('');
    setCustomPhoto('');
    setCustomAddedToast(true);
    setTimeout(() => setCustomAddedToast(false), 2500);
  };

  // Financial calculations for Step 4
  const totalMaterial = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    return sum + item.product.materialPrice * item.quantity;
  }, 0);

  const totalLabor = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    if (item.purchaseType === 'material_only') return sum;
    return sum + item.product.workmanshipPrice * item.quantity;
  }, 0);

  const grandTotal = totalMaterial + totalLabor;

  const marketTotal = cart.reduce((sum, item) => {
    if (item.isCustom || !item.product) return sum;
    const base = item.purchaseType === 'material_only'
      ? item.product.materialPrice
      : item.product.materialPrice + item.product.workmanshipPrice;
    const market = item.product.marketPrice || Math.round(base * 1.35);
    return sum + market * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, marketTotal - grandTotal);

  // WhatsApp formatted proposal message
  const handleWhatsApp = () => {
    if (cart.length === 0) {
      alert('Lütfen önce sepetinize en az bir ürün veya işlem ekleyin.');
      return;
    }

    let msg = `*RESTOLAB® — Şeffaf Tadilat Teklifi Talebi*\n`;
    msg += `📍 *Lokasyon:* ${city} / ${district}\n`;
    msg += `📐 *Daire Bilgisi:* ${activeRoom} (${defaultSqM} m²)\n`;
    msg += `🏠 *Daire Durumu:* ${propertyCondition === 'empty' ? 'Boş Daire (Hemen Başlanabilir)' : 'Eşyalı Daire (Eşya Maskeleme & Koruma Dahil)'}\n\n`;

    const standardItems = cart.filter((c) => !c.isCustom && c.product);
    if (standardItems.length > 0) {
      msg += `📋 *SEÇİLEN MALZEME VE İŞÇİLİK KALEMLERİ:*\n`;
      standardItems.forEach((c, idx) => {
        if (!c.product) return;
        const line = (c.product.materialPrice + c.product.workmanshipPrice) * c.quantity;
        const isLaborOnly = c.product.id.startsWith('labor-');
        const isOnSite = c.product.id.startsWith('onsite-');

        if (isLaborOnly) {
          msg += `${idx + 1}. *${c.product.name}*\n`;
          msg += `   • Durum: [Elimde Malzeme Var — Yalnızca Usta İşçiliği]\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit} (${c.roomType})\n`;
          msg += `   • Tutar: ${line.toLocaleString('tr-TR')} ₺ (Malzeme: 0 ₺ | İşçilik Dahil)\n\n`;
        } else if (isOnSite) {
          msg += `${idx + 1}. *${c.product.name}*\n`;
          msg += `   • Durum: [Model Keşifte Canlı Karteladan Belirlenecek]\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit} (${c.roomType})\n`;
          msg += `   • Tahmini Bütçe: ${line.toLocaleString('tr-TR')} ₺\n\n`;
        } else {
          msg += `${idx + 1}. *${c.product.brand} - ${c.product.name}*\n`;
          msg += `   • Miktar: ${c.quantity} ${c.product.unit} (${c.roomType})\n`;
          msg += `   • Kod: ${c.product.code}\n`;
          msg += `   • Tutar: ${line.toLocaleString('tr-TR')} ₺ (Malzeme + Uygulama Dahil)\n\n`;
        }
      });
    }

    const customItems = cart.filter((c) => c.isCustom && c.customData);
    if (customItems.length > 0) {
      msg += `📷 *ÖZEL İSTEKLER VE MÜŞTERİ NOTLARI:*\n`;
      customItems.forEach((c, idx) => {
        if (!c.customData) return;
        msg += `${idx + 1}. *${c.customData.title}* (${c.customData.roomType})\n`;
        msg += `   • Not: "${c.customData.description}"\n`;
        if (c.customData.photoDataUrl) {
          msg += `   • [Özel Tasarım / Hasar Fotoğrafı Eklendi]\n`;
        }
        msg += `\n`;
      });
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *RESTOLAB ANAHTAR TESLİM TUTAR:* ${grandTotal.toLocaleString('tr-TR')} ₺\n`;
    if (totalSavings > 0) {
      msg += `✨ *Tahmini Piyasa Tasarrufu:* ${totalSavings.toLocaleString('tr-TR')} ₺\n`;
    }
    msg += `🛡️ *Güvence:* Kademeli Hakediş Ödeme Modeli & Sözleşmeli Sabit Bütçe\n\n`;
    msg += `Bu seçimlerime istinaden yerinde ücretsiz lazer keşif ve sözleşme detayları için görüşmek istiyorum.`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;

  return (
    <section id="katalog" className="py-8 scroll-mt-20">

      {/* Transition Toast Notification */}
      {transitionToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#0A0A0B] text-white px-5 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-bounce border border-white/20">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{transitionToast}</span>
        </div>
      )}

      {/* Quick Bridge to Material Store */}
      {onNavigateStore && currentStep === 1 && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm shadow-sm">
              📦
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">Usta İstemiyor, Sadece Malzeme mi Almak İstiyorsunuz?</h4>
              <p className="text-[11px] text-amber-800 mt-0.5">Akustik panel, çıta, boya ve batarya modellerimizi toptan bayi fiyatıyla kargo ile doğrudan satın alabilirsiniz.</p>
            </div>
          </div>
          <button
            onClick={onNavigateStore}
            className="btn-pill-black text-[11px] py-1.5 px-3.5 whitespace-nowrap shrink-0"
          >
            <span>Ürün Mağazasına Git</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* İNTERAKTİF ADIM ÇUBUĞU (STEPPER)                           */}
      {/* ======================================================== */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {STEPS.map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => goToStep(s.step)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? 'bg-[#0A0A0B] text-white border-[#0A0A0B] shadow-md ring-2 ring-black/10'
                    : isCompleted
                    ? 'bg-white border-[#CBD5E1] text-[#0A0A0B] hover:border-[#0A0A0B]'
                    : 'bg-[#F8F9FA] border-[#E8EAED] text-[#94A3B8] hover:text-[#4B5563]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isActive
                      ? 'bg-white text-[#0A0A0B]'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-white border border-[#CBD5E1] text-[#94A3B8]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#0A0A0B]'}`}>
                    {s.title}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-[#64748B]'}`}>
                    {s.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADIM 1: EVİNİZDE HANGİ İŞLEMLER YAPILACAK? (KAPSAM)      */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-10 shadow-sm animate-in fade-in duration-300">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0B] text-white text-[11px] font-bold mb-2">
                <span>ADIM 1 / 4</span>
                <span>•</span>
                <span>DAİRE & KAPSAM BELİRLEME</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0A0A0B]">
                Evinizi Tanıtın ve Yapılacak İşlemleri Seçin
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
                Daire büyüklüğünüzü belirleyin ve yenilemek istediğiniz alanları işaretleyin. Seçtiğiniz alanlar sıradaki adımda <strong>tek tek ve sırayla</strong> karşınıza gelecek.
              </p>
            </div>

            {/* Daire Alanı Girişi */}
            <div className="flex items-center gap-2.5 self-start md:self-auto bg-[#F8F9FA] border border-[#E2E4E8] px-4 py-2.5 rounded-2xl shrink-0">
              <span className="text-xs font-bold text-[#4B5563]">Daire Alanı:</span>
              <input
                type="number"
                min={5}
                max={1000}
                value={defaultSqM}
                onChange={(e) => setDefaultSqM(Math.max(5, Number(e.target.value)))}
                className="w-20 bg-white border border-[#D1D5DB] rounded-xl px-2.5 py-1 text-sm font-extrabold text-center text-[#0A0A0B] focus:outline-none focus:border-[#0A0A0B]"
              />
              <span className="text-xs font-bold text-[#64748B]">m²</span>
            </div>
          </div>

          {/* Hızlı Daire Tipi Şablonu */}
          <div className="mb-6">
            <span className="text-xs font-bold text-[#0A0A0B] block mb-2.5">
              Hızlı Daire Tipi Şablonu:
            </span>
            <div className="flex flex-wrap gap-2 pb-2">
              {ROOM_PRESETS.map((room) => {
                const isSelected = activeRoom === room.name;
                return (
                  <button
                    key={room.name}
                    type="button"
                    onClick={() => {
                      setActiveRoom(room.name);
                      setDefaultSqM(room.sqM);
                    }}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#0A0A0B] text-white shadow-sm'
                        : 'bg-[#F1F3F5] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#0A0A0B]'
                    }`}
                  >
                    <span>{room.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      ({room.sqM} m²)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daire Durumu Seçimi (Boş / Eşyalı) */}
          <div className="mb-6">
            <span className="text-xs font-bold text-[#0A0A0B] block mb-2.5">
              Dairenin Mevcut Durumu:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <button
                type="button"
                onClick={() => setPropertyCondition('empty')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  propertyCondition === 'empty'
                    ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-sm'
                    : 'border-[#E2E4E8] bg-white text-[#4B5563] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>🏠</span> Boş Daire
                  </span>
                  {propertyCondition === 'empty' && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-semibold">Seçili</span>
                  )}
                </div>
                <p className={`text-[11px] leading-relaxed ${propertyCondition === 'empty' ? 'text-slate-300' : 'text-slate-500'}`}>
                  İçinde eşya yok, malzeme teslimi ve usta çalışması için hemen uygun.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPropertyCondition('furnished')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  propertyCondition === 'furnished'
                    ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-sm'
                    : 'border-[#E2E4E8] bg-white text-[#4B5563] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>🛋️</span> Eşyalı Daire
                  </span>
                  {propertyCondition === 'furnished' && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-semibold">Seçili</span>
                  )}
                </div>
                <p className={`text-[11px] leading-relaxed ${propertyCondition === 'furnished' ? 'text-slate-300' : 'text-slate-500'}`}>
                  İçinde eşya bulunuyor; eşya toplama, koruyucu zemin naylonu ve maskeleme dahil.
                </p>
              </button>
            </div>
          </div>

          {/* Mimari Metraj Açıklaması */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E4E8] flex items-start gap-3 text-xs text-[#4B5563] mb-8">
            <span className="text-lg leading-none mt-0.5">💡</span>
            <div>
              <strong className="text-[#0A0A0B] block mb-0.5 text-xs font-bold">
                Mimari Yüzey & Metraj Hesabı:
              </strong>
              <span className="leading-relaxed">
                <strong>{defaultSqM} m²</strong> taban alanına sahip bir evin 4 cephe duvarı ve tavanı ortalama <strong>~{Math.round(defaultSqM * 2.5)} m²</strong> boya yüzeyi tutar. Zemin net parke alanı ise <strong>~{Math.round(defaultSqM * 0.85)} m²</strong> hesaplanır. Kesin metrajlar ücretsiz lazer keşifte santimine kadar netleştirilir.
              </span>
            </div>
          </div>

          {/* İl & İlçe Hizmet Lokasyonu */}
          {(() => {
            const activeServiceAreas = (settings?.serviceAreas && settings.serviceAreas.length > 0)
              ? settings.serviceAreas
              : TURKEY_SERVICE_AREAS;
            const currentArea = activeServiceAreas.find((a) => a.city === city) || activeServiceAreas[0];

            return (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F8F9FA] border border-[#E2E4E8] p-4 rounded-2xl mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0B] shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Hizmet Lokasyonu:</span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap flex-1">
                  <select
                    value={city}
                    onChange={(e) => {
                      const c = e.target.value;
                      setCity(c);
                      setSelectedCity?.(c);
                      const area = activeServiceAreas.find((a) => a.city === c);
                      if (area && area.districts.length > 0) {
                        setDistrict(area.districts[0]);
                        setSelectedDistrict?.(area.districts[0]);
                      }
                    }}
                    className="bg-white border border-[#D1D5DB] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none focus:border-black"
                  >
                    {activeServiceAreas.map((a) => (
                      <option key={a.city} value={a.city}>{a.city}</option>
                    ))}
                  </select>

                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setSelectedDistrict?.(e.target.value);
                    }}
                    className="bg-white border border-[#D1D5DB] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0A0A0B] focus:outline-none focus:border-black"
                  >
                    {currentArea?.districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <span className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
                    ✓ {settings?.coverageNotice || `${city} genelinde mimari lazer keşif servisimiz aktiftir.`}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Multi-select Service Checkboxes */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider">
                Yenilenecek Alanları İşaretleyin:
              </span>
              <span className="text-xs font-semibold text-[#64748B]">
                {selectedCount} alan seçildi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {categories.map((cat) => {
                const isChecked = selectedServices[cat.key];
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleService(cat.key)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between min-h-[110px] ${
                      isChecked
                        ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-md'
                        : 'border-[#E2E4E8] bg-[#FBFBFC] text-[#4B5563] hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <span className="text-xs font-bold leading-tight">{cat.label}</span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-xs ml-1 ${
                          isChecked ? 'bg-white text-black' : 'border border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold ${isChecked ? 'text-emerald-400' : 'text-[#94A3B8]'}`}>
                      {isChecked ? '✓ Seçildi' : '+ Dahil Et'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1 Bottom Action */}
          <div className="pt-6 border-t border-[#F1F3F5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#64748B]">
              {selectedCount === 0 ? (
                <span className="text-amber-600 font-semibold">
                  ⚠️ Lütfen devam etmek için en az bir işlem seçin.
                </span>
              ) : (
                <span>
                  Sıradaki adımda seçtiğiniz <strong>{selectedCount} işlem</strong> için sırayla malzeme/işçilik tercihinizi belirleyeceksiniz.
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => {
                setActiveCategoryIndex(0);
                setCurrentStep(2);
                scrollToTop();
              }}
              className="btn-pill-black text-xs py-3.5 px-8 font-bold flex items-center justify-center gap-2 w-full sm:w-auto shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Devam Et: Sırayla Kalem Belirleme</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ADIM 2: SIRAYLA KALEM BELİRLEME (AKILLI REHBER)            */}
      {/* ======================================================== */}
      {currentStep === 2 && currentCategory && (
        <div className="animate-in fade-in duration-300 space-y-6">
          
          {/* Üst Sıralı İlerleme Çubuğu: Seçilen Kategoriler Sırayla */}
          <div className="bg-white border border-[#E8EAED] rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  ADIM 2 / 4 • SIRAYLA KALEM BELİRLEME
                </span>
                <h3 className="text-lg font-bold text-[#0A0A0B] mt-0.5">
                  Kalem {safeIndex + 1} / {enabledCategories.length}: {currentCategory.label}
                </h3>
              </div>

              <div className="text-xs text-[#64748B]">
                {activeRoom} • <strong>{defaultSqM} m²</strong>
              </div>
            </div>

            {/* Yatay Kalem İlerleme Rozetleri (Sırayla) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {enabledCategories.map((cat, idx) => {
                const isCurrent = idx === safeIndex;
                const existingItem = cart.find((c) => !c.isCustom && c.product?.category === cat.key);
                const isSelected = !!existingItem;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setActiveCategoryIndex(idx);
                      setSelectedBrand('Tümü');
                      setSearchQuery('');
                    }}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                      isCurrent
                        ? 'bg-[#0A0A0B] text-white shadow-md'
                        : isSelected
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#F1F3F5] text-[#4B5563] hover:text-[#0A0A0B]'
                    }`}
                  >
                    <span>{idx + 1}. {cat.label}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 BÜYÜK SEÇENEK: KARTELADAN SEÇ / ELİMDE MALZEME VAR / KEŞİFTE CANLI SEÇİM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* 1. Seçenek: Karteladan Seç */}
            <button
              type="button"
              onClick={() => {
                setCategoryModes((prev) => ({ ...prev, [currentCategory.key]: 'catalog' }));
              }}
              className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between ${
                categoryModes[currentCategory.key] === 'catalog'
                  ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-md'
                  : 'border-[#E8EAED] bg-white text-[#0A0A0B] hover:border-black/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    categoryModes[currentCategory.key] === 'catalog' ? 'bg-white text-black' : 'bg-[#F1F3F5] text-[#0A0A0B]'
                  }`}>
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    categoryModes[currentCategory.key] === 'catalog' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Popüler Tercih
                  </span>
                </div>
                <h4 className="text-sm font-bold">1. Karteladan Model Seç</h4>
                <p className={`text-xs mt-1 leading-relaxed ${
                  categoryModes[currentCategory.key] === 'catalog' ? 'text-slate-300' : 'text-[#64748B]'
                }`}>
                  1. sınıf malzeme temini + profesyonel usta işçiliği anahtar teslim dahil.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold flex items-center gap-1.5">
                <span>{categoryModes[currentCategory.key] === 'catalog' ? '● Aktif Seçenek' : 'Kartelayı İncele'}</span>
              </div>
            </button>

            {/* 2. Seçenek: Elimde Malzeme Var */}
            <button
              type="button"
              onClick={() => {
                setCategoryModes((prev) => ({ ...prev, [currentCategory.key]: 'labor_only' }));
              }}
              className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between ${
                categoryModes[currentCategory.key] === 'labor_only'
                  ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-md'
                  : 'border-[#E8EAED] bg-white text-[#0A0A0B] hover:border-black/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    categoryModes[currentCategory.key] === 'labor_only' ? 'bg-white text-black' : 'bg-[#F1F3F5] text-[#0A0A0B]'
                  }`}>
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    categoryModes[currentCategory.key] === 'labor_only' ? 'bg-emerald-400 text-black' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Malzeme 0 ₺
                  </span>
                </div>
                <h4 className="text-sm font-bold">2. Elimde Malzeme Var</h4>
                <p className={`text-xs mt-1 leading-relaxed ${
                  categoryModes[currentCategory.key] === 'labor_only' ? 'text-slate-300' : 'text-[#64748B]'
                }`}>
                  Malzemeyi siz aldınız; RestoLab usta kadrosu kırım, hazırlık ve döşemeyi üstlensin.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold flex items-center gap-1.5">
                <span>{categoryModes[currentCategory.key] === 'labor_only' ? '● Aktif Seçenek' : 'Yalnızca İşçilik Seç'}</span>
              </div>
            </button>

            {/* 3. Seçenek: Keşifte Canlı Kartela / Özel Model */}
            <button
              type="button"
              onClick={() => {
                setCategoryModes((prev) => ({ ...prev, [currentCategory.key]: 'on_site' }));
              }}
              className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between ${
                categoryModes[currentCategory.key] === 'on_site'
                  ? 'border-[#0A0A0B] bg-[#0A0A0B] text-white shadow-md'
                  : 'border-[#E8EAED] bg-white text-[#0A0A0B] hover:border-black/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    categoryModes[currentCategory.key] === 'on_site' ? 'bg-white text-black' : 'bg-[#F1F3F5] text-[#0A0A0B]'
                  }`}>
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    categoryModes[currentCategory.key] === 'on_site' ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Evde Canlı Seçim
                  </span>
                </div>
                <h4 className="text-sm font-bold">3. Keşifte Canlı Seçim</h4>
                <p className={`text-xs mt-1 leading-relaxed ${
                  categoryModes[currentCategory.key] === 'on_site' ? 'text-slate-300' : 'text-[#64748B]'
                }`}>
                  Mimarımız ücretsiz lazer keşfe fiziksel kartelayla gelsin; evinizin ışığında seçin.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-semibold flex items-center gap-1.5">
                <span>{categoryModes[currentCategory.key] === 'on_site' ? '● Aktif Seçenek' : 'Keşfe Bırak'}</span>
              </div>
            </button>

          </div>

          {/* ======================================================== */}
          {/* SEÇENEK 1: KARTELADAN ÜRÜN SEÇİM ALANI                   */}
          {/* ======================================================== */}
          {categoryModes[currentCategory.key] === 'catalog' && (
            <div className="space-y-6">
              
              {/* Filtre ve Arama Barı */}
              <div className="bg-white border border-[#E8EAED] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0A0A0B]">Marka Filtresi:</span>
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                        selectedBrand === b
                          ? 'bg-[#0A0A0B] text-white shadow-sm'
                          : 'bg-[#F8F9FA] border border-[#E2E4E8] text-[#4B5563] hover:text-[#0A0A0B]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Renk kodu veya model ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#D1D5DB] rounded-full pl-10 pr-4 py-2 text-xs text-[#0A0A0B] placeholder-[#94A3B8] focus:outline-none focus:border-[#0A0A0B] focus:bg-white"
                  />
                </div>
              </div>

              {/* Ürün Listesi Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#E8EAED] rounded-3xl">
                  <p className="text-sm font-semibold text-[#64748B]">Bu filtrede ürün bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => {
                    const currentQty = quantities[prod.id] !== undefined 
                      ? quantities[prod.id] 
                      : getSuggestedQtyForCategory(prod.category);
                    const unitTotal = prod.materialPrice + prod.workmanshipPrice;
                    const lineTotal = unitTotal * currentQty;
                    const isSelected = currentCartItem?.productId === prod.id;
                    const isShowingRoom = activeRoomViewId === prod.id && prod.roomImage;

                    const marketPrice = prod.marketPrice || Math.round(unitTotal * 1.35);
                    const unitSavings = Math.max(0, marketPrice - unitTotal);

                    return (
                      <div
                        key={prod.id}
                        className={`group bg-white rounded-3xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md border ${
                          isSelected ? 'border-[#0A0A0B] ring-2 ring-black/10' : 'border-[#E8EAED] hover:border-[#0A0A0B]'
                        }`}
                      >
                        <div>
                          {/* Ürün Fotoğrafı */}
                          <div className="relative h-48 w-full overflow-hidden bg-slate-100 border-b border-[#E8EAED]">
                            <img
                              src={isShowingRoom && prod.roomImage ? prod.roomImage : prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#0A0A0B] border border-black/5 shadow-sm">
                              {prod.brand}
                            </div>

                            {unitSavings > 0 && (
                              <div className="absolute top-3 right-3 bg-[#0A0A0B] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow flex items-center gap-1">
                                <TrendingDown className="w-3 h-3 text-emerald-400" />
                                <span>Piyasadan {unitSavings} ₺/{prod.unit} Uygun</span>
                              </div>
                            )}

                            {prod.roomImage && (
                              <button
                                type="button"
                                onClick={() => setActiveRoomViewId(isShowingRoom ? null : prod.id)}
                                className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow transition"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{isShowingRoom ? 'Kartela Görseli' : 'Uygulama Örneği'}</span>
                              </button>
                            )}
                          </div>

                          {/* Ürün Detayı */}
                          <div className="p-5">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                              <span>Kod: {prod.code}</span>
                              <span className="font-semibold text-[#0A0A0B]">{prod.unit} Hesabı</span>
                            </div>

                            <h3 className="text-sm font-bold text-[#0A0A0B] mt-1.5 leading-snug">
                              {prod.name}
                            </h3>

                            <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>

                            {/* Fiyat Kutusu */}
                            <div className="mt-4 p-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-between">
                              <div>
                                <div className="text-[10px] text-[#64748B]">Fabrika + Uygulama:</div>
                                <div className="text-base font-black text-[#0A0A0B] font-mono">
                                  {unitTotal.toLocaleString('tr-TR')} ₺{' '}
                                  <span className="text-xs font-normal text-[#64748B]">/ {prod.unit}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-[#64748B]">Tahmini Kalem:</div>
                                <div className="text-xs font-bold font-mono text-[#0A0A0B]">
                                  {lineTotal.toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Miktar ve Seçim Butonu */}
                        <div className="p-5 pt-0">
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F1F3F5]">
                            <div className="flex items-center gap-1 bg-[#F1F3F5] rounded-full p-1">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(prod.id, currentQty - 1)}
                                className="w-6 h-6 rounded-full bg-white text-[#0A0A0B] flex items-center justify-center font-bold text-xs shadow-sm hover:bg-slate-50"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={currentQty}
                                onChange={(e) => handleQtyChange(prod.id, Number(e.target.value))}
                                className="w-12 bg-transparent text-center text-xs font-bold text-[#0A0A0B] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleQtyChange(prod.id, currentQty + 1)}
                                className="w-6 h-6 rounded-full bg-white text-[#0A0A0B] flex items-center justify-center font-bold text-xs shadow-sm hover:bg-slate-50"
                              >
                                +
                              </button>
                              <span className="text-[11px] font-semibold text-[#64748B] pr-2">{prod.unit}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => commitCategoryAndAdvance(prod, currentQty, 'catalog')}
                              className="btn-pill-black text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-md"
                            >
                              <span>{isSelected ? '✓ Seçili (İlerle)' : 'Bu Modeli Seç'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* SEÇENEK 2: ELİMDE MALZEME VAR (YALNIZCA İŞÇİLİK)          */}
          {/* ======================================================== */}
          {categoryModes[currentCategory.key] === 'labor_only' && (() => {
            const laborProduct = getLaborOnlyProduct(currentCategory.key);
            const currentQty = quantities[laborProduct.id] !== undefined
              ? quantities[laborProduct.id]
              : getSuggestedQtyForCategory(currentCategory.key);
            const laborTotal = laborProduct.workmanshipPrice * currentQty;

            return (
              <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-10 shadow-sm animate-in fade-in duration-300">
                <div className="max-w-2xl mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-2">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>MALZEME MÜŞTERİDEN • PROFESYONEL USTA İŞÇİLİĞİ</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0A0A0B]">
                    {currentCategory.label} İçin Yalnızca Uygulama & Usta İşçiliği
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                    Malzemenizi (boya, parke, seramik vb.) önceden satın aldıysanız veya kendiniz temin edecekseniz; malzeme bedeli <strong>0 ₺</strong> sayılır. RestoLab usta kadrosu kırım, yüzey hazırlığı ve anahtar teslim uygulama işçiliğini şeffaf birim fiyatla üstlenir.
                  </p>
                </div>

                {/* İşçilik Kapsamı & Fiyat Kartı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-[#F8F9FA] border border-[#E2E4E8] mb-8">
                  
                  {/* Sol: Neler Dahil? */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#0A0A0B] block">
                      RestoLab Usta İşçiliğine Neler Dahil?
                    </span>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {laborProduct.description}
                    </p>
                    <div className="pt-2 text-[11px] text-[#64748B] space-y-1">
                      <div>✓ Zemin ve eşya koruma örtüleri & maskeleme</div>
                      <div>✓ Kırım ve moloz hafriyatının çuvallanıp tahliyesi</div>
                      <div>✓ Mimari teslim onayı ve iş bitimi kaba temizlik</div>
                    </div>
                  </div>

                  {/* Sağ: Şeffaf Hesap */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E4E8] flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B]">Malzeme Maliyeti:</span>
                        <span className="font-bold font-mono text-emerald-600">0 ₺ (Siz Temin Ediyorsunuz)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B]">Usta Birim İşçilik:</span>
                        <span className="font-bold font-mono text-[#0A0A0B]">{laborProduct.workmanshipPrice} ₺ / {currentCategory.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F1F3F5]">
                        <span className="text-[#64748B]">Hesaplanan Metraj:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            value={currentQty}
                            onChange={(e) => handleQtyChange(laborProduct.id, Number(e.target.value))}
                            className="w-16 bg-[#F8F9FA] border border-[#D1D5DB] rounded-lg px-2 py-0.5 text-xs font-bold text-center text-[#0A0A0B] focus:outline-none"
                          />
                          <span className="font-bold text-xs text-[#64748B]">{currentCategory.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8EAED] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#64748B] uppercase font-bold block">İşçilik Toplamı:</span>
                        <strong className="text-xl font-black font-mono text-[#0A0A0B]">
                          {laborTotal.toLocaleString('tr-TR')} ₺
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => commitCategoryAndAdvance(laborProduct, currentQty, 'labor_only')}
                        className="btn-pill-black text-xs py-3 px-6 font-bold flex items-center gap-2 shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        <span>Sadece İşçilik Olarak Seç ve İlerle</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* SEÇENEK 3: KEŞİFTE CANLI KARTELA / ÖZEL MODEL             */}
          {/* ======================================================== */}
          {categoryModes[currentCategory.key] === 'on_site' && (() => {
            const currentNote = categoryNotes[currentCategory.key] || '';
            const onSiteProd = getOnSiteProduct(currentCategory.key, currentNote);
            const currentQty = quantities[onSiteProd.id] !== undefined
              ? quantities[onSiteProd.id]
              : getSuggestedQtyForCategory(currentCategory.key);
            const estTotal = (onSiteProd.materialPrice + onSiteProd.workmanshipPrice) * currentQty;

            return (
              <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-10 shadow-sm animate-in fade-in duration-300">
                <div className="max-w-2xl mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-2">
                    <Compass className="w-3.5 h-3.5" />
                    <span>YERİNDE KARAR VERİN • ÜCRETSİZ FİZİKİ KARTELA HİZMETİ</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-[#0A0A0B]">
                    {currentCategory.label} Modelini Evinizin Işığında Canlı Seçin
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                    Renk tonları ve seramik dokuları telefon veya bilgisayar ekranlarında ortam ışığına göre farklı görünebilir. Mimarımız ücretsiz lazer keşfe gelirken zengin malzeme kartelalarını yanına alır; mobilyalarınız ve gün ışığı eşliğinde canlı karar verirsiniz.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E2E4E8] space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1.5">
                      İstediğiniz Özel Bir Renk Kodu, Marka veya Stil Notu (Opsiyonel):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Örn: Açık vizon veya kırık beyaz tonları, 60x120 Calacatta mermer desen, derzli meşe parke..."
                      value={currentNote}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryNotes((prev) => ({ ...prev, [currentCategory.key]: val }));
                      }}
                      className="w-full bg-white border border-[#D1D5DB] rounded-2xl p-3 text-xs text-[#0A0A0B] placeholder-[#94A3B8] focus:outline-none focus:border-[#0A0A0B] resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E8EAED]">
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                        Ön Görülen Malzeme + İşçilik Bütçesi:
                      </span>
                      <strong className="text-lg font-black font-mono text-[#0A0A0B]">
                        ~{estTotal.toLocaleString('tr-TR')} ₺{' '}
                        <span className="text-xs font-normal text-[#64748B]">({currentQty} {currentCategory.unit})</span>
                      </strong>
                      <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                        * Kesin malzeme bedeli keşifte seçeceğiniz modele göre sözleşmede netleşir.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => commitCategoryAndAdvance(onSiteProd, currentQty, 'on_site')}
                      className="btn-pill-black text-xs py-3.5 px-6 font-bold flex items-center gap-2 shadow-md bg-[#0A0A0B] text-white self-start sm:self-auto"
                    >
                      <span>Keşifte Belirlensin Olarak Seç & İlerle</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* STEP 2 ALT GEZİNME BARLARI                               */}
          {/* ======================================================== */}
          <div className="bg-white border border-[#E8EAED] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (safeIndex > 0) {
                  setActiveCategoryIndex(safeIndex - 1);
                  setSelectedBrand('Tümü');
                  setSearchQuery('');
                  scrollToTop();
                } else {
                  goToStep(1);
                }
              }}
              className="btn-pill-outline text-xs py-3 px-5 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {safeIndex > 0 
                  ? `Önceki Kalem: ${enabledCategories[safeIndex - 1].label}` 
                  : 'Kapsam Seçimine Dön'}
              </span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="btn-pill-outline text-xs py-3 px-4 hidden sm:inline-flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Sepet ({cart.length})</span>
                </button>
              )}

              {safeIndex < enabledCategories.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryIndex(safeIndex + 1);
                    setSelectedBrand('Tümü');
                    setSearchQuery('');
                    scrollToTop();
                  }}
                  className="btn-pill-black text-xs py-3 px-6 font-bold flex items-center gap-2 w-full sm:w-auto justify-center shadow-md"
                >
                  <span>Sıradaki Kaleme Geç: {enabledCategories[safeIndex + 1].label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="btn-pill-black text-xs py-3 px-7 font-bold flex items-center gap-2 w-full sm:w-auto justify-center shadow-md"
                >
                  <span>Devam Et: Varsa Özel İstekleriniz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ADIM 3: VARSA ÖZEL İSTEKLER VE FOTOĞRAF YÜKLEME          */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="animate-in fade-in duration-300">
          
          <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-10 mb-6 shadow-sm relative overflow-hidden">
            
            {customAddedToast && (
              <div className="absolute top-4 right-4 bg-[#0A0A0B] text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce z-10 border border-white/20">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Özel isteğiniz ve fotoğrafınız teklif sepetinize eklendi!</span>
              </div>
            )}

            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0B] text-white text-[11px] font-bold mb-2">
                <span>ADIM 3 / 4</span>
                <span>•</span>
                <span>ÖZEL İSTEK & FOTOĞRAF</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0A0A0B]">
                Listede Bulamadığınız ya da Farklı Bir İstek mi Var?
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                Pinterest'te beğendiğiniz bir salon çıtası, mutfak dolabı görseli veya evinizdeki hasarlı/tadilat yapılacak alanın fotoğrafını yükleyin; mimarımız keşifte özel olarak dahil etsin.
              </p>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Fotoğraf Yükleme Alanı */}
                <div className="p-5 bg-[#F8F9FA] border border-[#E2E4E8] rounded-2xl flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>Örnek / Hasarlı Alan Fotoğrafı</span>
                    </label>
                    <p className="text-[11px] text-[#64748B] mb-3">
                      Telefonunuzun kamerasından çekin veya galerinizden yükleyin.
                    </p>
                  </div>

                  {customPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#E2E4E8] h-40 bg-white">
                      <img
                        src={customPhoto}
                        alt="Yüklenen Görsel"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomPhoto('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition"
                        title="Fotoğrafı Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleCustomPhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 border-2 border-dashed border-[#CBD5E1] hover:border-black rounded-xl bg-white text-[#4B5563] text-xs font-bold flex flex-col items-center justify-center gap-2 transition"
                      >
                        <Upload className="w-5 h-5 text-[#0A0A0B]" />
                        <span>Cihazdan Fotoğraf Seç veya Çek</span>
                        <span className="text-[10px] text-[#94A3B8] font-normal">PNG, JPG (Maks. 3MB)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Not & Açıklama Alanı */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                      Mekan / Oda Seçimi
                    </label>
                    <select
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white"
                    >
                      <option value="Salon">Salon</option>
                      <option value="Mutfak">Mutfak</option>
                      <option value="Banyo">Banyo</option>
                      <option value="Yatak Odası">Yatak Odası</option>
                      <option value="Koridor / Antre">Koridor / Antre</option>
                      <option value="Tüm Ev">Tüm Ev</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                      Özel İstek Başlığı
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: TV Arkası Ahşap Çıtalama / Rutubet Yalıtımı"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0B] mb-1">
                      Detaylı Açıklamanız & Notunuz *
                    </label>
                    <textarea
                      rows={3}
                      required={!customPhoto}
                      placeholder="İstediğiniz modelin detaylarını veya yapılması gereken özel işi buraya yazın..."
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E2E4E8] rounded-xl p-3 text-xs text-[#0A0A0B] focus:outline-none focus:border-black focus:bg-white resize-none"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn-pill-black text-xs py-3 px-6 shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bu Özel İsteği Listeme Ekle</span>
                </button>
              </div>
            </form>

            {/* Eklenmiş Özel İstekler Listesi */}
            {cart.filter((c) => c.isCustom).length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#F1F3F5]">
                <h4 className="text-xs font-bold text-[#0A0A0B] uppercase tracking-wider mb-3">
                  Listeye Eklenen Özel İstekleriniz ({cart.filter((c) => c.isCustom).length}):
                </h4>
                <div className="space-y-2">
                  {cart.filter((c) => c.isCustom).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.customData?.photoDataUrl ? (
                          <img
                            src={item.customData.photoDataUrl}
                            alt="Özel Fotoğraf"
                            className="w-12 h-12 object-cover rounded-xl border border-[#CBD5E1]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-[#0A0A0B]">
                            {item.customData?.title || 'Özel İstek'}
                          </div>
                          <div className="text-[11px] text-[#64748B] line-clamp-1">
                            {item.customData?.description} ({item.roomType})
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Keşifte Fiyatlandırılacak
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Step 3 Bottom Navigation */}
          <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryIndex(Math.max(0, enabledCategories.length - 1));
                goToStep(2);
              }}
              className="btn-pill-outline text-xs py-3 px-6 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Malzeme Seçimine Dön</span>
            </button>

            <div className="text-center sm:text-right">
              <p className="text-[11px] text-[#64748B] mb-2 sm:mb-0">
                Özel bir isteğiniz yoksa doğrudan teklif özetinizi görüntüleyebilirsiniz.
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToStep(4)}
              className="btn-pill-black text-xs py-3.5 px-8 font-bold flex items-center gap-2 w-full sm:w-auto justify-center shadow-md"
            >
              <span>Devam Et: Teklif Özeti & Keşif</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* ADIM 4: TEKLİF ÖZETİ, KEŞİF, WHATSAPP & SABİT FİYAT      */}
      {/* ======================================================== */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-10 shadow-sm">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#F1F3F5]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0B] text-white text-[11px] font-bold mb-2">
                  <span>ADIM 4 / 4</span>
                  <span>•</span>
                  <span>ŞEFFAF TEKLİF ÖZETİ</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0A0A0B]">
                  Kişiselleştirilmiş Tadilat & Bütçe Özeti
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  Daireniz için belirlediğiniz tüm malzeme ve işçilik kalemleri şeffaf olarak aşağıda dökümlenmiştir.
                </p>
              </div>

              {/* Daire Özeti Rozeti */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E4E8] text-right shrink-0">
                <div className="text-[10px] text-[#64748B] uppercase font-bold">Seçili Daire:</div>
                <div className="text-xs font-bold text-[#0A0A0B]">{activeRoom}</div>
                <div className="text-xs font-mono font-black text-[#0A0A0B]">{defaultSqM} m²</div>
              </div>
            </div>

            {/* Kalem Listesi */}
            {cart.length === 0 ? (
              <div className="text-center py-12 bg-[#F8F9FA] rounded-2xl border border-[#E8EAED] mb-6">
                <p className="text-sm font-semibold text-[#64748B]">Henüz listenize ürün veya işlem eklemediniz.</p>
                <button
                  onClick={() => goToStep(2)}
                  className="mt-3 btn-pill-black text-xs py-2 px-5 inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kalemleri Belirle</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {cart.map((item, idx) => {
                  if (item.isCustom) {
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.customData?.photoDataUrl ? (
                            <img
                              src={item.customData.photoDataUrl}
                              alt="Özel İstek"
                              className="w-12 h-12 object-cover rounded-xl border border-[#CBD5E1]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1 border border-amber-200">
                              Özel İstek / İlave Kalem
                            </span>
                            <div className="text-xs font-bold text-[#0A0A0B]">
                              {item.customData?.title || 'Özel İstek'}
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {item.customData?.description} ({item.roomType})
                            </div>
                          </div>
                        </div>

                        <div className="text-right sm:self-center">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            Keşifte Fiyatlandırılacak
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (!item.product) return null;
                  const isMaterialOnly = item.purchaseType === 'material_only';
                  const itemTotal = isMaterialOnly
                    ? item.product.materialPrice * item.quantity
                    : (item.product.materialPrice + item.product.workmanshipPrice) * item.quantity;
                  const isLaborOnly = item.product.id.startsWith('labor-');
                  const isOnSite = item.product.id.startsWith('onsite-');

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FBFBFC] border border-[#E8EAED] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-[#E2E4E8] shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-[#64748B]">
                              {item.product.brand} • Kod: {item.product.code}
                            </span>
                            {isLaborOnly && (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                                Sadece İşçilik (Malzeme 0 ₺)
                              </span>
                            )}
                            {isOnSite && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">
                                Keşifte Canlı Seçim
                              </span>
                            )}
                            {isMaterialOnly && (
                              <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.2 rounded-full">
                                Sadece Ürün (Doğrudan Sipariş)
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#0A0A0B]">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            Miktar: <strong>{item.quantity} {item.product.unit}</strong> ({item.roomType})
                          </div>
                        </div>
                      </div>

                      <div className="text-right self-end sm:self-center">
                        <div className="text-[10px] text-[#64748B]">
                          {isLaborOnly ? 'Yalnızca Usta İşçiliği:' : isMaterialOnly ? 'Sadece Malzeme (Bayi Fiyatı):' : 'Malzeme + İşçilik:'}
                        </div>
                        <div className="text-sm font-extrabold font-mono text-[#0A0A0B]">
                          {itemTotal.toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Kaç Günde Biter? — Mimari Taahhüt Takvimi */}
            <div className="p-5 rounded-3xl bg-[#0A0A0B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    MİMARİ TESLİMAT VE ZAMAN TAAHHÜDÜ
                  </span>
                  <div className="text-sm sm:text-base font-bold text-white">
                    Tahmini Teslim Süresi:{' '}
                    <span className="text-emerald-400 font-mono font-black text-base sm:text-lg">
                      {calculateEstimatedDays().min} - {calculateEstimatedDays().max} İş Günü
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 sm:text-right">
                <div className="font-semibold text-white">✓ Sözleşmeli Sabit Takvim</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Usta gecikmelerine karşı mimari şantiye takibi</div>
              </div>
            </div>

            {/* Finansal Özet Tablosu */}
            {cart.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E2E4E8] mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#E2E4E8]">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Malzeme Maliyeti:</span>
                    <strong className="text-base font-bold font-mono text-[#0A0A0B]">
                      {totalMaterial.toLocaleString('tr-TR')} ₺
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Uygulama & Usta İşçiliği:</span>
                    <strong className="text-base font-bold font-mono text-[#0A0A0B]">
                      {totalLabor.toLocaleString('tr-TR')} ₺
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-700 block font-semibold">Tahmini Piyasa Tasarrufunuz:</span>
                    <strong className="text-base font-bold font-mono text-emerald-700">
                      {totalSavings.toLocaleString('tr-TR')} ₺
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      ANAHTAR TESLİM SABİT BÜTÇE
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#0A0A0B]">
                      {grandTotal.toLocaleString('tr-TR')} ₺
                      <span className="text-xs font-normal text-[#64748B] ml-2">(KDV & İşçilik Dahil)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenCart}
                      className="btn-pill-outline text-xs py-2.5 px-4 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Sepeti Düzenle</span>
                    </button>
                    {onOpenProforma && (
                      <button
                        type="button"
                        onClick={onOpenProforma}
                        className="btn-pill-outline text-xs py-2.5 px-4 flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Proforma PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Güvence ve Kademeli Hakediş Kutusu */}
            <div className="p-6 rounded-3xl bg-[#0A0A0B] text-white mb-8">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>RESTOLAB® MİMARİ GÜVENCE MODELİ</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Sözleşmeli Sabit Bütçe & Kademeli Hakediş Sistemi
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Toplam tutarın tamamı kesinlikle baştan alınmaz. Ödemeler işin aşamalarına göre kademeli tahsil edilir. Kalan son bakiye sadece siz sahada mimari teslim onayı verdikten sonra ödenir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">1. AŞAMA</span>
                  <strong className="text-white block">Sözleşme & Tedarik</strong>
                  <span className="text-[11px] text-slate-400">Malzemeler adresinize ulaştığında</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">2. AŞAMA</span>
                  <strong className="text-white block">Saha İlerlemesi</strong>
                  <span className="text-[11px] text-slate-400">Uygulama devam ederken kontrol</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">3. AŞAMA (SON)</span>
                  <strong className="text-white block">Mimari Teslim Onayı</strong>
                  <span className="text-[11px] text-slate-400">İşi beğenip anahtarı aldığınızda</span>
                </div>
              </div>
            </div>

            {/* İletişim & Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F1F3F5]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="btn-pill-outline text-xs py-3.5 px-5 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Özel İsteklere Dön</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="btn-pill-outline text-xs py-3.5 px-4 flex items-center gap-1.5 hidden md:inline-flex"
                  title="En baştan kapsamı düzenle"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kapsamı Düzenle</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {onOpenCallback && (
                  <button
                    type="button"
                    onClick={onOpenCallback}
                    className="btn-pill-outline text-xs py-3.5 px-5 font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Phone className="w-4 h-4 text-[#0A0A0B]" />
                    <span>Mimar Beni Arasın</span>
                  </button>
                )}

                {onOpenInspection && (
                  <button
                    type="button"
                    onClick={onOpenInspection}
                    className="btn-pill-outline text-xs py-3.5 px-5 font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Calendar className="w-4 h-4 text-[#0A0A0B]" />
                    <span>Ücretsiz Keşif Randevusu</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="btn-pill-black text-xs py-3.5 px-7 font-bold flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Send className="w-4 h-4" />
                  <span>Teklifi WhatsApp ile Mimara Gönder</span>
                </button>
              </div>
            </div>

          </div>

          {/* İnteraktif Öncesi / Sonrası Galerisi */}
          <div className="mt-8">
            <BeforeAfterSlider projects={settings?.beforeAfterProjects} />
          </div>

        </div>
      )}

    </section>
  );
};
