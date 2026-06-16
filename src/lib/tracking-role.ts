import type { AuthResponse } from '@/lib/api';
import type { TrackingRole } from '@/lib/auth';

/** Map backend account role to tracking app session role (no user-facing picker). */
export function backendRoleToTracking(role: AuthResponse['role']): TrackingRole | null {
  if (role === 'PARENT') return 'parent';
  if (role === 'TEACHER') return 'teacher';
  if (role === 'ADMIN' || role === 'STAFF') return 'driver';
  return null;
}
