import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { getMainAppOrigin } from '@/lib/school-app-url';
import { fetchActivationPreview, isBackendApiConfigured, setupInitialPassword } from '@/lib/api';
import { setPortalSession } from '@/lib/auth';
import { backendRoleToPortal, defaultPortalPath } from '@/lib/portal-role';
import logoSrc from '@/assets/logo/newgee-logo.png';

import './auth-page.css';

export function UserPortalActivateAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mainOrigin = getMainAppOrigin();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [name, setName] = useState('');
  const [loginHint, setLoginHint] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!token || !isBackendApiConfigured()) {
      setPreviewError(t('userPortal.activationInvalidLink'));
      setLoadingPreview(false);
      return;
    }
    void fetchActivationPreview(token)
      .then((preview) => {
        setName(preview.name);
        setLoginHint(preview.loginId || preview.email);
      })
      .catch((err) => {
        setPreviewError(err instanceof Error ? err.message : t('userPortal.activationInvalidLink'));
      })
      .finally(() => setLoadingPreview(false));
  }, [token, t]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('userPortal.activationInvalidLink'), { richColors: true });
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
    setPending(true);
    try {
      const auth = await setupInitialPassword(token, password);
      const portalRole = backendRoleToPortal(auth.role);
      if (!portalRole || !auth.token) {
        toast.error(t('userPortal.adminAccountDenied'), { richColors: true });
        return;
      }
      setPortalSession({
        role: portalRole,
        email: auth.email,
        loginId: auth.loginId ?? undefined,
        name: auth.name,
        userId: auth.id,
        token: auth.token,
        emailHint: auth.loginId ?? auth.email,
      });
      toast.success(t('userPortal.activationSuccess'), { richColors: true });
      navigate(defaultPortalPath(portalRole), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('userPortal.activationError'), {
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
          <h1 className='auth-page__title'>{t('userPortal.activationTitle')}</h1>
          <p className='auth-page__subtitle'>
            {loadingPreview
              ? t('common.loading')
              : previewError
                ? previewError
                : t('userPortal.activationSubtitle', { name: name || '—' })}
          </p>
          {!loadingPreview && !previewError ? (
            <form className='auth-page__form mt-4' onSubmit={(e) => void onSubmit(e)}>
              {loginHint ? (
                <p className='text-xs text-muted-foreground'>
                  {t('userPortal.activationLoginHint', { login: loginHint })}
                </p>
              ) : null}
              <div className='auth-page__field'>
                <Label htmlFor='activate-password'>{t('userPortal.setupPasswordNew')}</Label>
                <InputPassword
                  id='activate-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete='new-password'
                />
              </div>
              <div className='auth-page__field'>
                <Label htmlFor='activate-confirm'>{t('userPortal.setupPasswordConfirm')}</Label>
                <InputPassword
                  id='activate-confirm'
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete='new-password'
                />
              </div>
              <button type='submit' className='auth-page__submit' disabled={pending}>
                {pending ? t('auth.signingIn') : t('userPortal.activationSubmit')}
              </button>
            </form>
          ) : null}
          <p className='auth-page__footer mt-4'>
            <Link to='/connexion'>{t('userPortal.backToLogin')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
