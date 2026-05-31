/**
 * Test-mode auth: role is chosen on login and stored in localStorage.
 * Later this will be replaced by backend-managed roles.
 */

const STORAGE_KEY = 'classroom_test_role';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export function getStoredRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'admin' || v === 'teacher' || v === 'parent' || v === 'student') return v;
  return null;
}

export function setStoredRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(STORAGE_KEY);
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
