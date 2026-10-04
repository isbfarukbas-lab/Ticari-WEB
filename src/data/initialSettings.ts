import { SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  phoneNumber: '905550000000',
  supportPhone: '0850 123 45 67',
  companyName: 'RESTOLAB® Mimarlık ve Yapı Çözümleri A.Ş.',
  coverageNotice: 'İstanbul, Ankara ve İzmir genelinde mimari lazer keşif servisimiz aktiftir.',
  kdvNotice: 'Fiyatlarımız bireysel müşterilerimiz için anahtar teslim KDV dahil net tutardır.',
  laborRates: {
    boya: {
      laborPrice: 105,
      marketPrice: 175,
      description: 'Astar, 2 kat profesyonel boya, çatlak ve macun tamiratı, zımpara, maskeleme ve temiz teslim dahil.',
    },
    parke: {
      laborPrice: 120,
      marketPrice: 190,
      description: 'Laminat parke usta döşemesi, kapron şilte serimi, 8cm süpürgelik montajı ve geçiş profilleri dahil.',
    },
    seramik: {
      laborPrice: 380,
      marketPrice: 550,
      description: 'Eski kaplama kırım ve hafriyat atımı, su yalıtımı, yapıştırıcı harç, profesyonel döşeme ve derz dolgu dahil.',
    },
    elektrik: {
      laborPrice: 250,
      marketPrice: 380,
      description: 'Armatür montajı, anahtar-priz hatlarının yenilenmesi, sigorta kutusu bağlantıları ve güvenlik testi.',
    },
    alci_tavan: {
      laborPrice: 220,
      marketPrice: 340,
      description: 'Tavan karkas montajı, alçıpan kaplama, saten alçı çekimi ve pürüzsüz zımpara işçiliği.',
    },
    mutfak_banyo: {
      laborPrice: 4500,
      marketPrice: 7000,
      description: 'Müşteri tarafından temin edilen dolap, tezgah veya vitrifiye ürünlerinin uzman montajı.',
    },
    ozel: {
      laborPrice: 0,
      marketPrice: 0,
      description: 'Keşifte yerinde mimar tarafından belirlenir.',
    },
  },
  durationRules: {
    baseDays: {
      boya: 2,
      parke: 2,
      seramik: 4,
      elektrik: 1,
      alci_tavan: 3,
      mutfak_banyo: 7,
      ozel: 2,
    },
    sqmThreshold: 100,
  },
  serviceAreas: [
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
  ],
  beforeAfterProjects: [
    {
      id: 'proj-1',
      title: '3+1 Daire Salon & Zemin Dönüşümü',
      location: 'Kadıköy, İstanbul',
      duration: '5 İş Günü',
      scope: 'Aydan Silinir Boya + 10mm Derzli Meşe Parke + Lake Süpürgelik',
      beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'proj-2',
      title: 'Ebeveyn Banyo & Seramik Yenileme',
      location: 'Beşiktaş, İstanbul',
      duration: '4 İş Günü',
      scope: 'Kırım + Su Yalıtımı + 60x120 Granit Seramik + Gömme Rezervuar',
      beforeImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      afterImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  paymentStages: {
    stage1Percent: 35,
    stage2Percent: 40,
    stage3Percent: 25,
  },
};
