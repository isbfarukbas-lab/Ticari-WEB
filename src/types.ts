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

export interface ProductVariant {
  id: string;
  name: string;             // örn: "Aydan Rengi", "Andezit 25", "Doğal Meşe", "Koyu Ceviz"
  code?: string;            // örn: "FB-AYDAN-201"
  colorHex?: string;        // örn: "#E4DEC8"
  image?: string;           // Varyant görseli (opsiyonel)
  priceDifference?: number; // Opsiyonel fiyat farkı (+/- TL)
}

export interface CoverageCalculationRule {
  coveragePerUnit: number;     // örn: 1.83 (parke 1 paket m²), 130 (15L kova boya m²), 1.44 (fayans kutu)
  unitLabel: string;           // örn: "m²", "metre", "çerçeve"
  defaultWastePercent: number; // örn: 7 (%7 fire)
  calculationType: 'area' | 'length' | 'set';
}

export interface Product {
  id: string;
  category: CategoryKey;
  brand: string;             // örn: "Filli Boya", "Marshall", "Kütahya Seramik", "Yıldız Parke"
  name: string;              // örn: "Momento Silan — Aydan Rengi"
  code: string;              // örn: "FL-AYD-201"
  image: string;             // Gerçek kartela / numune / ürün fotoğrafı (CDN WebP URL veya Base64)
  images?: string[];         // Çoklu ürün fotoğraf galerisi (kapak, doku, açı ve mekan fotoğrafları)
  roomImage?: string;        // Uygulanmış gerçek mekan fotoğrafı (opsiyonel)
  description: string;
  unit: 'm²' | 'adet' | 'metre' | 'nokta' | 'paket' | 'kova' | 'set';
  materialPrice: number;     // Birim malzeme maliyeti (TL)
  workmanshipPrice: number;  // Birim uygulama ve uzman işçilik bedeli (TL)
  marketPrice?: number;      // Piyasadaki ortalama perakende fiyatı (Tasarruf hesabı için)
  isActive?: boolean;
  isStoreProduct?: boolean;  // Doğrudan mağazada tekil satışa açık ürün
  inStock?: boolean;         // Stok durumu
  stockCount?: number;       // Opsiyonel net stok adedi (siparişte otomatik düşer, 0 olunca stokta yok olur)
  specs?: string[];          // Teknik / malzeme özellikleri
  packageInfo?: string;      // Kapsam / paket bilgisi (örn: "1 Paket = 1.83 m²", "12 Çerçeve Hazır Set")
  variants?: ProductVariant[];
  coverageRule?: CoverageCalculationRule;
}

export interface CustomRequestItem {
  id: string;
  title: string;
  description: string;
  roomType: string;
  photoDataUrl?: string;     // Müşterinin cihazından yüklediği fotoğraf (CDN WebP URL)
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
  selectedVariant?: ProductVariant;
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
  email?: string;
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
  trackingCarrier?: string;  // Kargo / Lojistik firması (örn: "Yurtiçi Kargo", "Aras Kargo")
  trackingCode?: string;     // Kargo takip numarası
  paymentSummary?: string;
  isCallback?: boolean;
  leadType?: 'kesif' | 'whatsapp' | 'callback' | 'store_order' | 'web_order';
  orderNumber?: string;
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
  shippingCost?: number;
  customerId?: string;
  items: { 
    productId?: string;
    name: string; 
    brand: string; 
    quantity: number; 
    unit: string; 
    total: number;
    isCustom?: boolean;
    photoDataUrl?: string;
    customNote?: string;
    purchaseType?: 'with_installation' | 'material_only';
    selectedVariant?: ProductVariant;
    variantName?: string;
  }[];
  createdAt: string;
}

export interface SiteContentSettings {
  // 1. Hero / Karşılama
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  
  // Kapı 1: Anahtar Teslim Tadilat & Keşif Kartı
  cardRenovationBadge: string;
  cardRenovationTitle: string;
  cardRenovationDesc: string;
  cardRenovationNote: string;
  cardRenovationBtnText: string;

