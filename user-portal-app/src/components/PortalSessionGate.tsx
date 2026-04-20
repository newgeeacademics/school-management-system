import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortalSession } from '@/lib/auth';
import { useTranslation } from '@/i18n';

export function PortalSessionGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!getPortalSession()) navigate('/connexion', { replace: true });
  }, [navigate]);

  if (!getPortalSession()) {
    return (
      <div className='portal-shell flex min-h-svh items-center justify-center p-6 text-sm text-muted-foreground'>
        {t('common.loading')}
      </div>
    );
  }

  return children;
}
