import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { getMainAppOrigin } from '@/lib/school-app-url';
import { isBackendApiConfigured, requestPasswordReset } from '@/lib/api';
import logoSrc from '@/assets/logo/newgee-logo.png';

import './auth-page.css';

export function UserPortalForgotPasswordPage() {
  const { t } = useTranslation();
  const mainOrigin = getMainAppOrigin();
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = identifier.trim();
    if (!value) return;

    if (!isBackendApiConfigured()) {
      toast.error(t('userPortal.backendRequired'), { richColors: true });
      return;
    }

    setPending(true);
    try {
      await requestPasswordReset(value);
      setSent(true);
      toast.success(t('userPortal.forgotPasswordSent'), { richColors: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('userPortal.forgotPasswordError'), {
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
            <h1 className='auth-page__title'>{t('userPortal.forgotPasswordTitle')}</h1>
            <p className='auth-page__subtitle'>{t('userPortal.forgotPasswordSubtitle')}</p>

            {sent ? (
              <p className='text-sm text-slate-600'>{t('userPortal.forgotPasswordSentHint')}</p>
            ) : (
              <form onSubmit={onSubmit} className='contents'>
                <div className='auth-page__field'>
                  <Label htmlFor='forgot-identifier' className='text-sm font-semibold text-slate-700'>
                    {t('userPortal.loginIdentifier')}
                  </Label>
                  <Input
                    id='forgot-identifier'
                    type='text'
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('userPortal.loginIdentifierPlaceholder')}
                    autoComplete='username'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-teal-600'
                  />
                </div>
                <button type='submit' className='auth-page__submit' disabled={pending || !identifier.trim()}>
                  {pending ? t('userPortal.forgotPasswordSending') : t('userPortal.forgotPasswordSubmit')}
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
