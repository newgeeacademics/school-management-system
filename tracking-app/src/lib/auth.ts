import { clearAccessToken, isBackendApiConfigured, setAccessToken } from '@/lib/api';

const SESSION_KEY = 'newgee_tracking_session_v1';

export type TrackingRole = 'parent' | 'teacher' | 'driver';

export type TrackingSession = {
  role: TrackingRole;
  email: string;
  name?: string;
  userId?: string;
  token?: string;
  backendRole?: string;
};

export function getTrackingSession(): TrackingSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<TrackingSession>;
    if (data.role === 'parent' || data.role === 'teacher' || data.role === 'driver') {
      if (isBackendApiConfigured() && !data.token) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return {
        role: data.role,
        email: data.email ?? '',
        name: data.name,
        userId: data.userId,
        token: data.token,
        backendRole: data.backendRole,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setTrackingSession(session: TrackingSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (session.token) {
    setAccessToken(session.token);
  }
}

export function clearTrackingSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  clearAccessToken();
}

export function canDrive(session: TrackingSession | null): boolean {
  if (!session?.backendRole) return false;
  return ['ADMIN', 'STAFF', 'TEACHER'].includes(session.backendRole);
}
