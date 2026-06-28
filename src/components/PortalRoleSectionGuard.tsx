import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPortalSession } from '@/lib/auth';
import { defaultPortalPath } from '@/lib/portal-role';
import { isSectionAllowedForRole, sectionFromPath } from '@/lib/portal-sections';

/** Redirects users away from sections their role cannot access. */
export function PortalRoleSectionGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getPortalSession();

  useEffect(() => {
    if (!session) return;
    const section = sectionFromPath(location.pathname);
    if (!isSectionAllowedForRole(section, session.role)) {
      navigate(defaultPortalPath(session.role), { replace: true });
    }
  }, [location.pathname, navigate, session]);

  return children;
}
