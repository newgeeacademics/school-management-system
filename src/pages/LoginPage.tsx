import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '@/components/AppLogo';
import { TrackingSignInForm } from '@/components/TrackingSignInForm';
import { getTrackingSession } from '@/lib/auth';
import { getSchoolAppOrigin } from '@/lib/school-app-url';

import './auth-page.css';

function TrackingIllustration() {
  const heroImage = useMemo(
    () =>
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=80',
    []
  );

  return (
    <aside className='auth-page__visual' aria-hidden>
      <img src={heroImage} alt='' />
      <div className='auth-page__visual-overlay' />
      <div className='auth-page__visual-copy'>
        <h2>Transport scolaire en temps réel</h2>
        <p>Suivez le trajet du bus et l&apos;arrivée de votre enfant, en toute sérénité.</p>
      </div>
    </aside>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const schoolOrigin = getSchoolAppOrigin();

  useEffect(() => {
    if (getTrackingSession()) navigate('/suivi', { replace: true });
  }, [navigate]);

  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <header className='auth-page__top auth-page__top--split'>
          <a href={schoolOrigin ? `${schoolOrigin}/` : '#'} className='no-underline'>
            <AppLogo name='NewGee Transport' />
          </a>
        </header>

        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <TrackingSignInForm variant='embedded' />
          </div>
        </main>
      </section>

      <TrackingIllustration />
    </div>
  );
}
