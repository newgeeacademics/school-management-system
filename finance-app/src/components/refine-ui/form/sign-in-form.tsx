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
import { clearAuthSession, persistAuthSession } from '@/lib/auth';
import { getMainAppOrigin } from '@/lib/main-app-url';
import { isFinanceStaffRole } from '@/lib/api-error';
import { fetchMyRoleAccess, isBackendApiConfigured, loginAdmin } from '@/lib/finance-api';
import { canAccessFinanceModule } from '@/lib/finance-role';

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
          import.meta.env.DEV
            ? 'Créez finance-app/.env avec VITE_API_URL=http://localhost:8080 puis relancez npm run dev:finance.'
            : 'VITE_API_URL n’est pas configuré sur ce déploiement Vercel (finance).',
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
      if (!isFinanceStaffRole(auth.role)) {
        toast.error('Accès réservé aux comptes admin, enseignant ou personnel.', { richColors: true });
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
      const access = await fetchMyRoleAccess();
      if (!canAccessFinanceModule(access)) {
        toast.error('Votre rôle n’a pas accès au module Finance. Contactez l’administration.', {
          richColors: true,
        });
        clearAuthSession();
        setIsPending(false);
        return;
      }
      toast.success(t('auth.welcomeBackToast'), { richColors: true });
      setUsernameOrEmail('');
      setPassword('');
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.signIn'), { richColors: true });
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
      <div className='fixed top-4 left-4 z-50 md:top-6 md:left-6'>
        <Button asChild variant='ghost' size='sm' className='gap-2 text-gray-700'>
          <a href={getMainAppOrigin()}>
            <ChevronLeft className='h-4 w-4' />
            {t('common.goBack')}
          </a>
        </Button>
      </div>

      <div
        className={cn(
          'sm:w-full w-full relative rental-login-form',
          isEmbedded ? 'max-w-none mt-0 p-0' : 'max-w-[456px] mt-4 md:mt-6 p-8 bg-gray-0 border-0 overflow-hidden'
        )}
      >
        {!isEmbedded && <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-finance' />}

        <div className='px-0 relative z-10 rental-field rental-field-1'>
          <h1 className='text-4xl font-bold mb-2 text-gradient-finance'>
            {t('auth.welcomeBack')}
          </h1>
          <p className='text-gray-700 font-medium text-base'>
            Connexion réservée : direction, enseignants et personnel autorisés.
          </p>
        </div>

        <div className='px-0 relative z-10 mt-6'>
          <form onSubmit={onSubmit} className='space-y-6'>
            <div className='rental-field rental-field-2 space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>
                {t('auth.username')} / {t('auth.email')}
              </Label>
              <Input
                type='text'
                placeholder={t('auth.enterUsername')}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className='h-11 w-full rounded-md border border-violet-200 px-3 py-2 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500/40'
              />
            </div>
            <div className='rental-field rental-field-3 space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>
                {t('auth.password')}
              </Label>
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')}
                className='h-11 w-full rounded-md border border-violet-200 px-3 py-2 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500/40'
              />
            </div>

            <Button
              type='submit'
              size='lg'
              className='rental-field rental-field-4 mt-2 h-11 w-full cursor-pointer rounded-full bg-violet-600 px-6 py-2 text-center text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-violet-700 hover:shadow-lg'
              disabled={isPending}
            >
              {isPending ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
