/**
 * Session role and user profile (from production API login).
 */

import { ACCESS_TOKEN_KEY } from '@/constants';

const STORAGE_KEY = 'classroom_test_role';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'staff';

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId?: string;
};

export function mapApiRoleToUserRole(role: unknown): UserRole | null {
  const value = String(role ?? '').toUpperCase();
  if (value === 'ADMIN') return 'admin';
  if (value === 'TEACHER') return 'teacher';
  if (value === 'PARENT') return 'parent';
  if (value === 'STUDENT') return 'student';
  if (value === 'STAFF') return 'staff';
  return null;
}

export type AuthLoginResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
};

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

export function getStoredRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const fromUser = getStoredUser()?.role;
  if (fromUser) return fromUser;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'admin' || v === 'teacher' || v === 'parent' || v === 'student' || v === 'staff') return v;
  return null;
}

export function setStoredRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StoredUser>;
    if (!data.id || !data.email || !data.role) return null;
    if (
      data.role !== 'admin' &&
      data.role !== 'teacher' &&
      data.role !== 'parent' &&
      data.role !== 'student' &&
      data.role !== 'staff'
    ) {
      return null;
    }
    return {
      id: data.id,
      email: data.email,
      name: data.name ?? data.email,
      role: data.role,
      schoolId: data.schoolId,
    };
  } catch {
    return null;
  }
}

const STUDENT_ID_KEY = 'classroom_test_student_id';

/** When role is student, which student record represents the current user. */
export function getStoredStudentId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STUDENT_ID_KEY);
}

export function setStoredStudentId(id: string): void {
  localStorage.setItem(STUDENT_ID_KEY, id);
}

export function clearStoredStudentId(): void {
  localStorage.removeItem(STUDENT_ID_KEY);
}
