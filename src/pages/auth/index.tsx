import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { SignInForm } from '@/components/refine-ui/form/sign-in-form';
import { AppLogo } from '@/components/AppLogo';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';

import '../auth-page.css';

function AuthIllustrationSet() {
  const { t } = useTranslation();
  const heroImage = useMemo(
    () =>
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80',
    []
  );

  return (
    <aside className='auth-page__visual' aria-hidden>
      <img src={heroImage} alt='' />
      <div className='auth-page__visual-overlay' />
      <div className='auth-page__visual-copy'>
        <h2>{t('landing.brandName')}</h2>
        <p>{t('auth.loginToClassroom')}</p>
      </div>
    </aside>
  );
}

export function AuthPage() {
  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <header className='auth-page__top auth-page__top--split'>
          <Link to='/'>
            <AppLogo />
          </Link>
          <LanguageSwitcher compact showLabel />
        </header>
        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <SignInForm variant='embedded' />
          </div>
        </main>
      </section>
      <AuthIllustrationSet />
    </div>
  );
}
