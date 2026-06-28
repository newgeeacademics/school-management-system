import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserPortalSignInForm } from '@/components/refine-ui/form/user-portal-sign-in-form';
import { getPortalSession } from '@/lib/auth';
import { defaultPortalPath } from '@/lib/portal-role';
import { getMainAppOrigin } from '@/lib/school-app-url';
import logoSrc from '@/assets/logo/newgee-logo.png';

import './auth-page.css';

function UserPortalIllustrationSet() {
  const { t } = useTranslation();
  const heroImage = useMemo(
    () =>
      'https://images.unsplash.com/photo-1509062520756-531426a66e0b?auto=format&fit=crop&w=1800&q=80',
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
  const mainOrigin = getMainAppOrigin();

  useEffect(() => {
    const session = getPortalSession();
    if (session) navigate(defaultPortalPath(session.role), { replace: true });
  }, [navigate]);

  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <div className='auth-page__lang-fab'>
          <LanguageSwitcher />
        </div>

        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <a href={`${mainOrigin}/`} className='auth-page__brand-link auth-page__brand-link--hero'>
              <img src={logoSrc} alt='NewGee' className='auth-page__logo auth-page__logo--hero' />
            </a>
            <UserPortalSignInForm variant='embedded' />
          </div>
        </main>
      </section>

      <UserPortalIllustrationSet />
    </div>
  );
}
