/** Main NewGee site (landing, registration, school console). */
export function getMainAppOrigin(): string {
  const fromEnv = import.meta.env.VITE_MAIN_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  // Never send production users to a developer's localhost.
  return import.meta.env.PROD ? 'https://www.newgeeacademy.com' : 'http://localhost:5173';
}
