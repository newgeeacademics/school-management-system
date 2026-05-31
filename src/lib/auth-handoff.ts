import { ACCESS_TOKEN_KEY } from '@/constants';
import { getAdminLoginUrl } from '@/lib/app-urls';

/** Pass JWT to admin app after cross-domain registration (main → admin). */
export function buildAdminHandoffUrl(token: string): string {
  const url = new URL(getAdminLoginUrl());
  url.searchParams.set('token', token);
  url.searchParams.set('registered', '1');
  return url.toString();
}

export function storeAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
