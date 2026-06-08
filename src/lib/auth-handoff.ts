import { ACCESS_TOKEN_KEY } from '@/constants';

export function buildDashboardHandoffUrl(token: string): string {
  const url = new URL('/dashboard', window.location.origin);
  url.searchParams.set('token', token);
  url.searchParams.set('registered', '1');
  return url.pathname + url.search;
}

export function storeAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
