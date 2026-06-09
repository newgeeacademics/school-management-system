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
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  MapPin,
  Menu,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

import { AppLogo } from '@/components/AppLogo';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTranslation } from '@/i18n';
import { getUserPortalLoginUrl } from '@/lib/app-urls';
import { useLandingReveal } from './use-landing-reveal';
import './landing-page.css';

const FEATURE_ICONS = [GraduationCap, Users, ClipboardList, CalendarDays, MapPin, ShieldCheck] as const;
const MODULE_ICONS = [BarChart3, Users, ClipboardList, CalendarDays, Check, Wallet, Utensils, Bus] as const;

export const LandingPage = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
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

  const heroPoints = [t('landing.heroPoint1'), t('landing.heroPoint2'), t('landing.heroPoint3')];

  const stats = [
    { value: t('landing.stat1Value'), label: t('landing.stat1Label') },
    { value: t('landing.stat2Value'), label: t('landing.stat2Label') },
    { value: t('landing.stat3Value'), label: t('landing.stat3Label') },
    { value: t('landing.stat4Value'), label: t('landing.stat4Label') },
  ];

  return (
    <div className='landing'>
      <header className='landing__header'>
        <div className='landing__header-inner'>
          <Link to='/' aria-label={t('landing.logoAlt')}>
            <AppLogo name={t('landing.brandName')} />
          </Link>

          <nav className='landing__nav-desktop' aria-label='Primary'>
            <a className='landing__nav-link' href='#fonctionnalites'>
              {t('landing.navFeatures')}
            </a>
            <a className='landing__nav-link' href='#comment-ca-marche'>
              {t('landing.navHowItWorks')}
            </a>
            <a className='landing__nav-link' href='#modules'>
              {t('landing.navModules')}
            </a>
            <a className='landing__nav-link' href='#faq'>
              {t('landing.navFaq')}
            </a>
            <LanguageSwitcher showLabel className='landing__nav-link !inline-flex' />
            <a className='landing__btn landing__btn--ghost' href={getUserPortalLoginUrl()}>
              {t('landing.navUserPortal')}
            </a>
            <Link className='landing__btn landing__btn--ghost' to='/login'>
              {t('landing.signIn')}
            </Link>
            <Link className='landing__btn landing__btn--primary' to='/register'>
              {t('landing.heroCtaRegister')}
            </Link>
          </nav>

          <MobileNav />
        </div>
      </header>

      <main ref={mainRef}>
        <section className='landing__hero landing__reveal landing__reveal--in'>
          <div className='landing__hero-inner'>
            <div>
              <span className='landing__badge'>{t('landing.heroBadge')}</span>
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
              <div className='landing__preview-top'>
                <span className='landing__preview-dot landing__preview-dot--blue' />
                <span className='landing__preview-dot landing__preview-dot--green' />
                <span className='landing__preview-dot' />
              </div>
              <div className='landing__preview-body'>
                <div className='landing__preview-card landing__preview-card--accent'>
                  <p className='landing__preview-label'>{t('landing.brandName')}</p>
                  <p className='landing__preview-value'>{t('landing.previewSchool')}</p>
                  <span className='landing__preview-pill'>
                    <MapPin size={12} />
                    {t('landing.previewLocation')}
                  </span>
                </div>
                <div className='landing__preview-grid'>
                  <div className='landing__preview-card'>
                    <p className='landing__preview-label'>{t('landing.previewStudents')}</p>
                    <p className='landing__preview-value'>428</p>
                  </div>
                  <div className='landing__preview-card'>
                    <p className='landing__preview-label'>{t('landing.previewTeachers')}</p>
                    <p className='landing__preview-value'>36</p>
                  </div>
                  <div className='landing__preview-card'>
                    <p className='landing__preview-label'>{t('landing.previewClasses')}</p>
                    <p className='landing__preview-value'>18</p>
                  </div>
                  <div className='landing__preview-card'>
                    <p className='landing__preview-label'>{t('landing.previewAttendance')}</p>
                    <p className='landing__preview-value'>94%</p>
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

      <footer className='landing__footer'>
        <div className='landing__section-inner landing__footer-grid'>
          <div>
            <AppLogo name={t('landing.brandName')} />
            <p className='landing__footer-tagline'>{t('landing.footerTagline')}</p>
          </div>
          <div>
            <p className='landing__footer-heading'>{t('landing.footerContact')}</p>
            <ul className='landing__footer-list'>
              <li>
                <span className='landing__footer-label'>{t('landing.footerPhoneLabel')}</span>
                <a href='tel:+2250555965862'>+225 05 55 96 58 62</a>
              </li>
              <li>
                <span className='landing__footer-label'>{t('landing.footerEmailLabel')}</span>
                <a href='mailto:contact@newgeeacademy.com'>contact@newgeeacademy.com</a>
              </li>
            </ul>
          </div>
          <div>
            <p className='landing__footer-heading'>{t('landing.footerUsefulLinks')}</p>
            <ul className='landing__footer-list'>
              <li>
                <a href='#faq'>{t('landing.navFaq')}</a>
              </li>
              <li>
                <a href='#cgu'>{t('landing.footerCgu')}</a>
              </li>
              <li>
                <a href='#mentions-legales'>{t('landing.footerLegal')}</a>
              </li>
              <li>
                <a href='mailto:contact@newgeeacademy.com?subject=Support%20NewGee'>
                  {t('landing.footerSupport')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className='landing__footer-heading'>{t('landing.footerSocial')}</p>
            <p className='landing__footer-hint'>{t('landing.footerSocialHint')}</p>
            <div className='landing__footer-social'>
              <a href='https://www.linkedin.com' target='_blank' rel='noopener noreferrer' aria-label='LinkedIn'>
                <Linkedin size={18} />
              </a>
              <a href='https://www.facebook.com' target='_blank' rel='noopener noreferrer' aria-label='Facebook'>
                <Facebook size={18} />
              </a>
              <a href='https://www.instagram.com' target='_blank' rel='noopener noreferrer' aria-label='Instagram'>
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
        <div className='landing__section-inner landing__footer-legal'>
          <p id='cgu'>{t('landing.footerCguBloc')}</p>
          <p id='mentions-legales'>{t('landing.footerLegalBloc')}</p>
          <p className='landing__footer-copy'>
            {t('landing.footerCopyright', { year })} · {t('landing.footerSecondary')}
          </p>
        </div>
      </footer>
    </div>
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

function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type='button' className='landing__menu-btn' aria-label='Menu'>
          <Menu size={18} />
        </button>
      </SheetTrigger>
      <SheetContent side='right' className='w-full max-w-[320px] p-4'>
        <SheetHeader>
          <SheetTitle className='sr-only'>{t('landing.brandName')}</SheetTitle>
        </SheetHeader>
        <nav className='landing__mobile-panel'>
          <a className='landing__btn landing__btn--ghost' href='#fonctionnalites' onClick={close}>
            {t('landing.navFeatures')}
          </a>
          <a className='landing__btn landing__btn--ghost' href='#comment-ca-marche' onClick={close}>
            {t('landing.navHowItWorks')}
          </a>
          <a className='landing__btn landing__btn--ghost' href='#modules' onClick={close}>
            {t('landing.navModules')}
          </a>
          <a className='landing__btn landing__btn--ghost' href='#faq' onClick={close}>
            {t('landing.navFaq')}
          </a>
          <LanguageSwitcher showLabel />
          <a className='landing__btn landing__btn--ghost' href={getUserPortalLoginUrl()} onClick={close}>
            {t('landing.navUserPortal')}
          </a>
          <Link className='landing__btn landing__btn--ghost' to='/login' onClick={close}>
            {t('landing.signIn')}
          </Link>
          <Link className='landing__btn landing__btn--primary' to='/register' onClick={close}>
            {t('landing.heroCtaRegister')}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
