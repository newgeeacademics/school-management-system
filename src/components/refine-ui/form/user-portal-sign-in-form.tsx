import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { ChevronLeft, GraduationCap, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSchoolAppOrigin } from '@/lib/school-app-url';
import { setPortalSession, type PortalRole } from '@/lib/auth';

const PORTAL_ROLES = ['student', 'parent', 'teacher'] as const;
type PortalRoleState = (typeof PORTAL_ROLES)[number];

function parseRoleParam(value: string | null): PortalRoleState | null {
  if (value === 'student' || value === 'parent' || value === 'teacher') return value;
  return null;
}

export function UserPortalSignInForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    window.setTimeout(() => {
      const r = role as PortalRole;
      setPortalSession({
        role: r,
        emailHint: usernameOrEmail.trim() || undefined,
      });
      toast.success(t('userPortal.welcomeToast'), { richColors: true });
      setUsernameOrEmail('');
      setPassword('');
      setIsPending(false);
      navigate('/accueil', { replace: true });
    }, 400);
  };

  return (
    <div className='relative w-full min-h-0 p-0'>
      <div className='mb-4'>
        <Button asChild variant='ghost' size='sm' className='-ml-2 gap-2 text-muted-foreground hover:text-foreground'>
          <a href={`${schoolOrigin}/`}>
            <ChevronLeft className='h-4 w-4' />
            {t('common.goBack')}
          </a>
        </Button>
      </div>

      <div className='portal-login-form w-full max-w-none p-0'>
        <div className='portal-field portal-field-1'>
          <h1 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>{t('userPortal.welcomeTitle')}</h1>
          <p className='mt-2 text-base font-medium text-muted-foreground'>{t('userPortal.loginSubtitle')}</p>
        </div>

        <div className='mt-6'>
          <p className='mb-2 text-sm font-medium text-foreground'>{t('userPortal.chooseProfile')}</p>
          <div className='mb-6 grid grid-cols-3 gap-2 sm:gap-3'>
            {roleMeta.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type='button'
                onClick={() => setRole(id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-all',
                  'hover:border-primary/50 hover:bg-primary/5',
                  role === id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/25 shadow-sm'
                    : 'border-border bg-card'
                )}
              >
                <Icon
                  className={cn('h-5 w-5 shrink-0', role === id ? 'text-primary' : 'text-muted-foreground')}
                  aria-hidden
                />
                <span
                  className={cn(
                    'text-xs font-semibold leading-tight sm:text-sm',
                    role === id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className='space-y-5'>
            <div className='portal-field portal-field-2 space-y-2'>
              <Label className='text-sm font-medium'>
                {t('auth.username')} / {t('auth.email')}
              </Label>
              <Input
                type='text'
                placeholder={t('auth.enterUsername')}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className='h-11 rounded-xl border-border bg-background'
              />
            </div>
            <div className='portal-field portal-field-3 space-y-2'>
              <Label className='text-sm font-medium'>{t('auth.password')}</Label>
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')}
                className='h-11 rounded-xl border-border bg-background pr-10'
              />
            </div>

            <Button
              type='submit'
              size='lg'
              className='portal-field portal-field-4 mt-2 h-12 w-full rounded-full text-base font-semibold shadow-md shadow-primary/20'
              disabled={isPending}
            >
              {isPending ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>

          <p className='mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground'>
            {t('userPortal.staffHint')}{' '}
            <a
              href={`${schoolOrigin}/login`}
              className='font-medium text-primary underline-offset-4 hover:underline'
            >
              {t('userPortal.linkAdminLogin')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
