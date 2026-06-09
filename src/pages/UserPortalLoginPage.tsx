import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { AppLogo } from '@/components/AppLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserPortalSignInForm } from '@/components/refine-ui/form/user-portal-sign-in-form';
import { getPortalSession } from '@/lib/auth';
import { getSchoolAppOrigin } from '@/lib/school-app-url';

import './auth-page.css';

function UserPortalIllustrationSet() {
  const { t } = useTranslation();
  const heroImage = useMemo(
    () =>
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1800&q=80',
    []
  );

  return (
    <aside className='auth-page__visual' aria-hidden>
      <img src={heroImage} alt='' />
      <div className='auth-page__visual-overlay' />
      <div className='auth-page__visual-copy'>
        <h2>{t('userPortal.illustrationTitle')}</h2>
        <p>{t('userPortal.illustrationCaption')}</p>
      </div>
    </aside>
  );
}

export function UserPortalLoginPage() {
  const navigate = useNavigate();
  const schoolOrigin = getSchoolAppOrigin();

  useEffect(() => {
    if (getPortalSession()) navigate('/accueil', { replace: true });
  }, [navigate]);

  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <header className='auth-page__top auth-page__top--split'>
          <a href={`${schoolOrigin}/`} className='no-underline'>
            <AppLogo name='NewGee Familles' />
          </a>
          <LanguageSwitcher />
        </header>

        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <UserPortalSignInForm variant='embedded' />
          </div>
        </main>
      </section>

      <UserPortalIllustrationSet />
    </div>
  );
}
