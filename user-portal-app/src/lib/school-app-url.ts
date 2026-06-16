/**
 * Main site (school registration + establishment login/dashboard).
 * Separate from admin-app (localhost:5175) and this user-portal (5174).
 */
export function getMainAppOrigin(): string {
  const main = import.meta.env.VITE_MAIN_APP_URL ?? import.meta.env.VITE_SCHOOL_APP_URL;
  if (main?.trim()) return main.replace(/\/$/, '');

  if (import.meta.env.PROD) {
    console.error(
      '[user-portal] VITE_MAIN_APP_URL is required in production (URL of the main Vercel site, e.g. https://your-main.vercel.app).'
    );
    return '';
  }

  return 'http://localhost:5173';
}
/** @deprecated use getMainAppOrigin */
export function getSchoolAppOrigin(): string {
  return getMainAppOrigin();
}

export function getSchoolLoginUrl(): string {
  return `${getMainAppOrigin()}/login`;
}

/** Admin console (separate Vercel project). */
export function getAdminAppOrigin(): string {
  const admin = import.meta.env.VITE_ADMIN_APP_URL;
  if (admin?.trim()) return admin.replace(/\/$/, '');

  if (import.meta.env.PROD) {
    console.error(
      '[user-portal] VITE_ADMIN_APP_URL is required in production (e.g. https://admin.newgeeacademy.com).'
    );
    return '';
  }

  return 'http://localhost:5175';
}

export function getAdminLoginUrl(): string {
  return `${getAdminAppOrigin()}/login`;
}

/** Live bus tracking app (separate Vercel project). */
export function getTrackingAppOrigin(): string {
  const tracking = import.meta.env.VITE_TRACKING_APP_URL;
  if (tracking?.trim()) return tracking.replace(/\/$/, '');

  if (import.meta.env.PROD) {
    console.error(
      '[user-portal] VITE_TRACKING_APP_URL is required in production (e.g. https://tracker.newgeeacademy.com).'
    );
    return '';
  }

  return 'http://localhost:5179';
}
