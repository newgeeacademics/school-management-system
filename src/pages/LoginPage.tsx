import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrackingSignInForm } from '@/components/TrackingSignInForm';
import { getTrackingSession } from '@/lib/auth';
import { getMainAppOrigin } from '@/lib/school-app-url';
import logoSrc from '@/assets/logo/newgee-logo.png';

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
  const mainOrigin = getMainAppOrigin();

  useEffect(() => {
    if (getTrackingSession()) navigate('/suivi', { replace: true });
  }, [navigate]);

  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <main className='auth-page__main'>
          <div className='auth-page__card'>
            <a href={mainOrigin ? `${mainOrigin}/` : '#'} className='auth-page__brand-link auth-page__brand-link--hero'>
              <img src={logoSrc} alt='NewGee' className='auth-page__logo auth-page__logo--hero' />
            </a>
            <TrackingSignInForm variant='embedded' />
          </div>
        </main>
      </section>

      <TrackingIllustration />
    </div>
  );
}
