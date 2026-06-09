import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AppLogo } from '@/components/AppLogo';
import { InputPassword } from '@/components/form/input-password';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import {
  clearAuthSession,
  isBackendApiConfigured,
  loginWithCredentials,
  persistAuthSession,
} from '@/lib/api-auth';

import './auth-page.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(t('auth.enterPassword'));
      return;
    }

    if (!isBackendApiConfigured()) {
      setError(t('login.apiNotConfigured'));
      return;
    }

    setIsPending(true);
    try {
      const auth = await loginWithCredentials(email, password);
      const user = persistAuthSession(auth);
      if (!user) {
        setError(t('login.unsupportedRole'));
        clearAuthSession();
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.failed'));
    } finally {
      setIsPending(false);
    }
  };

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
            <h1 className='auth-page__title'>{t('login.title')}</h1>
            <p className='auth-page__subtitle'>{t('login.subtitle')}</p>

            <form onSubmit={handleSubmit} className='auth-page__form'>
              <div className='auth-page__field'>
                <Label htmlFor='login-email'>{t('login.email')}</Label>
                <Input
                  id='login-email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete='email'
                  required
                  className='h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500'
                />
              </div>

              <div className='auth-page__field'>
                <Label htmlFor='login-password'>{t('login.password')}</Label>
                <InputPassword
                  id='login-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  className='h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500'
                />
              </div>

              {error ? <p className='auth-page__error text-sm text-red-600'>{error}</p> : null}

              <button type='submit' className='auth-page__submit' disabled={isPending}>
                {isPending ? t('login.submitting') : t('login.submit')}
              </button>
            </form>

            <p className='auth-page__footer'>
              {t('login.noAccount')}{' '}
              <Link to='/register'>{t('login.createSchool')}</Link>
            </p>
          </div>
        </main>
      </section>

      <aside className='auth-page__visual' aria-hidden>
        <img src={HERO_IMAGE} alt='' />
        <div className='auth-page__visual-overlay' />
        <div className='auth-page__visual-copy'>
          <h2>{t('login.visualTitle')}</h2>
          <p>{t('login.visualDesc')}</p>
        </div>
      </aside>
    </div>
  );
};
