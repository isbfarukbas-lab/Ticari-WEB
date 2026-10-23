import { Product, LeadRequest, SiteSettings, CustomerUser } from '../types';

export interface CloudStatePayload {
  updatedAt: string;
  products?: Product[];
  settings?: SiteSettings;
  leads?: LeadRequest[];
  customers?: CustomerUser[];
}

const CHANNEL_NAME = 'rvoba_live_sync_channel_v1';
const CLOUD_URL_STORAGE_KEY = 'rvoba_cloud_endpoint_v1';

// Cross-tab & local instant broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // Ignore if BroadcastChannel is not supported
}

export const normalizeCloudEndpoint = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  // Automatically append /rvoba_state.json for Firebase Realtime Database root URLs
  if (
    (trimmed.includes('firebaseio.com') || trimmed.includes('firebasedatabase.app')) &&
    !trimmed.endsWith('.json')
  ) {
    return `${trimmed.replace(/\/+$/, '')}/rvoba_state.json`;
  }
  return trimmed;
};

export const getCustomCloudEndpoint = (settings?: SiteSettings): string => {
  try {
    const fromStorage = localStorage.getItem(CLOUD_URL_STORAGE_KEY);
    if (fromStorage) return fromStorage;
    if (settings?.cloudEndpoint) return normalizeCloudEndpoint(settings.cloudEndpoint);
    const settingsRaw = localStorage.getItem('rvoba_settings_v1');
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw);
      if (parsed.cloudEndpoint) return normalizeCloudEndpoint(parsed.cloudEndpoint);
    }
    return '';
  } catch {
    return '';
  }
};

export const setCustomCloudEndpoint = (url: string): void => {
  try {
    const normalized = normalizeCloudEndpoint(url);
    if (normalized) {
      localStorage.setItem(CLOUD_URL_STORAGE_KEY, normalized);
    } else {
      localStorage.removeItem(CLOUD_URL_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Broadcasts updates immediately across open tabs/windows and pushes to cloud endpoint if configured
 */
export const syncToCloudAndTabs = async (
  partial: Partial<CloudStatePayload>
): Promise<boolean> => {
  const payload: CloudStatePayload = {
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  // 1. Broadcast to any other open tabs immediately
  try {
    broadcastChannel?.postMessage(payload);
  } catch {
    // Ignore
  }

  // 2. Push to remote cloud endpoint if configured
  const endpoint = getCustomCloudEndpoint();
  if (!endpoint) return true;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    // Merge with current full snapshot in localStorage so remote always has complete state
    const fullSnapshot: CloudStatePayload = {
      updatedAt: payload.updatedAt,
      products:
        payload.products !== undefined
          ? payload.products
          : JSON.parse(localStorage.getItem('rvoba_products_v1') || 'null') ?? undefined,
      settings:
        payload.settings !== undefined
          ? payload.settings
          : JSON.parse(localStorage.getItem('rvoba_settings_v1') || 'null') ?? undefined,
      leads:
        payload.leads !== undefined
          ? payload.leads
          : JSON.parse(localStorage.getItem('rvoba_leads_v1') || 'null') ?? undefined,
      customers:
        payload.customers !== undefined
          ? payload.customers
          : JSON.parse(localStorage.getItem('rvoba_customers_v1') || 'null') ?? undefined,
    };

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(fullSnapshot),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Fetches latest state from remote cloud endpoint if configured
 */
export const fetchFromCloud = async (): Promise<CloudStatePayload | null> => {
  const endpoint = getCustomCloudEndpoint();
  if (!endpoint) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    // Handle npoint / jsonbin wrapper if nested under record
    const record = data?.record ? data.record : data;
    if (record && typeof record === 'object') {
      return record as CloudStatePayload;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Subscribe to real-time updates across tabs and periodic cloud polling
 */
export const subscribeToLiveSync = (
  onUpdate: (data: CloudStatePayload) => void
): (() => void) => {
  const handleChannelMessage = (ev: MessageEvent<CloudStatePayload>) => {
    if (ev.data && typeof ev.data === 'object') {
      onUpdate(ev.data);
    }
  };

  const handleStorageEvent = (ev: StorageEvent) => {
    if (!ev.newValue) return;
    try {
      if (ev.key === 'rvoba_products_v1') {
        onUpdate({ updatedAt: new Date().toISOString(), products: JSON.parse(ev.newValue) });
      } else if (ev.key === 'rvoba_settings_v1') {
        onUpdate({ updatedAt: new Date().toISOString(), settings: JSON.parse(ev.newValue) });
      } else if (ev.key === 'rvoba_leads_v1') {
        onUpdate({ updatedAt: new Date().toISOString(), leads: JSON.parse(ev.newValue) });
      } else if (ev.key === 'rvoba_customers_v1') {
        onUpdate({ updatedAt: new Date().toISOString(), customers: JSON.parse(ev.newValue) });
      }
    } catch {
      // Ignore parse errors
    }
  };

  broadcastChannel?.addEventListener('message', handleChannelMessage);
  window.addEventListener('storage', handleStorageEvent);

  // Initial pull from cloud if configured
  fetchFromCloud().then((remote) => {
    if (remote) onUpdate(remote);
  });

  // Periodic background cloud sync every 15 seconds if cloud endpoint is active
  let lastRemoteUpdatedAt = '';
  const pollInterval = window.setInterval(async () => {
    if (!getCustomCloudEndpoint()) return;
    const remote = await fetchFromCloud();
    if (remote && remote.updatedAt && remote.updatedAt !== lastRemoteUpdatedAt) {
      lastRemoteUpdatedAt = remote.updatedAt;
      onUpdate(remote);
    }
  }, 15000);

  return () => {
    broadcastChannel?.removeEventListener('message', handleChannelMessage);
    window.removeEventListener('storage', handleStorageEvent);
    window.clearInterval(pollInterval);
  };
};
