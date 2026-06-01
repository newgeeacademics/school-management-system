/** Admin console (separate Vite app in admin-app/). */
function readEnvUrl(key: string, devFallback: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv]?.trim();
  if (value) return value.replace(/\/$/, '');
  if (import.meta.env.PROD) {
    console.warn(`[NewGee] Missing ${key} — set it in Vercel environment variables and redeploy.`);
  }
  return devFallback.replace(/\/$/, '');
}

export function getAdminAppOrigin(): string {
  return readEnvUrl('VITE_ADMIN_APP_URL', 'http://localhost:5175');
}

export function getAdminLoginUrl(): string {
  return `${getAdminAppOrigin()}/login`;
}

export function getAdminDashboardUrl(): string {
  return `${getAdminAppOrigin()}/dashboard`;
}

/** User portal app (students, parents, teachers). */
export function getUserPortalOrigin(): string {
  return readEnvUrl('VITE_USER_PORTAL_URL', 'http://localhost:5174');
}

export function getUserPortalLoginUrl(): string {
  return `${getUserPortalOrigin()}/connexion`;
}

/** True when production build is missing cross-app URL configuration. */
export function isCrossAppConfigIncomplete(): boolean {
  if (!import.meta.env.PROD) return false;
  return !import.meta.env.VITE_ADMIN_APP_URL?.trim() || !import.meta.env.VITE_USER_PORTAL_URL?.trim();
}
