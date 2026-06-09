/** Public marketing / school registration app (repo root). */
export function getMainAppOrigin(): string {
  return (import.meta.env.VITE_MAIN_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
}
