import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, ArrowLeft, Loader2, Lock, Mail, MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useTranslation } from '@/i18n';
import { clearAuthSession, persistAuthSession, type AuthLoginResponse } from '@/lib/auth';
import { isAdminRole } from '@/lib/api-error';
import { requestPasswordReset } from '@/lib/auth-api';
import { isGoogleAuthConfigured } from '@/lib/google-auth';
import { isBackendApiConfigured, loginAdmin, loginWithGoogle } from '@/lib/dashboard-backend';

type View = 'signin' | 'forgot' | 'forgot-sent';

export const SignInForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [view, setView] = useState<View>('signin');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const sessionExpired = searchParams.get('expired') === '1';

  const completeLogin = (auth: AuthLoginResponse): boolean => {
    if (!isAdminRole(auth.role)) {
      setFormError('Ce compte n’a pas accès à la console établissement.');
      return false;
    }
    const user = persistAuthSession(auth);
    if (!user) {
      clearAuthSession();
      setFormError('Rôle de compte non reconnu.');
      return false;
    }
    toast.success(t('auth.welcomeBackToast'));
    navigate('/dashboard', { replace: true });
    return true;
  };

  const ensureBackend = (): boolean => {
    if (isBackendApiConfigured()) return true;
    setFormError('Impossible de joindre le serveur API. Vérifiez VITE_API_URL et que le backend est démarré.');
    return false;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const email = usernameOrEmail.trim();
    if (!email || !password) {
      setFormError(t('auth.enterPassword'));
      return;
    }
    if (!ensureBackend()) return;

    setIsPending(true);
    try {
      const auth = await loginAdmin(email, password);
      if (completeLogin(auth)) {
        setPassword('');
      }
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : 'Identifiants invalides. Seul un compte créé par l’établissement peut accéder.'
      );
    } finally {
      setIsPending(false);
    }
  };

  const onGoogleCredential = async (idToken: string) => {
    setFormError(null);
    if (!ensureBackend()) return;
    setIsPending(true);
    try {
      completeLogin(await loginWithGoogle(idToken));
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setFormError(message || t('auth.googleFailed'));
    } finally {
      setIsPending(false);
    }
  };

  const onForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const email = usernameOrEmail.trim();
    if (!email) {
      setFormError(t('auth.enterEmail'));
      return;
    }
    if (!ensureBackend()) return;
    setIsPending(true);
    try {
      await requestPasswordReset(email);
      setView('forgot-sent');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setIsPending(false);
    }
  };

  const switchView = (next: View) => {
    setFormError(null);
    setView(next);
  };

  const errorBanner = formError ? (
    <div role='alert' className='auth-alert auth-alert--error'>
      <AlertCircle className='h-4 w-4 shrink-0' />
      <span>{formError}</span>
    </div>
  ) : null;

  if (view === 'forgot-sent') {
    return (
      <div className='auth-form auth-form--centered'>
        <span className='auth-form__badge auth-form__badge--success'>
          <MailCheck className='h-6 w-6' />
        </span>
        <h1 className='auth-page__title'>{t('auth.forgotPasswordTitle')}</h1>
        <p className='auth-page__subtitle'>{t('auth.resetLinkSent')}</p>
        <button type='button' className='auth-page__submit' onClick={() => switchView('signin')}>
          {t('auth.backToLogin')}
        </button>
      </div>
    );
  }

  if (view === 'forgot') {
    return (
      <form className='auth-form' onSubmit={onForgotSubmit} noValidate>
        <button type='button' className='auth-link auth-link--back' onClick={() => switchView('signin')}>
          <ArrowLeft className='h-4 w-4' />
          {t('auth.backToLogin')}
        </button>
        <div>
          <h1 className='auth-page__title'>{t('auth.forgotPasswordTitle')}</h1>
          <p className='auth-page__subtitle'>{t('auth.forgotPasswordDesc')}</p>
        </div>
        {errorBanner}
        <div className='auth-page__field'>
          <Label htmlFor='forgot-email'>{t('auth.email')}</Label>
          <div className='auth-input'>
            <Mail className='auth-input__icon' />
            <Input
              id='forgot-email'
              type='email'
              autoComplete='email'
              autoFocus
              placeholder={t('auth.enterEmail')}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
          </div>
        </div>
        <button type='submit' className='auth-page__submit' disabled={isPending}>
          {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
          {isPending ? t('auth.sending') : t('auth.sendResetLink')}
        </button>
      </form>
    );
  }

  return (
    <div className='auth-form'>
      <div>
        <h1 className='auth-page__title'>{t('auth.welcomeBack')}</h1>
        <p className='auth-page__subtitle'>{t('auth.loginToClassroom')}</p>
      </div>

      {sessionExpired && !formError ? (
        <div role='status' className='auth-alert auth-alert--warning'>
          <Lock className='h-4 w-4 shrink-0' />
          <span>{t('auth.sessionExpired')}</span>
        </div>
      ) : null}
      {errorBanner}

      {isGoogleAuthConfigured() ? (
        <>
          <GoogleSignInButton onCredential={onGoogleCredential} disabled={isPending} />
          <div className='auth-divider'>
            <span>{t('auth.orContinueWith')}</span>
          </div>
        </>
      ) : null}

      <form onSubmit={onSubmit} className='auth-page__form' noValidate>
        <div className='auth-page__field'>
          <Label htmlFor='signin-identifier'>
            {t('auth.username')} / {t('auth.email')}
          </Label>
          <div className='auth-input'>
            <Mail className='auth-input__icon' />
            <Input
              id='signin-identifier'
              type='text'
              autoComplete='username'
              autoFocus
              placeholder={t('auth.enterUsername')}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              aria-invalid={Boolean(formError) || undefined}
            />
          </div>
        </div>
        <div className='auth-page__field'>
          <div className='auth-page__label-row'>
            <Label htmlFor='signin-password'>{t('auth.password')}</Label>
            <button type='button' className='auth-link' onClick={() => switchView('forgot')}>
              {t('auth.forgotPassword')}
            </button>
          </div>
          <div className='auth-input'>
            <Lock className='auth-input__icon' />
            <InputPassword
              id='signin-password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.enterPassword')}
              aria-invalid={Boolean(formError) || undefined}
            />
          </div>
        </div>

        <button type='submit' className='auth-page__submit' disabled={isPending}>
          {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
          {isPending ? t('auth.signingIn') : t('auth.signIn')}
        </button>
      </form>

      <p className='auth-page__secure'>
        <Lock className='h-3.5 w-3.5' />
        {t('auth.secureNote')}
      </p>

      <p className='auth-page__alt'>
        {t('auth.newSchoolPrompt')} <Link to='/register'>{t('auth.createSchool')}</Link>
      </p>
    </div>
  );
};
