import type { ReactNode } from 'react';
import { ArrowLeft, BarChart3, CalendarCheck2, Check, GraduationCap, Wallet } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';
import logoSrc from '@/assets/logo/newgee-logo-tight.png';
import '@/styles/brand-tokens.css';
import '@/pages/auth-page.css';

const SHOWCASE_LABELS = {
  fr: { attendance: 'Présence', payments: 'Paiements reçus', reports: 'Bulletins publiés', students: 'Élèves' },
  en: { attendance: 'Attendance', payments: 'Payments received', reports: 'Report cards published', students: 'Students' },
} as const;

function AuthShowcase({ product }: { product: string }) {
  const { t, locale } = useTranslation();
  const labels = SHOWCASE_LABELS[locale];
  const points = [t('auth.visualPoint1'), t('auth.visualPoint2'), t('auth.visualPoint3')];

  return (
    <aside className='auth-showcase' aria-hidden>
      <div className='auth-showcase__glow auth-showcase__glow--a' />
      <div className='auth-showcase__glow auth-showcase__glow--b' />
      <div className='auth-showcase__grid' />

      <div className='auth-showcase__content'>
        <span className='auth-showcase__eyebrow'>NewGee · {product}</span>
        <h2 className='auth-showcase__title'>{t('auth.visualTitle')}</h2>
        <ul className='auth-showcase__points'>
          {points.map((point) => (
            <li key={point}>
              <span className='auth-showcase__check'>
                <Check className='h-3.5 w-3.5' strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div className='auth-showcase__cards'>
          <div className='auth-mock auth-mock--main'>
            <div className='auth-mock__head'>
              <span className='auth-mock__icon'>
                <BarChart3 className='h-4 w-4' />
              </span>
              <div>
                <p className='auth-mock__label'>{labels.attendance}</p>
                <p className='auth-mock__value'>
                  94 % <em>+3 %</em>
                </p>
              </div>
            </div>
            <div className='auth-mock__bars'>
              {[56, 72, 64, 88, 80, 92, 76].map((h, i) => (
                <span key={i} style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.07}s` }} />
              ))}
            </div>
          </div>
          <div className='auth-mock auth-mock--float-a'>
            <span className='auth-mock__icon auth-mock__icon--green'>
              <Wallet className='h-4 w-4' />
            </span>
            <div>
              <p className='auth-mock__label'>{labels.payments}</p>
              <p className='auth-mock__value auth-mock__value--sm'>+ 1 250 000 XOF</p>
            </div>
          </div>
          <div className='auth-mock auth-mock--float-b'>
            <span className='auth-mock__icon auth-mock__icon--amber'>
              <CalendarCheck2 className='h-4 w-4' />
            </span>
            <div>
              <p className='auth-mock__label'>{labels.reports}</p>
              <p className='auth-mock__value auth-mock__value--sm'>Terminale C</p>
            </div>
          </div>
          <div className='auth-mock auth-mock--float-c'>
            <span className='auth-mock__icon'>
              <GraduationCap className='h-4 w-4' />
            </span>
            <div>
              <p className='auth-mock__label'>{labels.students}</p>
              <p className='auth-mock__value auth-mock__value--sm'>428</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Split-screen sign-in shell (same design as the classroom app). */
export function AuthLayout({
  children,
  footer,
  homeHref,
  product,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** Main NewGee site (another origin). */
  homeHref: string;
  /** Product name shown on the showcase, e.g. "Admin" or "Finance". */
  product: string;
}) {
  const { t } = useTranslation();

  return (
    <div className='auth-page'>
      <section className='auth-page__panel'>
        <header className='auth-page__top'>
          <a href={homeHref} className='auth-page__brand-link' aria-label='NewGee'>
            <img src={logoSrc} alt='NewGee' className='auth-page__logo' />
          </a>
          <div className='auth-page__top-actions'>
            <a href={homeHref} className='auth-page__back'>
              <ArrowLeft className='h-4 w-4' />
              <span>{t('auth.backToSite')}</span>
            </a>
            <LanguageSwitcher showLabel />
          </div>
        </header>

        <main className='auth-page__main'>
          <div className='auth-page__card'>{children}</div>
        </main>

        {footer ? <footer className='auth-page__footer'>{footer}</footer> : null}
      </section>
      <AuthShowcase product={product} />
    </div>
  );
}
