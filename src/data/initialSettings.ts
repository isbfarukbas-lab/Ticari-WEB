import { SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  phoneNumber: '905447685137',
  supportPhone: '0544 768 51 37',
  companyName: 'RVOBA® Mimarlık ve Yapı Çözümleri A.Ş.',
  coverageNotice: 'İstanbul, Ankara ve İzmir genelinde mimari lazer keşif servisimiz aktiftir.',
  kdvNotice: 'Fiyatlarımız bireysel müşterilerimiz için anahtar teslim KDV dahil net tutardır.',
  adminPassword: 'rvoba2026',
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
  content: {
    // 1. Hero / Karşılama
    heroBadge: 'Doğrudan Üreticiden Mimari Malzemeler & Profesyonel Uygulama',
    heroTitle: 'Modern Yaşam Alanları İçin Mimari Tasarım Malzemeleri ve Uygulama Çözümleri.',
    heroSubtitle: 'Doğal ahşap akustik paneller, poliüretan duvar profilleri ve seçkin yüzey malzemeleri. İster projeniz için doğrudan malzeme sipariş edin, ister anahtar teslim mimari uygulama hizmeti alın.',
    
    // Kapı 1
    cardRenovationBadge: 'Mimari Proje & Uygulama',
    cardRenovationTitle: 'Anahtar Teslim Mimari Proje & Uygulama',
    cardRenovationDesc: 'İç mimar ve uzman şantiye kadromuzla keşiften teslime kadar tüm süreci tek resmi sözleşmeyle yönetiyoruz.',
    cardRenovationNote: '✓ İstanbul, Ankara ve İzmir Genelinde Aktif Saha Servisi',
    cardRenovationBtnText: 'Proje Bütçeni Hesapla',

    // Kapı 2
    cardStoreBadge: 'Mimari Malzeme & Koleksiyon',
    cardStoreTitle: 'Tasarım Malzemeleri Kataloğu',
    cardStoreDesc: 'Akustik ahşap paneller, duvar profilleri, 1. sınıf boyalar ve zemin kaplamaları adrese sigortalı teslim.',
    cardStoreNote: '✓ Türkiye Geneline Sigortalı Fabrika Sevkiyatı',
    cardStoreBtnText: 'Koleksiyonu İncele & Sipariş Ver',

    // 2. Güvence & Değer Vaatleri (Trust)
    trustBadge: 'RVOBA® KURUMSAL YÖNETİM MODELİ',
    trustTitle: 'Şeffaf Süreç, Tek Sözleşme ve Kesinleşmiş Bütçe',
    trustSubtitle: 'Tüm mimari malzeme ve uygulama süreçlerini kurumsal güvence ve yazılı şartnameyle yönetiyoruz.',
    
    pillar1Title: 'Tek Kurumsal Muhatap',
    pillar1Desc: 'Tüm süreci bünyemizde görevli İç Mimar ve Şantiye Şefimiz yönetir. Malzeme tedarikinden montaja kadar tek kurumsal muhatapla ilerlersiniz.',
    pillar1Note: 'Sıfır Operasyonel Yük',

    pillar2Title: 'Sözleşmeli Sabit Bütçe',
    pillar2Desc: 'Belirlenen malzeme ve uygulama kapsamı resmi sözleşmeye bağlanır. Keşifte onaylanan bütçe dışında kesinlikle ilave fiyat farkı çıkarılmaz.',
    pillar2Note: 'Sürpriz Maliyet Yok',

    pillar3Title: 'Mimari Teslim & Eksiksiz Onay',
    pillar3Desc: 'İş bitiminde iç mimarımızla beraber detaylı kontrol listesi yapılır. Tüm detaylar mimari standartlara tam uygun şekilde onayınızla teslim edilir.',
    pillar3Note: 'Eksiksiz & Onaylı Teslimat',

    // 3. Mağaza & Vitrin
    storeBadge: 'RVOBA® DOĞRUDAN ÜRETİCİ SATIŞ MAĞAZASI',
    storeTitle: 'Evinizi Yenileyen Tasarım Malzemeleri',
    storeSubtitle: 'Trend akustik ahşap paneller, poliüretan çıta setleri, 1. sınıf boyalar ve zemin kaplamaları toptan bayi fiyatıyla Türkiye geneli kapınıza teslim.',
    storePerk1: '3.000 ₺ Üzeri Ücretsiz Kargo',
    storePerk2: '12 Taksit İmkanı',
    storePerk3: 'Faturalı & Orijinal Bayi Garantisi',

    spotlightBadge: 'Öne Çıkan Tasarım',
    spotlightSub: 'RVOBA Atelier Özel Tasarım',
    spotlightTitle: 'Akustik Ahşap TV Arkası Çıta Paneli',
    spotlightDesc: 'Doğal meşe kaplama çıtalar, ses yutan yüksek yoğunluklu siyah akustik keçe.',
    spotlightOldPrice: '4.200 ₺',
    spotlightPrice: '2.450 ₺',
    spotlightUnit: '/ adet',

    // 4. Duyuru Bandı
    announcementText1: '3.000 TL Üzeri Ücretsiz Kargo',
    announcementText2: 'Tüm Kredi Kartlarına 12 Taksit İmkanı',
    announcementText3: 'Fabrikadan Doğrudan Sigortalı Sevk',
  },
};
