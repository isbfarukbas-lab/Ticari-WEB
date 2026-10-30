import { Product } from '../types';
import { supabase } from '../services/supabaseClient';

export type MediaFolder = 'products' | 'projects' | 'requests';

export function isBase64DataUrl(value?: string): boolean {
  return Boolean(value && value.startsWith('data:image/'));
}

function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let objectUrl: string | null = null;

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }
  });
}

/**
 * Resize and compress any image File or Base64 DataURL into modern WebP (~50-110 KB).
 */
export async function compressImageToWebP(
  source: File | string,
  maxDimension = 1600,
  quality = 0.84
): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await loadImageElement(source);

  let width = img.naturalWidth || img.width || 1200;
  let height = img.naturalHeight || img.height || 1200;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context kullanılamıyor');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/webp', quality);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('WebP dönüştürme başarısız oldu'));
        }
      },
      'image/webp',
      quality
    );
  });

  return { blob, dataUrl };
}

/**
 * Compress an image to WebP and upload it to Supabase Storage CDN bucket `product-media`.
 * Uses `upsert: false` with unique filenames so existing CDN assets cannot be overwritten.
 */
export async function uploadOptimizedImage(
  source: File | string,
  folder: MediaFolder = 'products',
  maxDimension = 1600
): Promise<string> {
  const { blob, dataUrl } = await compressImageToWebP(source, maxDimension, 0.84);
  const randomSuffix = Math.random().toString(36).slice(2, 9);
  const uniquePath = `${folder}/${Date.now()}-${randomSuffix}.webp`;

  try {
    const { error } = await supabase.storage.from('product-media').upload(uniquePath, blob, {
      upsert: false,
      contentType: 'image/webp',
      cacheControl: '31536000',
    });

    if (error) {
      console.warn('Supabase Storage upload warning, falling back to compressed WebP:', error.message);
      return dataUrl;
    }

    const { data } = supabase.storage.from('product-media').getPublicUrl(uniquePath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
    return dataUrl;
  } catch (err) {
    console.warn('Supabase Storage network fallback:', err);
    return dataUrl;
  }
}

/**
 * Automatically migrates any legacy Base64 data:image/... strings on a Product
 * (`image`, `images[]`, `roomImage`, `variants[].image`) to Supabase Storage CDN WebP URLs.
 */
export async function migrateProductImagesToCdn(
  product: Product
): Promise<{ product: Product; changed: boolean }> {
  let changed = false;
  const next: Product = { ...product };

  const cache = new Map<string, string>();
  const convertOne = async (val?: string): Promise<string | undefined> => {
    if (!val || !isBase64DataUrl(val)) return val;
    const cached = cache.get(val);
    if (cached) {
      changed = true;
      return cached;
    }
    const uploaded = await uploadOptimizedImage(val, 'products');
    if (uploaded && !isBase64DataUrl(uploaded)) {
      cache.set(val, uploaded);
      changed = true;
      return uploaded;
    }
    return val;
  };

  if (isBase64DataUrl(next.image)) {
    next.image = (await convertOne(next.image)) || next.image;
  }

  if (Array.isArray(next.images) && next.images.some((img) => isBase64DataUrl(img))) {
    const updatedGallery: string[] = [];
    for (const img of next.images) {
      updatedGallery.push((await convertOne(img)) || img);
    }
    next.images = updatedGallery;
  }

  if (isBase64DataUrl(next.roomImage)) {
    next.roomImage = await convertOne(next.roomImage);
  }

  if (Array.isArray(next.variants) && next.variants.some((v) => isBase64DataUrl(v.image))) {
    const updatedVariants = [];
    for (const v of next.variants) {
      if (isBase64DataUrl(v.image)) {
        updatedVariants.push({ ...v, image: await convertOne(v.image) });
      } else {
        updatedVariants.push(v);
      }
    }
    next.variants = updatedVariants;
  }

  return { product: next, changed };
}
