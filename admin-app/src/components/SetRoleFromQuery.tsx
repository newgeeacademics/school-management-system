import { useEffect } from 'react';
import { setStoredRole } from '@/lib/auth';

/**
 * When the user lands from the separate user-portal app, the role is passed as `?setRole=`.
 * Applies it to localStorage and strips the query param without a full reload.
 */
export function SetRoleFromQuery() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('setRole');
    if (r === 'student' || r === 'parent' || r === 'teacher') {
      setStoredRole(r);
      params.delete('setRole');
      const qs = params.toString();
      const path = window.location.pathname;
      window.history.replaceState({}, '', `${path}${qs ? `?${qs}` : ''}${window.location.hash}`);
    }
  }, []);
  return null;
}
