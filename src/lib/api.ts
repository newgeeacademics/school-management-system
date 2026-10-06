import { ACCESS_TOKEN_KEY, BASE_URL, isBackendApiConfigured } from '@/constants';
import { clearTrackingSession } from '@/lib/auth';

export { isBackendApiConfigured };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion internet puis réessayez.',
      0
    );
  }
  if (res.status === 401 && token && !path.startsWith('/api/auth/')) {
    handleExpiredTrackingSession();
    throw new ApiError('Votre session a expiré. Reconnectez-vous.', 401);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      (body && typeof body === 'object' && 'error' in body && String(body.error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  // Some endpoints answer 200 with an empty body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

let trackingSessionExpiryHandled = false;

/** Token rejected by the API: drop the session once and return to the sign-in page. */
function handleExpiredTrackingSession(): void {
  if (trackingSessionExpiryHandled || typeof window === 'undefined') return;
  clearTrackingSession();
  clearAccessToken();
  if (window.location.pathname !== '/connexion') {
    trackingSessionExpiryHandled = true;
    window.location.assign('/connexion?expired=1');
  }
}

/** Exchange a Google Identity Services ID token for a session. */
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export type AuthResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  loginId?: string | null;
  role: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'STAFF';
};

export async function loginWithIdentifier(identifier: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: identifier, password }),
  });
}

/** @deprecated Use loginWithIdentifier */
export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  return loginWithIdentifier(email, password);
}
