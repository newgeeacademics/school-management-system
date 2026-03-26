import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { SignInForm } from '@/components/refine-ui/form/sign-in-form';
import { SchoolRegisterWizard } from '@/components/refine-ui/form/school-register-wizard';
import { ChevronLeft, GraduationCap } from 'lucide-react';

type AuthMode = 'login' | 'register';

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

      <div className='relative h-full w-full p-6 sm:p-10 flex flex-col justify-end'>
        <div className='max-w-xl rounded-2xl bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-lg border border-white/60'>
          <div className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white mb-3'>
            <GraduationCap className='h-5 w-5' />
          </div>
          <div className='text-xl sm:text-2xl font-bold text-gray-900'>{t('landing.brandName')}</div>
          <p className='text-sm sm:text-base text-gray-700 mt-2'>
            {t('auth.signIn')} / {t('auth.registerSchool')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthPage({ initialMode }: { initialMode: AuthMode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const setMode = (mode: AuthMode) => {
    navigate(mode === 'login' ? '/login' : '/register', { replace: false });
  };

  // On veut une page d'inscription 100% centrée (sans colonne droite).
  if (initialMode === 'register') {
    return (
      <div className='min-h-svh bg-white'>
        <div className='fixed top-4 left-4 md:top-6 md:left-6 z-50'>
          <Button type='button' variant='ghost' size='sm' className='text-gray-700 gap-2' onClick={() => setMode('login')}>
            <ChevronLeft className='h-4 w-4' />
            {t('common.goBack')}
          </Button>
        </div>
        <div className='mx-auto w-full max-w-xl px-2 pt-64 pb-6'>
          <SchoolRegisterWizard />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-svh bg-white'>
      <div className='w-full h-full'>
        <div className='grid md:grid-cols-[minmax(360px,470px)_1fr] min-h-svh'>
          <section className='relative flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-10 bg-white'>
            <div className='w-full max-w-[560px] mx-auto'>
              {initialMode === 'login' ? <SignInForm variant='embedded' /> : <SchoolRegisterWizard />}
            </div>
          </section>

          <aside className='hidden md:flex w-full min-h-svh'>
            <AuthIllustrationSet />
          </aside>
        </div>
      </div>
    </div>
  );
}

