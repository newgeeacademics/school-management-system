import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminLoginUrl } from '@/lib/app-urls';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/button';

/**
 * Main site has no admin UI — forwards to the separate admin Vercel app (/login).
 */
export function AdminLoginRedirectPage() {
  const { t } = useTranslation();
  const adminLoginUrl = getAdminLoginUrl();
  const needsConfig =
    import.meta.env.PROD && !import.meta.env.VITE_ADMIN_APP_URL?.trim();

  useEffect(() => {
    if (!needsConfig) {
      const params = window.location.search;
      const hash = window.location.hash;
      window.location.replace(`${adminLoginUrl}${params}${hash}`);
    }
  }, [adminLoginUrl, needsConfig]);

  if (needsConfig) {
    return (
      <div className='min-h-svh flex flex-col items-center justify-center gap-4 px-6 text-center'>
        <p className='text-lg font-semibold'>Console admin (application séparée)</p>
        <p className='text-sm text-muted-foreground max-w-md'>
          Sur le projet Vercel <strong>main</strong>, définissez{' '}
          <strong>VITE_ADMIN_APP_URL</strong> avec l’URL de votre projet admin (branche{' '}
          <code className='text-xs'>admin</code>), puis redéployez.
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
      <a href={adminLoginUrl} className='text-sm text-primary underline'>
        {t('landing.signIn')}
      </a>
    </div>
  );
}
