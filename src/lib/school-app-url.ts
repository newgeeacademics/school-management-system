export function getMainAppOrigin(): string {
  const main = import.meta.env.VITE_MAIN_APP_URL ?? import.meta.env.VITE_SCHOOL_APP_URL;
  if (main?.trim()) return main.replace(/\/$/, '');

  if (import.meta.env.PROD) {
    console.error(
      '[tracking-app] VITE_MAIN_APP_URL is required in production (URL of the main site, e.g. https://www.newgee.com).'
    );
    return '';
  }

  return 'http://localhost:5173';
}

export function getSchoolAppOrigin(): string {
  return getMainAppOrigin();
}

export function getSchoolLoginUrl(): string {
  return `${getMainAppOrigin()}/login`;
}

export function getUserPortalOrigin(): string {
  const portal = import.meta.env.VITE_USER_PORTAL_URL;
  if (portal?.trim()) return portal.replace(/\/$/, '');

  if (import.meta.env.PROD) return '';

  return 'http://localhost:5174';
}
