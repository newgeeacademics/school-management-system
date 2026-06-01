import { useEffect } from 'react';
import { buildAdminHandoffUrl, storeAccessToken } from '@/lib/auth-handoff';
import { getAdminAppOrigin } from '@/lib/app-urls';

/** Forwards ?token= from registration to the admin app when configured. */
export function LoginTokenHandoff() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    storeAccessToken(token);

    const adminConfigured = Boolean(import.meta.env.VITE_ADMIN_APP_URL?.trim());
    const adminOrigin = getAdminAppOrigin();

    if (adminConfigured && !adminOrigin.includes('localhost')) {
      window.location.replace(buildAdminHandoffUrl(token));
      return;
    }

    params.delete('token');
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', next);
  }, []);

  return null;
}
