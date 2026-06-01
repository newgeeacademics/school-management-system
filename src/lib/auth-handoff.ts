import { ACCESS_TOKEN_KEY } from '@/constants';
import { getAdminLoginUrl } from '@/lib/app-urls';

/** Pass JWT to admin app after cross-domain registration (main → admin). */
export function buildAdminHandoffUrl(token: string): string {
  const adminBase = import.meta.env.VITE_ADMIN_APP_URL?.trim();
  const loginBase = adminBase
    ? `${adminBase.replace(/\/$/, '')}/login`
    : typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : getAdminLoginUrl();

  const url = new URL(loginBase);
  url.searchParams.set('token', token);
  url.searchParams.set('registered', '1');
  return url.toString();
}

export function storeAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
