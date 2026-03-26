'use client';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/refine-ui/form/input-password';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setStoredRole } from '@/lib/auth';

export const SignInForm = ({ variant = 'full' }: { variant?: 'full' | 'embedded' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const isEmbedded = variant === 'embedded';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    window.setTimeout(() => {
      setStoredRole('admin');
      toast.success(t('auth.welcomeBackToast'), { richColors: true });
      setUsernameOrEmail('');
      setPassword('');
      setIsPending(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div
      className={cn(
        'relative',
        isEmbedded ? 'w-full min-h-0 p-0' : 'flex flex-col items-center justify-center p-4 md:px-6 md:py-8 min-h-svh'
      )}
    >
      <div className='fixed top-4 left-4 md:top-6 md:left-6 z-50'>
        <Button asChild variant='ghost' size='sm' className='text-gray-700 gap-2'>
          <Link to='/'>
            <ChevronLeft className='h-4 w-4' />
            {t('common.goBack')}
          </Link>
        </Button>
      </div>

      <div
        className={cn(
          'sm:w-full w-full relative rental-login-form',
          isEmbedded ? 'max-w-none mt-0 p-0' : 'max-w-[456px] mt-4 md:mt-6 p-8 bg-gray-0 border-0 overflow-hidden'
        )}
      >
        {!isEmbedded && <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-blue' />}

        <div className='px-0 relative z-10 rental-field rental-field-1'>
          <h1 className='text-4xl font-bold mb-2 text-gradient-blue'>
            {t('auth.welcomeBack')}
          </h1>
          <p className='text-gray-700 font-medium text-base'>
            {t('auth.loginToClassroom')}
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#136734] focus:border-transparent transition-all duration-200 h-11'
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#136734] focus:border-transparent transition-all duration-200 h-11'
              />
            </div>

            <Button
              type='submit'
              size='lg'
              className='rental-field rental-field-4 w-full mt-2 h-11 text-white text-center py-2 px-6 rounded-full font-semibold text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-[#2563eb] hover:bg-[#1d4ed8]'
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
