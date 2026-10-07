export type CategoryKey = 
  | 'boya'
  | 'parke'
  | 'seramik'
  | 'elektrik'
  | 'alci_tavan'
  | 'mutfak_banyo'
  | 'ozel';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  unit: 'm²' | 'adet' | 'metre' | 'nokta';
  description: string;
}

export interface Product {
  id: string;
  category: CategoryKey;
  brand: string;             // örn: "Filli Boya", "Marshall", "Kütahya Seramik", "Yıldız Parke"
  name: string;              // örn: "Momento Silan — Aydan Rengi"
  code: string;              // örn: "FL-AYD-201"
  image: string;             // Gerçek kartela / numune / ürün fotoğrafı (URL veya Base64)
  roomImage?: string;        // Uygulanmış gerçek mekan fotoğrafı (opsiyonel)
  description: string;
  unit: 'm²' | 'adet' | 'metre' | 'nokta' | 'paket' | 'kova' | 'set';
  materialPrice: number;     // Birim malzeme maliyeti (TL)
  workmanshipPrice: number;  // Birim uygulama ve uzman işçilik bedeli (TL)
  marketPrice?: number;      // Piyasadaki ortalama perakende fiyatı (Tasarruf hesabı için)
  isActive?: boolean;
  isStoreProduct?: boolean;  // Doğrudan mağazada tekil satışa açık ürün
  inStock?: boolean;         // Stok durumu
  specs?: string[];          // Teknik / malzeme özellikleri
}

export interface CustomRequestItem {
  id: string;
  title: string;
  description: string;
  roomType: string;
  photoDataUrl?: string;     // Müşterinin cihazından yüklediği fotoğraf (Pinterest görseli, hasarlı duvar vb.)
}

export interface CartItem {
  id: string;
  productId?: string;
  product?: Product;
  quantity: number;
  roomType: string;
  // If custom request
  isCustom?: boolean;
  customData?: CustomRequestItem;
  purchaseType?: 'with_installation' | 'material_only'; // Usta montajı dahil mi yoksa sadece ürün satışı mı
}

export interface ServiceArea {
  city: string;
  districts: string[];
}

export interface BeforeAfterProject {
  id: string;
  title: string;
  location: string;
  duration: string;
  scope: string;
  beforeImage: string;
  afterImage: string;
}

export interface LeadRequest {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  address?: string;
  preferredDate?: string;
  timeSlot?: string;
  totalAmount: number;
  marketTotalAmount?: number;
  savingsAmount?: number;
  status?: 'bekliyor' | 'arandi' | 'kesif_verildi' | 'sozlesme_imzalandi';
  adminNotes?: string;
  isCallback?: boolean;
  leadType?: 'kesif' | 'whatsapp' | 'callback' | 'store_order';
  items: { 
    name: string; 
    brand: string; 
    quantity: number; 
    unit: string; 
    total: number;
    isCustom?: boolean;
    photoDataUrl?: string;
    customNote?: string;
    purchaseType?: 'with_installation' | 'material_only';
  }[];
  createdAt: string;
}

export interface SiteSettings {
  phoneNumber: string;       // WhatsApp yönlendirme numarası
  supportPhone: string;      // Sitede gösterilen destek hattı
  companyName: string;
  coverageNotice: string;
  kdvNotice?: string;        // KDV açıklaması
  adminPassword?: string;    // Yönetici paneli koruma şifresi
  laborRates: Record<CategoryKey, { laborPrice: number; marketPrice: number; description: string }>;
  durationRules: {
    baseDays: Record<CategoryKey, number>;
    sqmThreshold: number;
  };
  serviceAreas: ServiceArea[];
  beforeAfterProjects: BeforeAfterProject[];
  paymentStages: {
    stage1Percent: number;
    stage2Percent: number;
    stage3Percent: number;
  };
}
