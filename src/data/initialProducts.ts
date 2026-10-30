import { CategoryInfo, Product } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'boya',
    label: 'Boya & Badana',
    unit: 'm²',
    description: 'Astar, 2 kat boya, macun ve zımpara tamiratı, maskeleme ve temizlik dahil.',
  },
  {
    key: 'parke',
    label: 'Zemin & Parke',
    unit: 'm²',
    description: 'Laminat parke, 8cm süpürgelik, kapron şilte ve usta döşemesi dahil.',
  },
  {
    key: 'seramik',
    label: 'Seramik & Fayans',
    unit: 'm²',
    description: 'Kırım ve hafriyat atımı, su yalıtımı, yapıştırıcı, derz ve montaj dahil.',
  },
  {
    key: 'elektrik',
    label: 'Elektrik & Aydınlatma',
    unit: 'nokta',
    description: 'Kablo hatları, sigorta panosu kontrolü, anahtar-priz ve spot montajı dahil.',
  },
  {
    key: 'alci_tavan',
    label: 'Alçıpan & Tavan',
    unit: 'm²',
    description: 'Asma tavan, gizli LED ışık bandı, saten alçı duvar düzleme ve çıtalama.',
  },
  {
    key: 'mutfak_banyo',
    label: 'Mutfak & Banyo',
    unit: 'adet',
    description: 'Özel imalat lake dolap, kuvars tezgah, vitrifiye ve montaj.',
  },
];

/**
 * Legacy demo product IDs removed from the codebase so cached localStorage
 * in any browser never resurrects deleted demo items.
 */
export const LEGACY_DEMO_PRODUCT_IDS = new Set<string>([
  'filli-aydan',
  'filli-andezit25',
  'filli-kirik-beyaz',
  'filli-kozmik-gri',
  'marshall-tutsu',
  'marshall-deniz-kabugu',
  'marshall-bohem-gri',
  'yildiz-vario-lizbon',
  'yildiz-vario-efes',
  'yildiz-vario-truva',
  'kutahya-statuario-60120',
  'kutahya-vista-antrasit-6060',
  'kutahya-calacatta-3090',
  'schneider-asfora-antrasit',
  'samsung-led-gizli-isik',
  'knauf-asma-tavan-kutu',
  'store-rvoba-tv-panel',
  'store-vitra-mat-siyah-batarya',
  'store-rvoba-canak-lavabo',
  'store-filli-momento-kova',
  'store-varioclic-paket',
  'store-rvoba-cita-kiti',
  'store-oznur-nya-25',
  'store-oznur-nya-15',
  'store-oznur-nym-325',
  'store-siemens-pano-paketi',
  'store-schneider-asfora-24set',
  'store-wago-221-cantasi',
  'store-spiral-boru-50m',
  'store-samsung-serit-led-kit',
]);

export function isLegacyDemoProductId(id?: string | null): boolean {
  return !!id && LEGACY_DEMO_PRODUCT_IDS.has(id);
}

// Katalog temiz başlar; yalnızca yöneticinin eklediği gerçek ürünler Supabase üzerinden tüm cihazlarda gösterilir.
export const INITIAL_PRODUCTS: Product[] = [];
