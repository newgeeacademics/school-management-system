import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserPortalLoginUrl } from '@/lib/app-urls';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/button';

export function UserPortalRedirectPage() {
  const { t } = useTranslation();
  const portalUrl = getUserPortalLoginUrl();
  const isLocalhost = portalUrl.includes('localhost');

  useEffect(() => {
    if (!isLocalhost) {
      window.location.replace(portalUrl);
    }
  }, [portalUrl, isLocalhost]);

  if (isLocalhost && import.meta.env.PROD) {
    return (
      <div className='flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center'>
        <p className='text-lg font-semibold'>Portail familles non configuré</p>
        <p className='max-w-md text-sm text-muted-foreground'>
          Définissez <strong>VITE_USER_PORTAL_URL</strong> sur Vercel, puis redéployez.
        </p>
        <Button asChild variant='outline'>
          <Link to='/login'>Retour</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-2 px-6'>
      <p className='text-muted-foreground'>{t('common.loading')}</p>
      <a href={portalUrl} className='text-sm text-primary underline'>
        {t('landing.navUserPortal')}
      </a>
    </div>
  );
}
