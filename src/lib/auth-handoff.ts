import { ACCESS_TOKEN_KEY } from '@/constants';
import { setStoredRole } from '@/lib/auth';

/** Accept JWT passed from main site after school registration. */
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
