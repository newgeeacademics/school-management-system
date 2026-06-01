import { AdminSignInForm } from '@/components/refine-ui/form/admin-sign-in-form';
import { LoginTokenHandoff } from '@/components/LoginTokenHandoff';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className='min-h-svh bg-white'>
      <LoginTokenHandoff />
      <div className='grid min-h-svh md:grid-cols-[minmax(360px,1fr)_minmax(0,1fr)]'>
        <section className='flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12'>
          <AdminSignInForm />
        </section>
        <aside className='hidden md:flex relative overflow-hidden bg-slate-900'>
          <img
            src='https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80'
            alt=''
            className='absolute inset-0 h-full w-full object-cover opacity-80'
          />
          <div className='absolute inset-0 bg-gradient-to-br from-sky-900/50 to-blue-600/30' />
          <div className='relative m-auto max-w-md p-8 text-white'>
            <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500'>
              <GraduationCap className='h-6 w-6' aria-hidden />
            </div>
            <p className='text-2xl font-bold'>{t('landing.brandName')}</p>
            <p className='mt-2 text-white/90'>{t('auth.loginToClassroom')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
