import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { UserPortalSignInForm } from '@/components/refine-ui/form/user-portal-sign-in-form';
import { getPortalSession } from '@/lib/auth';

function UserPortalIllustrationSet() {
  const { t } = useTranslation();
  const heroImage =
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className='relative h-full w-full overflow-hidden'>
      <img src={heroImage} alt='' className='absolute inset-0 h-full w-full object-cover' />
      <div className='absolute inset-0 bg-gradient-to-t from-teal-950/75 via-teal-800/35 to-amber-900/20' />
      <div className='relative flex h-full w-full flex-col justify-end p-6 sm:p-10'>
        <div className='max-w-md rounded-3xl border border-white/25 bg-white/90 p-6 shadow-2xl backdrop-blur-md'>
          <div className='mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground'>
            <Heart className='size-5' aria-hidden />
          </div>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>{t('portalHome.productName')}</p>
          <p className='mt-2 text-xl font-semibold text-stone-900'>{t('userPortal.illustrationTitle')}</p>
          <p className='mt-2 text-sm leading-relaxed text-stone-600'>{t('userPortal.illustrationCaption')}</p>
        </div>
      </div>
    </div>
  );
}

export function UserPortalLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (getPortalSession()) navigate('/accueil', { replace: true });
  }, [navigate]);

  return (
    <div className='portal-login-page min-h-svh bg-gradient-to-br from-amber-50 via-background to-teal-50/40'>
      <div className='grid min-h-svh md:grid-cols-[minmax(280px,1fr)_minmax(380px,520px)]'>
        <aside className='relative hidden md:block'>
          <UserPortalIllustrationSet />
        </aside>

        <section className='flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12'>
          <div className='mx-auto w-full max-w-md rounded-[2rem] border border-teal-100/80 bg-white/95 p-6 shadow-xl shadow-teal-900/10 backdrop-blur-sm sm:p-8'>
            <UserPortalSignInForm />
          </div>
        </section>
      </div>
    </div>
  );
}
