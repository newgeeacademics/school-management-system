import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';
import { parseApiErrorResponse, wrapFetchError } from '@/lib/api-error';
import {
  clearStoredRole,
  setStoredRole,
  type StoredUser,
  type UserRole,
} from '@/lib/auth';

export type AuthLoginResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
};

export function mapApiRoleToUserRole(role: unknown): UserRole | null {
  const value = String(role ?? '').toUpperCase();
  if (value === 'ADMIN') return 'admin';
  if (value === 'TEACHER') return 'teacher';
  if (value === 'PARENT') return 'parent';
  if (value === 'STUDENT') return 'student';
  return null;
}

export function isBackendApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthLoginResponse> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (!res.ok) {
      throw new Error(await parseApiErrorResponse(res, 'Connexion impossible.'));
    }
    return (await res.json()) as AuthLoginResponse;
  } catch (err) {
    throw wrapFetchError(err, 'Connexion impossible.');
  }
}

export function persistAuthSession(auth: AuthLoginResponse): StoredUser | null {
  const role = mapApiRoleToUserRole(auth.role);
  if (!role) return null;

  localStorage.setItem(ACCESS_TOKEN_KEY, auth.token);
  const user: StoredUser = {
    id: auth.id,
    email: auth.email,
    name: auth.name,
    role,
    schoolId: auth.schoolId,
  };
  localStorage.setItem('user', JSON.stringify(user));
  setStoredRole(role);
  return user;
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('user');
  clearStoredRole();
}
