import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { SignInForm } from '@/components/refine-ui/form/sign-in-form';
import logoSrc from '@/assets/logo/newgee-logo.png';
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
        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <Link to='/' className='auth-page__brand-link auth-page__brand-link--hero'>
              <img src={logoSrc} alt='NewGee' className='auth-page__logo auth-page__logo--hero' />
            </Link>
            <SignInForm variant='embedded' />          </div>
        </main>
      </section>
      <AuthIllustrationSet />
    </div>
  );
}