  // Kapı 2: Doğrudan Malzeme & E-Ticaret Kartı
  cardStoreBadge: string;
  cardStoreTitle: string;
  cardStoreDesc: string;
  cardStoreNote: string;
  cardStoreBtnText: string;

  // 2. Güvence & Değer Vaatleri (Trust Section)
  trustBadge: string;
  trustTitle: string;
  trustSubtitle: string;
  
  // Pillar 1
  pillar1Title: string;
  pillar1Desc: string;
  pillar1Note: string;
  
  // Pillar 2
  pillar2Title: string;
  pillar2Desc: string;
  pillar2Note: string;
  
  // Pillar 3
  pillar3Title: string;
  pillar3Desc: string;
  pillar3Note: string;

  // 3. Mağaza & Vitrin (Store Banner)
  storeBadge: string;
  storeTitle: string;
  storeSubtitle: string;
  storePerk1: string;
  storePerk2: string;
  storePerk3: string;

  // Vitrin Öne Çıkan Ürün Kutusu (Spotlight card)
  spotlightBadge: string;
  spotlightSub: string;
  spotlightTitle: string;
  spotlightDesc: string;
  spotlightOldPrice: string;
  spotlightPrice: string;
  spotlightUnit: string;

  // 4. Duyuru Bandı (Header Announcement Bar)
  announcementText1: string;
  announcementText2: string;
  announcementText3: string;
}

export interface BankInfoSettings {
  bankName: string;
  accountHolder: string;
  iban: string;
  transferDiscountPercent: number;
}

export interface PaymentMethodSettings {
  enableBankTransfer: boolean;
  enableCashOnDelivery: boolean;
  enableCreditCard: boolean;
  creditCardNote?: string;
}

export interface CompanyLegalSettings {
  taxOffice: string;
  taxNumber: string;
  mersisNo: string;
  companyAddress: string;
  companyEmail: string;
}

export interface ResendEmailSettings {
  apiKey?: string;
  fromEmail?: string;
}

export interface VirtualPosSettings {
  provider?: 'paytr' | 'iyzico';
  merchantId?: string;
  merchantKey?: string;
  merchantSalt?: string;
  testMode?: boolean;
}

export interface AnalyticsSeoSettings {
  ga4MeasurementId?: string;       // örn: "G-XXXXXXXXXX"
  metaPixelId?: string;            // örn: "123456789012345"
  googleSiteVerification?: string; // Google Search Console doğrulama kodu
}

export interface SiteSettings {
  phoneNumber: string;       // WhatsApp yönlendirme numarası
  supportPhone: string;      // Sitede gösterilen destek hattı
  companyName: string;
  coverageNotice: string;
  kdvNotice?: string;        // KDV açıklaması
  adminPassword?: string;    // Yönetici paneli koruma şifresi
  freeShippingThreshold?: number;
  standardShippingCost?: number;
  bankInfo?: BankInfoSettings;
  paymentMethods?: PaymentMethodSettings;
  legalInfo?: CompanyLegalSettings;
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
  content?: SiteContentSettings; // Canlı site metin ve vitrin yönetimi
  cloudEndpoint?: string;        // Firebase / Supabase ortak canlı bulut veritabanı URL'si
  notificationWebhookUrl?: string; // Sipariş düştüğünde tetiklenecek webhook (Make / Zapier / Slack)
  telegramConfig?: {
    botToken?: string;           // Telegram Bot Token (örn: 123456:ABC-DEF...)
    chatId?: string;             // Yönetici Telegram Chat ID
    enabled?: boolean;
  };
  resendConfig?: ResendEmailSettings;      // Otomatik E-Posta (Resend API - gizli kasada saklanır)
  posConfig?: VirtualPosSettings;          // PayTR 3D Secure Sanal POS (gizli kasada saklanır)
  analyticsConfig?: AnalyticsSeoSettings;  // GA4, Meta Pixel ve Search Console SEO ayarları
}

export interface CustomerAddress {
  id: string;
  title: string;          // e.g. "Ev Adresim", "İş Yeri"
  city: string;
  district: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  password?: string;
  addresses: CustomerAddress[];
  favorites?: string[];
  createdAt: string;
}
