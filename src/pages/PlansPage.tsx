import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { LandingSiteChrome } from '@/components/landing/LandingSiteChrome';
import { useTranslation } from '@/i18n';
import { useLandingReveal } from './use-landing-reveal';

const PLAN_ID = 'establishment';

const FEATURE_ROWS = [
  'students',
  'teachers',
  'classes',
  'grades',
  'schedule',
  'attendance',
  'payments',
  'canteen',
  'transport',
  'portal',
  'support',
] as const;

export const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const mainRef = React.useRef<HTMLElement>(null);
  useLandingReveal(mainRef);

  return (
    <LandingSiteChrome>
      <main ref={mainRef} className='landing__plans-page'>
        <section className='landing__section landing__section--soft landing__reveal landing__reveal--in'>
          <div className='landing__section-inner'>
            <Link className='landing__plans-back' to='/'>
              <ArrowLeft size={16} aria-hidden />
              {t('plans.backHome')}
            </Link>
            <div className='landing__section-head landing__section-head--left'>
              <p className='landing__eyebrow'>{t('plans.eyebrow')}</p>
              <h1 className='landing__section-title'>{t('plans.pageTitle')}</h1>
              <p className='landing__section-desc landing__section-desc--left'>{t('plans.pageDesc')}</p>
            </div>
          </div>
        </section>

        <section className='landing__section landing__reveal'>
          <div className='landing__section-inner'>
            <div className='landing__plans-grid landing__plans-grid--detail landing__plans-grid--single'>
              <article className='landing__plan-card landing__plan-card--featured'>
                <h2 className='landing__plan-name'>{t(`plans.${PLAN_ID}Name`)}</h2>
                <p className='landing__plan-tagline'>{t(`plans.${PLAN_ID}Tagline`)}</p>
                <p className='landing__plan-price'>
                  {t(`plans.${PLAN_ID}Price`)}
                  <span className='landing__plan-period'>{t('plans.perStudentYear')}</span>
                </p>
                <p className='landing__plan-limit'>{t(`plans.${PLAN_ID}Limit`)}</p>
                <ul className='landing__plan-features'>
                  {FEATURE_ROWS.map((feature) => (
                    <li key={feature} className='landing__plan-feature'>
                      <Check size={16} className='landing__plan-icon' aria-hidden />
                      <span>{t(`plans.row_${feature}`)}</span>
                    </li>
                  ))}
                </ul>
                <Link className='landing__btn landing__btn--primary landing__plan-cta' to='/register'>
                  {t(`plans.${PLAN_ID}Cta`)}
                  <ArrowRight size={16} />
                </Link>
              </article>
            </div>
            <p className='landing__plans-note'>{t('plans.billingNote')}</p>
          </div>
        </section>
      </main>
    </LandingSiteChrome>
  );
};
