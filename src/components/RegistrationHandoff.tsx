import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumeRegistrationTokenFromUrl } from '@/lib/auth-handoff';

/** After main-site registration, accept ?token= and go to dashboard. */
export function RegistrationHandoff() {
  const navigate = useNavigate();

  useEffect(() => {
    if (consumeRegistrationTokenFromUrl()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return null;
}
