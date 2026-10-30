import { Product, LeadRequest, SiteSettings, CustomerUser } from '../types';

export interface CloudStatePayload {
  updatedAt: string;
  products?: Product[];
  settings?: SiteSettings;
  leads?: LeadRequest[];
  customers?: CustomerUser[];
}

const CHANNEL_NAME = 'rvoba_live_sync_channel_v1';

// Instant zero-network cross-tab BroadcastChannel (cloud persistence is handled directly by Supabase Realtime)
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // Ignore if BroadcastChannel is not supported
}

export const syncToCloudAndTabs = (partial: Partial<CloudStatePayload>): void => {
  const payload: CloudStatePayload = {
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  try {
    broadcastChannel?.postMessage(payload);
  } catch {
    // Ignore broadcast errors
  }
};

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

  return () => {
    broadcastChannel?.removeEventListener('message', handleChannelMessage);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
