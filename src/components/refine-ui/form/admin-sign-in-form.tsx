import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { ChevronLeft } from 'lucide-react';
import { buildAdminHandoffUrl, storeAccessToken } from '@/lib/auth-handoff';
import { isBackendApiConfigured, loginAdmin } from '@/lib/admin-login-api';
import { getAdminAppOrigin } from '@/lib/app-urls';

export function AdminSignInForm() {
  const { t } = useTranslation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const email = usernameOrEmail.trim();

    if (!email || !password) {
      toast.error(t('auth.enterPassword'), { richColors: true });
      setIsPending(false);
      return;
    }

    if (!isBackendApiConfigured()) {
      toast.error('VITE_API_URL is not configured on this deployment.', { richColors: true });
      setIsPending(false);
      return;
    }

    try {
      const auth = await loginAdmin(email, password);
      if (auth.role !== 'ADMIN') {
        toast.error('This account cannot access the school admin console.', { richColors: true });
        setIsPending(false);
        return;
      }

      storeAccessToken(auth.token);
      toast.success(t('auth.welcomeBackToast'), { richColors: true });

      const adminOrigin = getAdminAppOrigin();
      const adminConfigured = Boolean(import.meta.env.VITE_ADMIN_APP_URL?.trim());

      if (adminConfigured && !adminOrigin.includes('localhost')) {
        window.location.assign(buildAdminHandoffUrl(auth.token));
      } else {
        toast.info(
          'Signed in. Set VITE_ADMIN_APP_URL on Vercel and redeploy to open the full admin dashboard.',
          { richColors: true, duration: 8000 }
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.loginFailed'), { richColors: true });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='relative w-full max-w-[456px] mx-auto rental-login-form'>
      <div className='mb-6'>
        <Button asChild variant='ghost' size='sm' className='gap-2 text-gray-700 -ml-2'>
          <Link to='/'>
            <ChevronLeft className='h-4 w-4' />
            {t('common.goBack')}
          </Link>
        </Button>
      </div>

      <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-blue rounded-t-lg' />

      <div className='pt-4'>
        <h1 className='text-3xl sm:text-4xl font-bold mb-2 text-gradient-blue'>{t('auth.welcomeBack')}</h1>
        <p className='text-gray-700 font-medium text-base'>{t('auth.loginToClassroom')}</p>
      </div>

      <form onSubmit={onSubmit} className='mt-8 space-y-6'>
        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700'>
            {t('auth.username')} / {t('auth.email')}
          </Label>
          <Input
            type='text'
            autoComplete='username'
            placeholder={t('auth.enterUsername')}
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            className='h-11'
          />
        </div>
        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700'>{t('auth.password')}</Label>
          <InputPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.enterPassword')}
            className='h-11'
          />
        </div>

        <Button
          type='submit'
          size='lg'
          className='w-full h-11 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold'
          disabled={isPending}
        >
          {isPending ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>

      <p className='mt-6 text-center text-sm text-muted-foreground'>
        {t('auth.noAccount')}{' '}
        <Link to='/register' className='font-medium text-primary hover:underline'>
          {t('auth.registerSchool')}
        </Link>
      </p>
    </div>
  );
}
