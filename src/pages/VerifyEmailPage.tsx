import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useTranslation } from '@/i18n';
import { verifyEmailToken } from '@/lib/auth-api';
import { getStoredUser } from '@/lib/auth';

type Status = 'pending' | 'success' | 'error';

// Verification tokens are single-use: share one request per token across re-mounts.
const verifications = new Map<string, Promise<unknown>>();

function verifyOnce(token: string): Promise<unknown> {
  let pending = verifications.get(token);
  if (!pending) {
    pending = verifyEmailToken(token);
    verifications.set(token, pending);
  }
  return pending;
}

/** Target of the "confirm your e-mail" message sent after school registration. */
export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [status, setStatus] = useState<Status>(token ? 'pending' : 'error');
  const [message, setMessage] = useState<string>(token ? '' : t('auth.invalidLink'));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyOnce(token)
      .then(() => {
        if (!cancelled) setStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : t('auth.invalidLink'));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const continueHref = getStoredUser() ? '/dashboard' : '/login';

  return (
    <AuthLayout>
      <div className='auth-form auth-form--centered' aria-live='polite'>
        {status === 'pending' ? (
          <>
            <span className='auth-form__badge'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </span>
            <h1 className='auth-page__title'>{t('auth.verifyingEmail')}</h1>
          </>
        ) : status === 'success' ? (
          <>
            <span className='auth-form__badge auth-form__badge--success'>
              <CheckCircle2 className='h-6 w-6' />
            </span>
            <h1 className='auth-page__title'>{t('auth.emailVerified')}</h1>
            <p className='auth-page__subtitle'>{t('auth.emailVerifiedDesc')}</p>
            <Link to={continueHref} className='auth-page__submit'>
              {continueHref === '/dashboard' ? t('dashboard.title') : t('auth.signIn')}
            </Link>
          </>
        ) : (
          <>
            <span className='auth-form__badge auth-form__badge--error'>
              <AlertCircle className='h-6 w-6' />
            </span>
            <h1 className='auth-page__title'>{t('auth.emailVerifyFailed')}</h1>
            <p className='auth-page__subtitle'>{message}</p>
            <Link to='/login' className='auth-page__submit'>
              {t('auth.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
