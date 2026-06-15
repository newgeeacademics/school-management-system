'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/AppLogo';
import { clearAuthSession, persistAuthSession } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { isAdminRole } from '@/lib/api-error';
import { isBackendApiConfigured, loginAdmin } from '@/lib/dashboard-backend';

export const SignInForm = ({ variant = 'full' }: { variant?: 'full' | 'embedded' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const isEmbedded = variant === 'embedded';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const email = usernameOrEmail.trim();
    try {
      if (!isBackendApiConfigured()) {
        toast.error(
          'Impossible de joindre le serveur API. Vérifiez VITE_API_URL et que le backend est démarré.',
          { richColors: true }
        );
        setIsPending(false);
        return;
      }
      if (!email || !password) {
        toast.error(t('auth.enterPassword'), { richColors: true });
        setIsPending(false);
        return;
      }

      const auth = await loginAdmin(email, password);
      if (!isAdminRole(auth.role)) {
        toast.error('Ce compte n’a pas accès à la console établissement.', { richColors: true });
        setIsPending(false);
        return;
      }
      const user = persistAuthSession(auth);
      if (!user) {
        toast.error('Rôle de compte non reconnu.', { richColors: true });
        clearAuthSession();
        setIsPending(false);
        return;
      }
      toast.success(t('auth.welcomeBackToast'), { richColors: true });
      setUsernameOrEmail('');
      setPassword('');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Identifiants invalides. Seul un compte créé par l\'établissement peut accéder.';
      toast.error(message, { richColors: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className={cn(
        'relative',
        isEmbedded ? 'w-full min-h-0 p-0' : 'flex flex-col items-center justify-center p-4 md:px-6 md:py-8 min-h-svh'
      )}
    >
      {!isEmbedded ? (
        <div className='fixed top-4 left-4 z-50 md:top-6 md:left-6'>
          <Button asChild variant='ghost' size='sm' className='gap-2 text-slate-700'>
            <Link to='/'>
              <ChevronLeft className='h-4 w-4' />
              {t('common.goBack')}
            </Link>
          </Button>
        </div>
      ) : null}

      <div
        className={cn(
          'sm:w-full w-full relative',
          isEmbedded ? 'max-w-none mt-0 p-0' : 'max-w-[456px] mt-4 md:mt-6 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden'
        )}
      >
        <div className={cn('relative z-10', isEmbedded ? '' : 'px-0')}>
          {!isEmbedded ? <AppLogo className='mb-6' /> : null}
          <h1
            className={cn(
              'font-bold tracking-tight text-slate-900',
              isEmbedded ? 'auth-page__title mt-0' : 'text-3xl mb-2'
            )}
          >
            {t('auth.welcomeBack')}
          </h1>
          <p
            className={cn(
              'text-slate-600 font-medium',
              isEmbedded ? 'auth-page__subtitle' : 'text-base'
            )}
          >
            {t('auth.loginToClassroom')}
          </p>
        </div>

        <div className={cn('relative z-10', isEmbedded ? 'auth-page__form' : 'mt-6')}>
          <form onSubmit={onSubmit} className={isEmbedded ? 'contents' : 'space-y-5'}>
            <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
              <Label className='text-sm font-semibold text-slate-700'>
                {t('auth.username')} / {t('auth.email')}
              </Label>
              <Input
                type='text'
                placeholder={t('auth.enterUsername')}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className='h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500'
              />
            </div>
            <div className={isEmbedded ? 'auth-page__field' : 'space-y-2'}>
              <Label className='text-sm font-semibold text-slate-700'>
                {t('auth.password')}
              </Label>
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')}
                className='h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500'
              />
            </div>

            {isEmbedded ? (
              <button type='submit' className='auth-page__submit' disabled={isPending}>
                {isPending ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            ) : (
              <Button
                type='submit'
                size='lg'
                className='w-full h-11 rounded-xl font-semibold bg-[#2563eb] hover:bg-[#1d4ed8]'
                disabled={isPending}
              >
                {isPending ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
