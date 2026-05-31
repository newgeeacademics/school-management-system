/** Admin console (separate Vite app in admin-app/). */
export function getAdminAppOrigin(): string {
  return (import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5175').replace(/\/$/, '');
}

export function getAdminLoginUrl(): string {
  return `${getAdminAppOrigin()}/login`;
}

export function getAdminDashboardUrl(): string {
  return `${getAdminAppOrigin()}/dashboard`;
}

/** User portal app (students, parents, teachers). */
export function getUserPortalOrigin(): string {
  return (import.meta.env.VITE_USER_PORTAL_URL ?? 'http://localhost:5174').replace(/\/$/, '');
}

export function getUserPortalLoginUrl(): string {
  return `${getUserPortalOrigin()}/connexion`;
}
