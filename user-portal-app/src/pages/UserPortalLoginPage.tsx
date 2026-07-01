import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserPortalSignInForm } from '@/components/refine-ui/form/user-portal-sign-in-form';
import { getPortalSession } from '@/lib/auth';
import { defaultPortalPath } from '@/lib/portal-role';
import { getMainAppOrigin } from '@/lib/school-app-url';
import logoSrc from '@/assets/logo/newgee-logo.png';

import './auth-page.css';

export function UserPortalLoginPage() {
  const navigate = useNavigate();
  const mainOrigin = getMainAppOrigin();

  useEffect(() => {
    const session = getPortalSession();
    if (session) navigate(defaultPortalPath(session.role), { replace: true });
  }, [navigate]);

  return (
    <div className='auth-page auth-page--mobile'>
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
    </div>
  );
}
