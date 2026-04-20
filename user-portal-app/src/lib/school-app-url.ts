/** Base URL of the school / admin web app (classroom-app). Used for links and post-login redirect. */
export function getSchoolAppOrigin(): string {
  return (import.meta.env.VITE_SCHOOL_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
}
