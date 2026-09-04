import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { getMainAppOrigin } from '@/lib/school-app-url';
import { isBackendApiConfigured, resetPasswordWithToken } from '@/lib/api';
import logoSrc from '@/assets/logo/newgee-logo.png';

import './auth-page.css';

export function UserPortalResetPasswordPage() {
  const { t } = useTranslation();
  const mainOrigin = getMainAppOrigin();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('userPortal.resetPasswordInvalidLink'), { richColors: true });
      return;
    }
    if (password.length < 6) {
      toast.error(t('userPortal.resetPasswordTooShort'), { richColors: true });
      return;
    }
    if (password !== confirm) {
      toast.error(t('userPortal.resetPasswordMismatch'), { richColors: true });
      return;
    }
    if (!isBackendApiConfigured()) {
      toast.error(t('userPortal.backendRequired'), { richColors: true });
      return;
    }

    setPending(true);
    try {
      await resetPasswordWithToken(token, password);
      setDone(true);
      toast.success(t('userPortal.resetPasswordSuccess'), { richColors: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('userPortal.resetPasswordError'), {
        richColors: true,
      });
    } finally {
      setPending(false);
    }
  };

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

          <div className='auth-page__form'>
            <h1 className='auth-page__title'>{t('userPortal.resetPasswordTitle')}</h1>
            <p className='auth-page__subtitle'>{t('userPortal.resetPasswordSubtitle')}</p>

            {!token ? (
              <p className='text-sm text-red-600'>{t('userPortal.resetPasswordInvalidLink')}</p>
            ) : done ? (
              <p className='text-sm text-slate-600'>{t('userPortal.resetPasswordDoneHint')}</p>
            ) : (
              <form onSubmit={onSubmit} className='contents'>
                <div className='auth-page__field'>
                  <Label htmlFor='reset-password' className='text-sm font-semibold text-slate-700'>
                    {t('userPortal.resetPasswordNew')}
                  </Label>
                  <InputPassword
                    id='reset-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete='new-password'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-teal-600'
                  />
                </div>
                <div className='auth-page__field'>
                  <Label htmlFor='reset-password-confirm' className='text-sm font-semibold text-slate-700'>
                    {t('userPortal.resetPasswordConfirm')}
                  </Label>
                  <InputPassword
                    id='reset-password-confirm'
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete='new-password'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-teal-600'
                  />
                </div>
                <button type='submit' className='auth-page__submit' disabled={pending || password.length < 6}>
                  {pending ? t('userPortal.resetPasswordSaving') : t('userPortal.resetPasswordSubmit')}
                </button>
              </form>
            )}

            <p className='auth-page__footer'>
              <Link to='/connexion'>{t('userPortal.backToLogin')}</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
