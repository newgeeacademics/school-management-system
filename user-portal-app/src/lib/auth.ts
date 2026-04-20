const SESSION_KEY = 'newgee_portal_session_v1';

export type PortalRole = 'student' | 'parent' | 'teacher';

export type PortalSession = {
  role: PortalRole;
  /** Set after real auth; optional in démo. */
  emailHint?: string;
};

export function getPortalSession(): PortalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<PortalSession>;
    if (data.role === 'student' || data.role === 'parent' || data.role === 'teacher') {
      return { role: data.role, emailHint: data.emailHint };
    }
    return null;
  } catch {
    return null;
  }
}

export function setPortalSession(session: PortalSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearPortalSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
