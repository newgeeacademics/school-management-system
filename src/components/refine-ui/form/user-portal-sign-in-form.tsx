import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSchoolAppOrigin } from '@/lib/school-app-url';
import { setPortalSession } from '@/lib/auth';
import { loginWithEmail, isBackendApiConfigured } from '@/lib/api';
import { backendRoleToPortal, portalRoleMatchesBackend } from '@/lib/portal-role';

const PORTAL_ROLES = ['student', 'parent', 'teacher'] as const;
type PortalRoleState = (typeof PORTAL_ROLES)[number];

function parseRoleParam(value: string | null): PortalRoleState | null {
  if (value === 'student' || value === 'parent' || value === 'teacher') return value;
  return null;
}

export function UserPortalSignInForm({ variant = 'full' }: { variant?: 'full' | 'embedded' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const isEmbedded = variant === 'embedded';

  const schoolOrigin = getSchoolAppOrigin();

  const initialRole = useMemo(
    () => parseRoleParam(searchParams.get('role')) ?? 'student',
    [searchParams]
  );
  const [role, setRole] = useState<PortalRoleState>(initialRole);

  const roleParam = searchParams.get('role');
  useEffect(() => {
    const r = parseRoleParam(roleParam);
    if (r) setRole(r);
  }, [roleParam]);

  const roleMeta = useMemo(
    () =>
      [
        { id: 'student' as const, label: t('userPortal.student'), icon: GraduationCap },
        { id: 'parent' as const, label: t('userPortal.parent'), icon: Users },
        { id: 'teacher' as const, label: t('userPortal.teacher'), icon: BookOpen },
      ] as const,
    [t]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const email = usernameOrEmail.trim();
    if (!email || !password) {
      toast.error(t('auth.enterPassword'), { richColors: true });
      setIsPending(false);
      return;
    }

    try {
      if (!isBackendApiConfigured()) {
        toast.error(t('userPortal.backendRequired'), { richColors: true });
        setIsPending(false);
        return;
      }

      const auth = await loginWithEmail(email, password);
      const portalRole = backendRoleToPortal(auth.role);
      if (!portalRole) {
        toast.error(t('userPortal.adminAccountDenied'), { richColors: true });
        setIsPending(false);
        return;
      }
      if (!portalRoleMatchesBackend(role, auth.role)) {
        toast.error(t('userPortal.roleMismatch', { actual: portalRole, selected: role }), {
          richColors: true,
        });
        setIsPending(false);
        return;
      }
      setPortalSession({
        role,
        email: auth.email,
        name: auth.name,
        userId: auth.id,
        token: auth.token,
        emailHint: auth.email,
      });

      toast.success(t('userPortal.welcomeToast'), { richColors: true });
      setUsernameOrEmail('');
      setPassword('');
      navigate('/accueil', { replace: true });
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

  return (
    <div className={cn('relative w-full', isEmbedded ? 'min-h-0' : 'min-h-svh p-4 md:p-8')}>
      <div className={cn(isEmbedded ? '' : 'mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm')}>
        <div className={cn(isEmbedded ? '' : 'mb-6')}>
          <h1 className={cn('font-bold tracking-tight text-slate-900', isEmbedded ? 'auth-page__title' : 'text-3xl')}>
            {t('userPortal.welcomeTitle')}
          </h1>
          <p className={cn('font-medium text-slate-600', isEmbedded ? 'auth-page__subtitle' : 'mt-2 text-base')}>
            {t('userPortal.loginSubtitle')}
          </p>
        </div>

        <div className={isEmbedded ? 'auth-page__form' : 'mt-6 space-y-5'}>
          <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
            <p className='auth-page__role-label'>{t('userPortal.chooseProfile')}</p>
            <div className='auth-page__role-grid'>
              {roleMeta.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type='button'
                  onClick={() => setRole(id)}
                  className={cn(
                    'auth-page__role-btn',
                    role === id && 'auth-page__role-btn--active'
                  )}
                >
                  <Icon className='h-5 w-5 shrink-0' aria-hidden />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className={isEmbedded ? 'contents' : 'space-y-5'}>
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
                className='h-11 rounded-xl border-slate-200 focus-visible:ring-teal-600'
              />
            </div>

            <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
              <Label htmlFor='portal-login-password' className='text-sm font-semibold text-slate-700'>
                {t('auth.password')}
              </Label>
              <InputPassword
                id='portal-login-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')}
                autoComplete='current-password'
                className='h-11 rounded-xl border-slate-200 focus-visible:ring-teal-600'
              />
            </div>

            {isEmbedded ? (
              <button type='submit' className='auth-page__submit' disabled={isPending}>
                {isPending ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            ) : (
              <button type='submit' className='auth-page__submit w-full' disabled={isPending}>
                {isPending ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            )}
          </form>

          <p className='auth-page__footer'>
            {t('userPortal.staffHint')}{' '}
            <a href={`${schoolOrigin}/login`}>{t('userPortal.linkAdminLogin')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
