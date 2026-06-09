import type { UserRole } from '@/lib/auth';

export const FINANCE_APP_ROLES: UserRole[] = ['admin', 'teacher', 'staff'];

export type AccessLevel = 'NONE' | 'READ' | 'WRITE';

export type MyRoleAccess = {
  role: string;
  modules: Record<string, AccessLevel>;
};

export function isFinanceAppRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'teacher' || role === 'staff';
}

export function canAccessFinanceModule(access: MyRoleAccess | null): boolean {
  if (!access) return false;
  const level = access.modules?.FINANCE_OFFICE ?? access.modules?.finance_office;
  return level === 'READ' || level === 'WRITE';
}

export function canWriteFinance(access: MyRoleAccess | null): boolean {
  if (!access) return false;
  const level = access.modules?.FINANCE_OFFICE ?? access.modules?.finance_office;
  return level === 'WRITE';
}
