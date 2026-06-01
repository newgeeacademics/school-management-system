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
      <div className='min-h-svh flex flex-col items-center justify-center gap-4 px-6 text-center'>
        <p className='text-lg font-semibold'>Portail familles non configuré</p>
        <p className='text-sm text-muted-foreground max-w-md'>
          Définissez <strong>VITE_USER_PORTAL_URL</strong> sur Vercel (URL du projet portail), puis redéployez.
        </p>
        <Button asChild variant='outline'>
          <Link to='/'>{t('common.goBack')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='min-h-svh flex flex-col items-center justify-center gap-2 px-6'>
      <p className='text-muted-foreground'>{t('common.loading')}</p>
      <a href={portalUrl} className='text-sm text-primary underline'>
        {t('landing.navUserPortal')}
      </a>
    </div>
  );
}
