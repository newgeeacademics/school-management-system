import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, KeyRound, Loader2, Lock } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import { resetPassword } from '@/lib/auth-api';

const MIN_PASSWORD_LENGTH = 8;

/** Target of the "reset password" e-mail sent to school administrators. */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setIsPending(true);
    try {
      await resetPassword(token, password);
      toast.success(t('auth.passwordUpdated'));
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidLink'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout>
      {!token ? (
        <div className='auth-form auth-form--centered'>
          <span className='auth-form__badge auth-form__badge--error'>
            <AlertCircle className='h-6 w-6' />
          </span>
          <h1 className='auth-page__title'>{t('auth.resetPasswordTitle')}</h1>
          <p className='auth-page__subtitle'>{t('auth.invalidLink')}</p>
          <Link to='/login' className='auth-page__submit'>
            {t('auth.backToLogin')}
          </Link>
        </div>
      ) : (
        <form className='auth-form' onSubmit={onSubmit} noValidate>
          <span className='auth-form__badge'>
            <KeyRound className='h-6 w-6' />
          </span>
          <div>
            <h1 className='auth-page__title'>{t('auth.resetPasswordTitle')}</h1>
            <p className='auth-page__subtitle'>{t('auth.resetPasswordDesc')}</p>
          </div>
          {error ? (
            <div role='alert' className='auth-alert auth-alert--error'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          ) : null}
          <div className='auth-page__field'>
            <Label htmlFor='reset-password'>{t('auth.newPassword')}</Label>
            <div className='auth-input'>
              <Lock className='auth-input__icon' />
              <InputPassword
                id='reset-password'
                autoComplete='new-password'
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')}
              />
            </div>
          </div>
          <div className='auth-page__field'>
            <Label htmlFor='reset-confirm'>{t('auth.confirmPassword')}</Label>
            <div className='auth-input'>
              <Lock className='auth-input__icon' />
              <InputPassword
                id='reset-confirm'
                autoComplete='new-password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t('auth.enterConfirmPassword')}
              />
            </div>
          </div>
          <button type='submit' className='auth-page__submit' disabled={isPending}>
            {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
            {t('auth.updatePassword')}
          </button>
          <Link to='/login' className='auth-link auth-link--center'>
            {t('auth.backToLogin')}
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
