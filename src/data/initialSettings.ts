import { SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  phoneNumber: '905550000000',
  supportPhone: '0850 123 45 67',
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
    heroBadge: 'Piyasadan %20-30 Daha Uygun Bayi Fiyatı & 81 İl Kargo',
    heroTitle: 'İster Anahtar Teslim Mimari Tadilat, İster Fabrika Bayi Fiyatıyla Tasarım Malzemeleri.',
    heroSubtitle: 'Usta stresi ve aracı komisyonu olmadan evinizi yenileyin. RVOBA® ile ister anahtar teslim komple uygulama yaptırabilir, ister 1. sınıf mimari tasarım malzemelerini Türkiye geneli 81 ile doğrudan kargo teslim satın alabilirsiniz.',
    
    // Kapı 1
    cardRenovationBadge: '🏡 Hizmet & Mimarlık',
    cardRenovationTitle: 'Anahtar Teslim Tadilat & Keşif',
    cardRenovationDesc: 'Evinizi iç mimarlarımız ve profesyonel usta kadromuz yönetsin. Malzeme + Usta + Sabit Bütçe tek resmi sözleşmeyle.',
    cardRenovationNote: '✓ 3 İlde Hizmet: İstanbul, Ankara, İzmir',
    cardRenovationBtnText: 'Tadilat Bütçeni Hesapla',

    // Kapı 2
    cardStoreBadge: '📦 E-Ticaret & Malzeme (Kargo)',
    cardStoreTitle: 'Doğrudan Malzeme Satın Al',
    cardStoreDesc: 'Usta aramıyorum, sadece 1. sınıf toptan bayi malzemelerini (Akustik panel, çıta, boya, batarya) kapıma kargoyla istiyorum.',
    cardStoreNote: '✓ Tüm Türkiye (81 İl) Kargo ile Kapıya Teslim',
    cardStoreBtnText: 'Ürünleri İncele & Satın Al',

    // 2. Güvence & Değer Vaatleri (Trust)
    trustBadge: 'KURUMSAL GÜVENCE MODELİ',
    trustTitle: 'Müşteri Usta İle Asla Muhatap Olmaz.',
    trustSubtitle: 'Klasik tadilat süreçlerindeki usta arama derdine, telefonlara çıkmayan taşeronlara ve sürekli artan masraflara RVOBA ile son veriyoruz.',
    
    pillar1Title: 'Tek Kurumsal Muhatap',
    pillar1Desc: 'Tüm süreci bünyemizde görevli İç Mimar ve Şantiye Şefimiz yönetir. Boyacı, parkeci veya tesisatçı ile tek bir kelime dahi konuşmanıza gerek kalmaz.',
    pillar1Note: 'Sıfır Operasyonel Yük',

    pillar2Title: 'Sözleşmeli Sabit Bütçe',
    pillar2Desc: 'Web sitemizde gördüğünüz fiyatlar yerinde ücretsiz lazer ölçüm sonrası resmi sözleşmeye bağlanır. Keşifte belirlenen kapsam dışında kesinlikle ilave fiyat farkı çıkarılmaz.',
    pillar2Note: 'Sürpriz Maliyet Yok',

    pillar3Title: 'Mimari Teslim & Eksiksiz Onay',
    pillar3Desc: 'İş bitiminde iç mimarımızla beraber detaylı kontrol listesi yapılır. Köşe rötuşları, süpürgelik birleşimleri ve tüm detaylar tam yapılmadan ve onayınız alınmadan iş teslim tutanağı kapatılmaz.',
    pillar3Note: 'Eksiksiz & Onaylı Teslimat',

    // 3. Mağaza & Vitrin
    storeBadge: 'RVOBA® 2026 MİMARİ ÜRÜN & MALZEME KOLEKSİYONU',
    storeTitle: 'Evinizin Havasını Değiştiren Tasarım Malzemeleri.',
    storeSubtitle: 'Trend akustik ahşap TV panelleri, poliüretan duvar çıtaları, 1. sınıf boyalar ve zemin çözümleri doğrudan üretici bayi fiyatıyla kapınıza teslim. İster sadece malzemeyi alın, ister usta montaj hizmetimizi ekleyin.',
    storePerk1: '3.000 ₺ Üzeri Ücretsiz Kargo',
    storePerk2: '12 Taksit İmkanı',
    storePerk3: 'İsteğe Bağlı Montaj (İst, Ank, İzm)',

    spotlightBadge: '🔥 Haftanın Yıldızı',
    spotlightSub: 'RVOBA Atelier Özel Tasarım',
    spotlightTitle: 'Akustik Ahşap TV Arkası Çıta Paneli',
    spotlightDesc: 'Doğal meşe kaplama çıtalar, ses yutan yüksek yoğunluklu siyah akustik keçe.',
    spotlightOldPrice: '4.200 ₺',
    spotlightPrice: '2.450 ₺',
    spotlightUnit: '/ adet',

    // 4. Duyuru Bandı
    announcementText1: '3.000 TL Üzeri Ücretsiz Kargo',
    announcementText2: '💳 Tüm Kredi Kartlarına 12 Taksit',
    announcementText3: '⚡ Fabrikadan Doğrudan Hızlı Sevk',
  },
};
