import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { getAdminLoginUrl } from '@/lib/school-app-url';
import { setPortalSession } from '@/lib/auth';
import {
  loginWithIdentifier,
  setupInitialPassword,
  isBackendApiConfigured,
} from '@/lib/api';
import { backendRoleToPortal, defaultPortalPath } from '@/lib/portal-role';

const MIN_PASSWORD = 6;

export function UserPortalSignInForm({ variant = 'full' }: { variant?: 'full' | 'embedded' }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [setupName, setSetupName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const isEmbedded = variant === 'embedded';
  const isSetupMode = setupToken != null;

  const adminLoginUrl = getAdminLoginUrl();

  const finishLogin = (auth: {
    token: string;
    id: string;
    name: string;
    email: string;
    loginId?: string | null;
    role: string;
  }) => {
    const portalRole = backendRoleToPortal(auth.role);
    if (!portalRole) {
      toast.error(t('userPortal.adminAccountDenied'), { richColors: true });
      return false;
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
    toast.success(t('userPortal.welcomeToast'), { richColors: true });
    navigate(defaultPortalPath(portalRole), { replace: true });
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const identifier = usernameOrEmail.trim();

    try {
      if (!isBackendApiConfigured()) {
        toast.error(t('userPortal.backendRequired'), { richColors: true });
        return;
      }

      if (isSetupMode) {
        if (newPassword.length < MIN_PASSWORD) {
          toast.error(t('userPortal.resetPasswordTooShort'), { richColors: true });
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error(t('userPortal.resetPasswordMismatch'), { richColors: true });
          return;
        }
        const auth = await setupInitialPassword(setupToken, newPassword);
        if (auth.token) {
          finishLogin(auth);
        }
        return;
      }

      if (!identifier) {
        toast.error(t('userPortal.loginIdentifierRequired'), { richColors: true });
        return;
      }

      const auth = await loginWithIdentifier(identifier, password);

      if (auth.passwordSetupRequired && auth.setupToken) {
        setSetupToken(auth.setupToken);
        setSetupName(auth.name ?? identifier);
        setPassword('');
        toast.message(t('userPortal.setupPasswordPrompt'), { richColors: true });
        return;
      }

      if (!auth.token) {
        toast.error(t('userPortal.loginInvalid'), { richColors: true });
        return;
      }

      if (!password.trim()) {
        toast.error(t('auth.enterPassword'), { richColors: true });
        return;
      }

      finishLogin(auth);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : t('userPortal.loginInvalid');
      toast.error(message, { richColors: true });
    } finally {
      setIsPending(false);
    }
  };

  const backToLogin = () => {
    setSetupToken(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={cn('relative w-full', isEmbedded ? 'min-h-0' : 'min-h-svh p-4 md:p-8')}>
      <div className={cn(isEmbedded ? '' : 'portal-card mx-auto max-w-md p-6')}>
        <div className={cn(isEmbedded ? '' : 'mb-6')}>
          <h1 className={cn('font-bold tracking-tight text-slate-900', isEmbedded ? 'auth-page__title' : 'text-3xl')}>
            {isSetupMode ? t('userPortal.setupPasswordTitle') : t('userPortal.welcomeTitle')}
          </h1>
          <p className={cn('font-medium text-slate-600', isEmbedded ? 'auth-page__subtitle' : 'mt-2 text-base')}>
            {isSetupMode
              ? t('userPortal.setupPasswordSubtitle', { name: setupName })
              : t('userPortal.loginSubtitle')}
          </p>
        </div>

        <div className={isEmbedded ? 'auth-page__form' : 'mt-6 space-y-5'}>
          <form onSubmit={onSubmit} className={isEmbedded ? 'contents' : 'space-y-5'}>
            {!isSetupMode ? (
              <>
                <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
                  <Label htmlFor='portal-login-email' className='text-sm font-semibold text-slate-700'>
                    {t('userPortal.loginIdentifier')}
                  </Label>
                  <Input
                    id='portal-login-email'
                    type='text'
                    placeholder={t('userPortal.loginIdentifierPlaceholder')}
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    autoComplete='username'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-ring'
                  />
                </div>

                <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
                  <div className='flex items-center justify-between gap-2'>
                    <Label htmlFor='portal-login-password' className='text-sm font-semibold text-slate-700'>
                      {t('auth.password')}
                    </Label>
                    <Link
                      to='/mot-de-passe-oublie'
                      className='text-xs font-medium text-primary hover:underline'
                    >
                      {t('userPortal.forgotPasswordLink')}
                    </Link>
                  </div>
                  <InputPassword
                    id='portal-login-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('userPortal.passwordOptionalHint')}
                    autoComplete='current-password'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-ring'
                  />
                  <p className='text-xs text-muted-foreground'>{t('userPortal.firstLoginHint')}</p>
                </div>
              </>
            ) : (
              <>
                <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
                  <Label htmlFor='portal-setup-password' className='text-sm font-semibold text-slate-700'>
                    {t('userPortal.setupPasswordNew')}
                  </Label>
                  <InputPassword
                    id='portal-setup-password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete='new-password'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-ring'
                  />
                </div>
                <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
                  <Label htmlFor='portal-setup-confirm' className='text-sm font-semibold text-slate-700'>
                    {t('userPortal.setupPasswordConfirm')}
                  </Label>
                  <InputPassword
                    id='portal-setup-confirm'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete='new-password'
                    className='h-11 rounded-xl border-slate-200 focus-visible:ring-ring'
                  />
                </div>
                <button type='button' className='text-xs text-primary hover:underline' onClick={backToLogin}>
                  {t('userPortal.backToLogin')}
                </button>
              </>
            )}

            {isEmbedded ? (
              <button type='submit' className='auth-page__submit' disabled={isPending}>
                {isPending
                  ? t('auth.signingIn')
                  : isSetupMode
                    ? t('userPortal.setupPasswordSubmit')
                    : t('auth.signIn')}
              </button>
            ) : (
              <button type='submit' className='auth-page__submit w-full' disabled={isPending}>
                {isPending
                  ? t('auth.signingIn')
                  : isSetupMode
                    ? t('userPortal.setupPasswordSubmit')
                    : t('auth.signIn')}
              </button>
            )}
          </form>

          {!isSetupMode ? (
            <p className='auth-page__footer'>
              {t('userPortal.staffHint')}{' '}
              <a href={adminLoginUrl}>{t('userPortal.linkAdminLogin')}</a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
