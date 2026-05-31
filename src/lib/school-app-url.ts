/** Admin console (separate app in admin-app/). */
export function getAdminAppOrigin(): string {
  return (
    import.meta.env.VITE_ADMIN_APP_URL ??
    import.meta.env.VITE_SCHOOL_APP_URL ??
    'http://localhost:5175'
  ).replace(/\/$/, '');
}

/** @deprecated use getAdminAppOrigin */
export function getSchoolAppOrigin(): string {
  return getAdminAppOrigin();
}

export function getAdminLoginUrl(): string {
  return `${getAdminAppOrigin()}/login`;
}
