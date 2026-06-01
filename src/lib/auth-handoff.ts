import { ACCESS_TOKEN_KEY } from '@/constants';
import { setStoredRole } from '@/lib/auth';

/** After school registration, open dashboard on this app (same origin). */
export function buildDashboardHandoffUrl(token: string): string {
  const url = new URL('/dashboard', window.location.origin);
  url.searchParams.set('token', token);
  url.searchParams.set('registered', '1');
  return url.toString();
}

/** Accept JWT from ?token= on /login or /dashboard after registration. */
export function consumeRegistrationTokenFromUrl(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return false;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  setStoredRole('admin');

  params.delete('token');
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);

  return true;
}

export function storeAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
