import type { PortalRole } from '@/lib/auth';


export function backendRoleToPortal(role: string): PortalRole | null {
  switch (role.toUpperCase()) {
    case 'STUDENT':
      return 'student';
    case 'PARENT':
      return 'parent';
    case 'TEACHER':
      return 'teacher';
    default:
      return null;
  }
}


export function canManageGrades(role: PortalRole | undefined, apiCanEdit: boolean): boolean {
  return apiCanEdit && role === 'teacher';
}

export function isParentReadOnly(role: PortalRole | undefined): boolean {
  return role === 'parent';
}

export function defaultPortalPath(_role: PortalRole): string {
  return '/accueil';
}
