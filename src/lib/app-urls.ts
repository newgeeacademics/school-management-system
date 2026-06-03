function readEnvUrl(key: string, devFallback: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv]?.trim();
  if (value) return value.replace(/\/$/, '');
  if (import.meta.env.PROD) {
    console.warn(`[NewGee Admin] Missing ${key} — set it in Vercel environment variables and redeploy.`);
  }
  return devFallback.replace(/\/$/, '');
}

/** User portal (students, parents, teachers) — separate Vercel project. */
export function getUserPortalOrigin(): string {
  return readEnvUrl('VITE_USER_PORTAL_URL', 'http://localhost:5174');
}

export function getUserPortalLoginUrl(): string {
  return `${getUserPortalOrigin()}/connexion`;
}

export function isUserPortalConfigIncomplete(): boolean {
  if (!import.meta.env.PROD) return false;
  return !import.meta.env.VITE_USER_PORTAL_URL?.trim();
}
