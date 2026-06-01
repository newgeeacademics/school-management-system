import type { PortalRole } from '@/lib/auth';
import type { AuthResponse } from '@/lib/api';

export function backendRoleToPortal(role: AuthResponse['role']): PortalRole | null {
  if (role === 'STUDENT') return 'student';
  if (role === 'PARENT') return 'parent';
  if (role === 'TEACHER') return 'teacher';
  return null;
}

export function portalRoleMatchesBackend(portalRole: PortalRole, backendRole: AuthResponse['role']): boolean {
  return backendRoleToPortal(backendRole) === portalRole;
}
