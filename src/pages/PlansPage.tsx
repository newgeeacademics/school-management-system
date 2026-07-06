import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Minus } from 'lucide-react';

import { LandingSiteChrome } from '@/components/landing/LandingSiteChrome';
import { useTranslation } from '@/i18n';
import { useLandingReveal } from './use-landing-reveal';

const PLAN_IDS = ['starter', 'standard', 'establishment'] as const;
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

type PlanId = (typeof PLAN_IDS)[number];
type FeatureRow = (typeof FEATURE_ROWS)[number];

function planFeatureValue(_plan: PlanId, feature: FeatureRow): boolean | string {
  const fullAccess: Record<FeatureRow, boolean | string> = {
    students: 'unlimited',
    teachers: 'unlimited',
    classes: true,
    grades: true,
    schedule: true,
    attendance: true,
    payments: true,
    canteen: true,
    transport: true,
    portal: true,
    support: 'dedicated',
  };
  return fullAccess[feature];
}

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
            <div className='landing__plans-grid landing__plans-grid--detail'>
              {PLAN_IDS.map((planId) => (
                <article
                  key={planId}
                  className={`landing__plan-card${planId === 'standard' ? ' landing__plan-card--featured' : ''}`}
                >
                  {planId === 'standard' && <span className='landing__plan-badge'>{t('plans.recommended')}</span>}
                  <h2 className='landing__plan-name'>{t(`plans.${planId}Name`)}</h2>
                  <p className='landing__plan-tagline'>{t(`plans.${planId}Tagline`)}</p>
                  <p className='landing__plan-price'>
                    {t(`plans.${planId}Price`)}
                    <span className='landing__plan-period'>{t('plans.perStudent')}</span>
                  </p>
                  <p className='landing__plan-limit'>{t(`plans.${planId}Limit`)}</p>
                  <ul className='landing__plan-features'>
                    {FEATURE_ROWS.map((feature) => {
                      const value = planFeatureValue(planId, feature);
                      return (
                        <li key={feature} className='landing__plan-feature'>
                          <PlanFeatureIcon value={value} />
                          <span>{formatPlanFeatureLabel(t, feature, value)}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Link className='landing__btn landing__btn--primary landing__plan-cta' to='/register'>
                      {t(`plans.${planId}Cta`)}
                      <ArrowRight size={16} />
                    </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='landing__section landing__section--soft landing__reveal'>
          <div className='landing__section-inner'>
            <div className='landing__section-head'>
              <h2 className='landing__section-title'>{t('plans.compareTitle')}</h2>
              <p className='landing__section-desc'>{t('plans.compareDesc')}</p>
            </div>
            <div className='landing__compare-wrap'>
              <table className='landing__compare-table'>
                <thead>
                  <tr>
                    <th scope='col'>{t('plans.compareFeature')}</th>
                    {PLAN_IDS.map((planId) => (
                      <th key={planId} scope='col'>
                        {t(`plans.${planId}Name`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((feature) => (
                    <tr key={feature}>
                      <th scope='row'>{t(`plans.row_${feature}`)}</th>
                      {PLAN_IDS.map((planId) => (
                        <td key={planId}>
                          <CompareCell value={planFeatureValue(planId, feature)} feature={feature} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className='landing__plans-note'>{t('plans.billingNote')}</p>
          </div>
        </section>
      </main>
    </LandingSiteChrome>
  );
};

function PlanFeatureIcon({ value }: { value: boolean | string }) {
  if (value === false) {
    return <Minus size={16} className='landing__plan-icon landing__plan-icon--off' aria-hidden />;
  }
  return <Check size={16} className='landing__plan-icon' aria-hidden />;
}

type TranslateFn = (key: string, vars?: Record<string, string>) => string;

function formatPlanFeatureLabel(t: TranslateFn, feature: FeatureRow, value: boolean | string): string {
  if (value === false) {
    return t(`plans.row_${feature}_excluded`);
  }
  if (value === 'unlimited') {
    return t(`plans.row_${feature}_unlimited`);
  }
  if (typeof value === 'string' && (feature === 'students' || feature === 'teachers')) {
    return t(`plans.row_${feature}_upTo`, { value });
  }
  if (feature === 'support' && typeof value === 'string') {
    return t(`plans.support_${value}`);
  }
  return t(`plans.row_${feature}`);
}

function CompareCell({ value, feature }: { value: boolean | string; feature: FeatureRow }) {
  const { t } = useTranslation();

  if (value === false) {
    return <Minus size={16} className='landing__compare-off' aria-label={t('plans.notIncluded')} />;
  }
  if (value === true) {
    return <Check size={16} className='landing__compare-on' aria-label={t('plans.included')} />;
  }
  if (value === 'unlimited') {
    return <span>{t('plans.unlimited')}</span>;
  }
  if (feature === 'support') {
    return <span>{t(`plans.support_${value}`)}</span>;
  }
  return <span>{value}</span>;
}
