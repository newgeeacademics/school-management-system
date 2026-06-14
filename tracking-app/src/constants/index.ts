export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'dev_access_token';

export function isBackendApiConfigured(): boolean {
  if (import.meta.env.DEV) return true;
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}
