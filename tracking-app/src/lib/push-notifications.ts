import { apiFetch } from '@/lib/api';

const PUSH_DISMISSED_KEY = 'newgee_tracking_push_dismissed_v1';

export type PushConfig = {
  configured: boolean;
  publicKey: string;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function wasPushPromptDismissed(): boolean {
  return localStorage.getItem(PUSH_DISMISSED_KEY) === '1';
}

export function dismissPushPrompt(): void {
  localStorage.setItem(PUSH_DISMISSED_KEY, '1');
}

export async function fetchPushConfig(): Promise<PushConfig> {
  return apiFetch<PushConfig>('/api/push/config');
}

export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const config = await fetchPushConfig();
  if (!config.configured || !config.publicKey) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  const keys = json.keys;
  if (!json.endpoint || !keys?.p256dh || !keys.auth) {
    return false;
  }

  await apiFetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    }),
  });

  localStorage.removeItem(PUSH_DISMISSED_KEY);
  return true;
}
