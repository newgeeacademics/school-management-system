import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { SignInForm } from '@/components/refine-ui/form/sign-in-form';
import { AppLogo } from '@/components/AppLogo';

function AuthIllustrationSet() {
  const { t } = useTranslation();
  const heroImage = useMemo(
    () =>
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80',
    []
  );

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <img
        src={heroImage}
        alt='School students in classroom'
        className='absolute inset-0 h-full w-full object-cover'
      />
      <div className='absolute inset-0 bg-gradient-to-br from-sky-900/45 via-slate-900/25 to-blue-500/20' />
      <div
        className='absolute inset-0 opacity-20'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className='relative flex h-full w-full flex-col justify-end p-6 sm:p-10'>
        <div className='max-w-xl rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-sm sm:p-6'>
          <AppLogo className='mb-3' name={`${t('landing.brandName')} Admin`} />
          <p className='mt-2 text-sm text-gray-700 sm:text-base'>{t('auth.loginToClassroom')}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  return (
    <div className='min-h-svh bg-white'>
      <div className='grid min-h-svh md:grid-cols-[minmax(360px,470px)_1fr]'>
        <section className='relative flex flex-col justify-center bg-white px-4 py-10 sm:px-6 lg:px-10'>
          <div className='mx-auto w-full max-w-[560px]'>
            <SignInForm variant='embedded' />
          </div>
        </section>
        <aside className='hidden min-h-svh w-full md:flex'>
          <AuthIllustrationSet />
        </aside>
      </div>
    </div>
  );
}
