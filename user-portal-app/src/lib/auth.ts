import { clearAccessToken, isBackendApiConfigured, setAccessToken } from '@/lib/api';

const SESSION_KEY = 'newgee_portal_session_v1';

export type PortalRole = 'student' | 'parent' | 'teacher';

export type PortalSession = {
  role: PortalRole;
  email: string;
  name?: string;
  userId?: string;
  token?: string;
  emailHint?: string;
};

export function getPortalSession(): PortalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<PortalSession>;
    if (data.role === 'student' || data.role === 'parent' || data.role === 'teacher') {
      if (isBackendApiConfigured() && !data.token) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return {
        role: data.role,
        email: data.email ?? data.emailHint ?? '',
        name: data.name,
        userId: data.userId,
        token: data.token,
        emailHint: data.emailHint ?? data.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setPortalSession(session: PortalSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (session.token) {
    setAccessToken(session.token);
  }
}

export function clearPortalSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  clearAccessToken();
}
