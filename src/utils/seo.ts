import { AnalyticsSeoSettings, Product, SiteSettings } from '../types';

const SITE_ORIGIN = 'https://rvoba.com';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _rvobaGa4Loaded?: string;
    _rvobaPixelLoaded?: string;
  }
}

export function slugifyTurkish(text: string): string {
  const charMap: Record<string, string> = {
    ğ: 'g',
    Ğ: 'g',
    ü: 'u',
    Ü: 'u',
    ş: 's',
    Ş: 's',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    Ö: 'o',
    ç: 'c',
    Ç: 'c',
  };

  return (
    (text || 'urun')
      .split('')
      .map((ch) => charMap[ch] ?? ch)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'urun'
  );
}

/**
 * Builds clean SEO product path: `/urun/3x2-5-mm-ttr-kablo--custom-prod-1792587210217`
 */
export function buildProductPath(product: Pick<Product, 'id' | 'name'>): string {
  const slug = slugifyTurkish(product.name);
  return `/urun/${slug}--${encodeURIComponent(product.id)}`;
}

export function buildProductFullUrl(product: Pick<Product, 'id' | 'name'>): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : SITE_ORIGIN;
  return `${origin}${buildProductPath(product)}`;
}

/**
 * Extracts product ID from either clean path (`/urun/slug--id` or `/urun/id`)
 * OR legacy hash (`#urun/id`) for 100% backward compatibility.
 */
export function extractProductIdFromLocation(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): string | null {
  if (pathname.startsWith('/urun/')) {
    const rawSegment = decodeURIComponent(pathname.slice('/urun/'.length).replace(/\/+$/, ''));
    if (!rawSegment) return null;
    const doubleDashIdx = rawSegment.indexOf('--');
    if (doubleDashIdx !== -1) {
      return rawSegment.slice(doubleDashIdx + 2) || null;
    }
    return rawSegment;
  }

  if (hash.startsWith('#urun/')) {
    const rawId = decodeURIComponent(hash.replace('#urun/', '').trim());
    if (!rawId) return null;
    const doubleDashIdx = rawId.indexOf('--');
    return doubleDashIdx !== -1 ? rawId.slice(doubleDashIdx + 2) : rawId;
  }

  return null;
}

