import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

import logoSrc from '@/assets/logo/newgee-logo.png';

import { LandingSiteChrome } from '@/components/landing/LandingSiteChrome';
import { useTranslation } from '@/i18n';
import { useLandingReveal } from './use-landing-reveal';
import './landing-page.css';

const FEATURE_ICONS = [GraduationCap, Users, ClipboardList, CalendarDays, MapPin, ShieldCheck] as const;
const MODULE_ICONS = [BarChart3, Users, ClipboardList, CalendarDays, Check, Wallet, Utensils, Bus] as const;
const PLAN_IDS = ['starter', 'standard', 'establishment'] as const;

export const LandingPage = () => {
  const { t } = useTranslation();
  const mainRef = React.useRef<HTMLElement>(null);
  useLandingReveal(mainRef);

  const features = FEATURE_ICONS.map((icon, i) => ({
    icon,
    title: t(`landing.feature${i + 1}Title`),
    desc: t(`landing.feature${i + 1}Desc`),
  }));

  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`landing.step${n}Title`),
    desc: t(`landing.step${n}Desc`),
  }));

  const modules = MODULE_ICONS.map((icon, i) => ({
    icon,
    label: t(`landing.module${i + 1}`),
  }));

  const previewNav: Array<{
    icon: typeof LayoutDashboard;
    label: string;
    active?: boolean;
  }> = [
    { icon: LayoutDashboard, label: t('landing.previewNavOverview'), active: true },
    { icon: Users, label: t('landing.previewNavStudents') },
    { icon: ClipboardList, label: t('landing.previewNavGrades') },
    { icon: CalendarDays, label: t('landing.previewNavSchedule') },
    { icon: Wallet, label: t('landing.previewNavFinance') },
  ];

  const previewStats = [
    { label: t('landing.previewStudents'), value: '428', trend: '+12' },
    { label: t('landing.previewTeachers'), value: '36', trend: '+2' },
    { label: t('landing.previewClasses'), value: '18', trend: '' },
    { label: t('landing.previewAttendance'), value: '94%', trend: '+3%' },
  ];

  const previewActivity = [
    t('landing.previewActivity1'),
    t('landing.previewActivity2'),
    t('landing.previewActivity3'),
  ];

  const previewBars = [68, 82, 74, 91, 88, 76, 94];

  const heroPoints = [t('landing.heroPoint1'), t('landing.heroPoint2'), t('landing.heroPoint3')];

  const stats = [
    { value: t('landing.stat1Value'), label: t('landing.stat1Label') },
    { value: t('landing.stat2Value'), label: t('landing.stat2Label') },
    { value: t('landing.stat3Value'), label: t('landing.stat3Label') },
    { value: t('landing.stat4Value'), label: t('landing.stat4Label') },
  ];

  return (
    <LandingSiteChrome>
      <main ref={mainRef}>
        <section className='landing__hero landing__reveal landing__reveal--in'>
          <div className='landing__hero-inner'>
            <div>
              <h1 className='landing__title'>
                {t('landing.heroTitle')}{' '}
                <span className='landing__title-accent'>{t('landing.heroTitleAccent')}</span>
              </h1>
              <p className='landing__lead'>{t('landing.heroSubtitle')}</p>
              <div className='landing__hero-actions'>
                <Link className='landing__btn landing__btn--primary' to='/register'>
                  {t('landing.heroCta')}
                  <ArrowRight size={16} />
                </Link>
                <Link className='landing__btn landing__btn--ghost' to='/login'>
                  {t('landing.heroCtaSecondary')}
                </Link>
              </div>
              <div className='landing__hero-points'>
                {heroPoints.map((point) => (
                  <div key={point} className='landing__hero-point'>
                    <span className='landing__hero-point-icon' aria-hidden='true'>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className='landing__preview' aria-hidden='true'>
              <div className='landing__preview-chrome'>
                <span className='landing__preview-dot landing__preview-dot--blue' />
                <span className='landing__preview-dot landing__preview-dot--green' />
                <span className='landing__preview-dot' />
              </div>

              <div className='landing__preview-app'>
                <aside className='landing__preview-sidebar'>
                  <img src={logoSrc} alt='' className='landing__preview-logo' />
                  <nav className='landing__preview-nav'>
                    {previewNav.map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`landing__preview-nav-item${active ? ' landing__preview-nav-item--active' : ''}`}
                      >
                        <Icon size={14} strokeWidth={2.25} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </nav>
                </aside>

                <div className='landing__preview-main'>
                  <header className='landing__preview-header'>
                    <div>
                      <p className='landing__preview-eyebrow'>{t('landing.previewDashboardEyebrow')}</p>
                      <p className='landing__preview-heading'>{t('landing.previewDashboardTitle')}</p>
                    </div>
                    <div className='landing__preview-header-badges'>
                      <span className='landing__preview-badge'>{t('landing.previewSchoolYear')}</span>
                      <span className='landing__preview-badge landing__preview-badge--school'>
                        {t('landing.previewSchool')}
                      </span>
                    </div>
                  </header>

                  <div className='landing__preview-stats'>
                    {previewStats.map((stat) => (
                      <div key={stat.label} className='landing__preview-stat'>
                        <p className='landing__preview-stat-label'>{stat.label}</p>
                        <div className='landing__preview-stat-row'>
                          <p className='landing__preview-stat-value'>{stat.value}</p>
                          {stat.trend ? (
                            <span className='landing__preview-stat-trend'>{stat.trend}</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='landing__preview-panels'>
                    <div className='landing__preview-panel'>
                      <p className='landing__preview-panel-title'>{t('landing.previewChartTitle')}</p>
                      <div className='landing__preview-chart' role='presentation'>
                        {previewBars.map((height, index) => (
                          <span
                            key={index}
                            className='landing__preview-chart-bar'
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className='landing__preview-panel'>
                      <p className='landing__preview-panel-title'>{t('landing.previewActivityTitle')}</p>
                      <ul className='landing__preview-activity'>
                        {previewActivity.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='landing__section landing__section--soft landing__reveal'>
          <div className='landing__section-inner'>
            <div className='landing__stats'>
              {stats.map((stat) => (
                <div key={stat.label} className='landing__stat'>
                  <p className='landing__stat-value'>{stat.value}</p>
                  <p className='landing__stat-label'>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='landing__section landing__reveal' id='fonctionnalites'>
          <div className='landing__section-inner'>
            <div className='landing__section-head'>
              <p className='landing__eyebrow'>{t('landing.featuresEyebrow')}</p>
              <h2 className='landing__section-title'>{t('landing.featuresTitle')}</h2>
              <p className='landing__section-desc'>{t('landing.featuresDesc')}</p>
            </div>
            <div className='landing__features'>
              {features.map(({ icon: Icon, title, desc }) => (
                <article key={title} className='landing__feature'>
                  <span className='landing__feature-icon'>
                    <Icon size={22} />
                  </span>
                  <h3 className='landing__feature-title'>{title}</h3>
                  <p className='landing__feature-desc'>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='landing__section landing__section--soft landing__reveal' id='comment-ca-marche'>
          <div className='landing__section-inner'>
            <div className='landing__section-head'>
              <p className='landing__eyebrow'>{t('landing.stepsEyebrow')}</p>
              <h2 className='landing__section-title'>{t('landing.stepsTitle')}</h2>
              <p className='landing__section-desc'>{t('landing.stepsDesc')}</p>
            </div>
            <div className='landing__steps'>
              {steps.map((step, index) => (
                <article key={step.title} className='landing__step'>
                  <span className='landing__step-num'>{index + 1}</span>
                  <div>
                    <h3 className='landing__step-title'>{step.title}</h3>
                    <p className='landing__step-desc'>{step.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='landing__section landing__reveal' id='modules'>
          <div className='landing__section-inner'>
            <div className='landing__section-head'>
              <p className='landing__eyebrow'>{t('landing.modulesEyebrow')}</p>
              <h2 className='landing__section-title'>{t('landing.modulesTitle')}</h2>
              <p className='landing__section-desc'>{t('landing.modulesDesc')}</p>
            </div>
            <div className='landing__modules'>
              {modules.map(({ icon: Icon, label }) => (
                <div key={label} className='landing__module'>
                  <Icon className='landing__module-icon' size={18} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='landing__section landing__section--soft landing__reveal' id='plans'>
          <div className='landing__section-inner'>
            <div className='landing__section-head'>
              <p className='landing__eyebrow'>{t('landing.plansEyebrow')}</p>
              <h2 className='landing__section-title'>{t('landing.plansTitle')}</h2>
              <p className='landing__section-desc'>{t('landing.plansDesc')}</p>
            </div>
            <div className='landing__plans-grid'>
              {PLAN_IDS.map((planId) => (
                <article
                  key={planId}
                  className={`landing__plan-card${planId === 'standard' ? ' landing__plan-card--featured' : ''}`}
                >
                  {planId === 'standard' && <span className='landing__plan-badge'>{t('plans.recommended')}</span>}
                  <h3 className='landing__plan-name'>{t(`plans.${planId}Name`)}</h3>
                  <p className='landing__plan-tagline'>{t(`plans.${planId}Tagline`)}</p>
                  <p className='landing__plan-price'>
                    {t(`plans.${planId}Price`)}
                    {planId !== 'establishment' && <span className='landing__plan-period'>{t('plans.perMonth')}</span>}
                  </p>
                  <p className='landing__plan-limit'>{t(`plans.${planId}Limit`)}</p>
                  <ul className='landing__plan-highlights'>
                    {[1, 2, 3].map((n) => (
                      <li key={n}>
                        <Check size={14} aria-hidden />
                        {t(`plans.${planId}Highlight${n}`)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    className={`landing__btn${planId === 'standard' ? ' landing__btn--primary' : ' landing__btn--ghost'} landing__plan-cta`}
                    to='/plans'
                  >
                    {t('landing.plansViewDetails')}
                    <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LandingFaqSection />

        <section className='landing__cta landing__reveal'>
          <h2 className='landing__cta-title'>{t('landing.ctaBandTitle')}</h2>
          <p className='landing__cta-desc'>{t('landing.ctaBandSubtitle')}</p>
          <div className='landing__cta-actions'>
            <Link className='landing__btn landing__btn--on-dark' to='/register'>
              {t('landing.heroCtaRegister')}
              <ArrowRight size={16} />
            </Link>
            <Link className='landing__btn landing__btn--outline-dark' to='/login'>
              {t('landing.signIn')}
            </Link>
          </div>
        </section>
      </main>
    </LandingSiteChrome>
  );
};

const FAQ_COUNT = 6;

function LandingFaqSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    id: index + 1,
    question: t(`landing.faq${index + 1}Q`),
    answer: t(`landing.faq${index + 1}A`),
  }));

  return (
    <section className='landing__section landing__section--soft landing__reveal' id='faq'>
      <div className='landing__section-inner'>
        <div className='landing__section-head'>
          <p className='landing__eyebrow'>{t('landing.faqEyebrow')}</p>
          <h2 className='landing__section-title'>{t('landing.faqTitle')}</h2>
          <p className='landing__section-desc'>{t('landing.faqDesc')}</p>
        </div>
        <div className='landing__faq'>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={item.id}
                className={`landing__faq-item${isOpen ? ' landing__faq-item--open' : ''}`}
              >
                <button
                  type='button'
                  className='landing__faq-trigger'
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <ChevronDown size={18} className='landing__faq-chevron' aria-hidden='true' />
                </button>
                <div className='landing__faq-panel' aria-hidden={!isOpen}>
                  <p className='landing__faq-answer'>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
