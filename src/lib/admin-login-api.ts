import { BASE_URL } from '@/constants';

export function isBackendApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

export async function loginAdmin(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: string }).error)
        : 'Invalid email or password';
    throw new Error(message);
  }

  return res.json() as Promise<{ token: string; role: string; id: string; name: string; email: string }>;
}