function upsertMetaTag(
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(url: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function upsertJsonLd(data: unknown): void {
  if (typeof document === 'undefined') return;
  let script = document.getElementById('rvoba-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'rvoba-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function updatePageSeo(params: {
  view: 'store' | 'landing' | 'configurator' | 'admin';
  product?: Product | null;
  settings?: SiteSettings;
}): void {
  if (typeof document === 'undefined') return;

  const companyName = params.settings?.companyName || 'RVOBA®';
  const verification = params.settings?.analyticsConfig?.googleSiteVerification?.trim();
  if (verification) {
    upsertMetaTag('name', 'google-site-verification', verification);
  }

  if (params.view === 'admin') {
    document.title = `Yönetici Paneli | ${companyName}`;
    upsertMetaTag('name', 'robots', 'noindex, nofollow');
    return;
  }

  upsertMetaTag('name', 'robots', 'index, follow');

  if (params.product) {
    const p = params.product;
    const title = `${p.name} (${p.brand}) — Fiyatı & Özellikleri | ${companyName}`;
    const desc =
      p.description?.slice(0, 155) ||
      `${p.brand} ${p.name} doğrudan bayi fiyatıyla (${p.materialPrice.toLocaleString('tr-TR')} TL / ${p.unit}) Türkiye geneli sigortalı kargo ile ${companyName}'da.`;
    const canonical = `${SITE_ORIGIN}${buildProductPath(p)}`;
    const imageUrl = p.image && !p.image.startsWith('data:') ? p.image : undefined;
    const isAvailable = p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0);

    document.title = title;
    upsertMetaTag('name', 'description', desc);
    upsertCanonical(canonical);
    upsertMetaTag('property', 'og:type', 'product');
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', desc);
    upsertMetaTag('property', 'og:url', canonical);
    upsertMetaTag('name', 'twitter:title', title);
    upsertMetaTag('name', 'twitter:description', desc);
    if (imageUrl) {
      upsertMetaTag('property', 'og:image', imageUrl);
      upsertMetaTag('name', 'twitter:image', imageUrl);
    }

    upsertJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      sku: p.code || p.id,
      mpn: p.code || p.id,
      description: p.description || desc,
      ...(imageUrl ? { image: [imageUrl, ...(p.images || []).filter((u) => !u.startsWith('data:'))] } : {}),
      brand: {
        '@type': 'Brand',
        name: p.brand || companyName,
      },
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: 'TRY',
        price: Number(p.materialPrice || 0).toFixed(2),
        availability: isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: companyName,
        },
      },
    });
    return;
  }

  let title = `${companyName} — Mimari Tasarım Ürünleri & Yapı Malzemeleri`;
  let desc =
    'Doğrudan fabrika bayi fiyatıyla trend mimari ürünler, elektrik ve yapı malzemeleri, Türkiye geneli sigortalı sevkiyat ve uzman tadilat çözümleri.';
  let canonical = `${SITE_ORIGIN}/`;

  if (params.view === 'configurator') {
    title = `Mimari Tadilat & Keşif Hesaplayıcı | ${companyName}`;
    desc =
      'Şeffaf metrekare malzeme ve uzman işçilik fiyatlarıyla tadilat bütçenizi saniyeler içinde hesaplayın, ücretsiz mimari keşif randevusu oluşturun.';
    canonical = `${SITE_ORIGIN}/teklif`;
  } else if (params.view === 'landing') {
    title = `Hakkımızda & Mimari Uygulama Standartlarımız | ${companyName}`;
    desc = `${companyName} anahtar teslim mimari uygulama güvencesi, şeffaf sözleşme ve doğrudan üretici fiyat avantajı.`;
    canonical = `${SITE_ORIGIN}/tanitim`;
  }

  document.title = title;
  upsertMetaTag('name', 'description', desc);
  upsertCanonical(canonical);
  upsertMetaTag('property', 'og:type', 'website');
  upsertMetaTag('property', 'og:title', title);
  upsertMetaTag('property', 'og:description', desc);
  upsertMetaTag('property', 'og:url', canonical);
  upsertMetaTag('name', 'twitter:title', title);
  upsertMetaTag('name', 'twitter:description', desc);

  upsertJsonLd({
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: companyName,
    url: SITE_ORIGIN,
    telephone: params.settings?.supportPhone || '',
    email: params.settings?.legalInfo?.companyEmail || 'iletisim@rvoba.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      streetAddress: params.settings?.legalInfo?.companyAddress || 'Türkiye',
    },
  });
}

/**
 * Dynamically initializes Google Analytics 4 (gtag.js) and Meta Pixel if configured in Admin Settings.
 */
export function initAnalytics(config?: AnalyticsSeoSettings): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !config) return;

  const ga4Id = config.ga4MeasurementId?.trim();
  if (ga4Id && /^G-[A-Z0-9]+$/i.test(ga4Id) && window._rvobaGa4Loaded !== ga4Id) {
    window._rvobaGa4Loaded = ga4Id;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga4Id);
  }

  const pixelId = config.metaPixelId?.trim();
  if (pixelId && /^\d{8,20}$/.test(pixelId) && window._rvobaPixelLoaded !== pixelId) {
    window._rvobaPixelLoaded = pixelId;
    const inline = document.createElement('script');
    inline.textContent = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(inline);
  }
}

export function trackEcommerceEvent(
  eventName: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase',
  payload: {
    currency?: string;
    value?: number;
    transaction_id?: string;
    items?: { item_id: string; item_name: string; item_brand?: string; price?: number; quantity?: number }[];
  }
): void {
  if (typeof window === 'undefined') return;
  const currency = payload.currency || 'TRY';

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      currency,
      value: payload.value ?? 0,
      ...(payload.transaction_id ? { transaction_id: payload.transaction_id } : {}),
      items: payload.items || [],
    });
  }

  if (typeof window.fbq === 'function') {
    const fbEventMap: Record<typeof eventName, string> = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
    };
    window.fbq('track', fbEventMap[eventName], {
      currency,
      value: payload.value ?? 0,
      content_ids: (payload.items || []).map((i) => i.item_id),
      content_type: 'product',
    });
  }
}
