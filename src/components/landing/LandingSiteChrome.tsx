import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import logoSrc from '@/assets/logo/newgee-logo.png';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';
import { useTranslation } from '@/i18n';
import { getUserPortalLoginUrl } from '@/lib/app-urls';
import { getLandingMobilePortal } from '@/lib/landing-mobile-portal';

import '@/pages/landing-page.css';

type LandingSiteChromeProps = {
  children: React.ReactNode;
};

export function LandingSiteChrome({ children }: LandingSiteChromeProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className='landing'>
      <header className='landing__header'>
        <div className='landing__header-inner'>
          <Link to='/' aria-label={t('landing.logoAlt')} className='landing__brand-link'>
            <img src={logoSrc} alt={t('landing.brandName')} className='landing__logo' />
          </Link>

          <nav className='landing__nav-desktop' aria-label='Primary'>
            <a className='landing__nav-link' href='/#fonctionnalites'>
              {t('landing.navFeatures')}
            </a>
            <a className='landing__nav-link' href='/#comment-ca-marche'>
              {t('landing.navHowItWorks')}
            </a>
            <a className='landing__nav-link' href='/#modules'>
              {t('landing.navModules')}
            </a>
            <Link className='landing__nav-link' to='/plans'>
              {t('landing.navPlans')}
            </Link>
            <a className='landing__nav-link' href='/#faq'>
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

          <MobileMenuButton open={mobileMenuOpen} onOpen={() => setMobileMenuOpen(true)} />
        </div>
      </header>

      <LandingMobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {children}

      <footer className='landing__footer'>
        <div className='landing__section-inner landing__footer-grid'>
          <div>
            <img src={logoSrc} alt={t('landing.brandName')} className='landing__logo landing__logo--footer' />
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
                <Link to='/plans'>{t('landing.navPlans')}</Link>
              </li>
              <li>
                <a href='/#faq'>{t('landing.navFaq')}</a>
              </li>
              <li>
                <a href='/#cgu'>{t('landing.footerCgu')}</a>
              </li>
              <li>
                <a href='/#mentions-legales'>{t('landing.footerLegal')}</a>
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
}

function MobileMenuButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  const { t } = useTranslation();

  return (
    <div className='landing__header-mobile'>
      <button
        type='button'
        className='landing__menu-btn'
        aria-label={t('landing.mobileMenuTitle')}
        aria-expanded={open}
        onClick={onOpen}
      >
        <Menu size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

function LandingMobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.toggle('landing-mobile-menu-open', open);
    return () => document.body.classList.remove('landing-mobile-menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const portalTarget = getLandingMobilePortal();

  return createPortal(
    <div
      className='landing landing__mobile-root'
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        width: '100vw',
        height: '100dvh',
      }}
    >
      <button
        type='button'
        className='landing__mobile-backdrop'
        aria-label={t('landing.mobileMenuClose')}
        onClick={onClose}
      />
      <aside
        className='landing__mobile-drawer'
        role='dialog'
        aria-modal='true'
        aria-label={t('landing.mobileMenuTitle')}
      >
        <div className='landing__mobile-drawer-header'>
          <p className='landing__mobile-drawer-title'>{t('landing.mobileMenuTitle')}</p>
          <button type='button' className='landing__mobile-close' aria-label={t('landing.mobileMenuClose')} onClick={onClose}>
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <nav className='landing__mobile-panel'>
          <Link className='landing__btn landing__btn--primary landing__btn--mobile-cta landing__mobile-link' to='/register' onClick={onClose}>
            {t('school.registerSchool')}
          </Link>
          <a className='landing__btn landing__btn--ghost landing__mobile-link' href='/#fonctionnalites' onClick={onClose}>
            {t('landing.navFeatures')}
          </a>
          <a className='landing__btn landing__btn--ghost landing__mobile-link' href='/#comment-ca-marche' onClick={onClose}>
            {t('landing.navHowItWorks')}
          </a>
          <a className='landing__btn landing__btn--ghost landing__mobile-link' href='/#modules' onClick={onClose}>
            {t('landing.navModules')}
          </a>
          <Link className='landing__btn landing__btn--ghost landing__mobile-link' to='/plans' onClick={onClose}>
            {t('landing.navPlans')}
          </Link>
          <a className='landing__btn landing__btn--ghost landing__mobile-link' href='/#faq' onClick={onClose}>
            {t('landing.navFaq')}
          </a>
          <LanguageSwitcher showLabel className='landing__mobile-lang' />
          <a
            className='landing__btn landing__btn--ghost landing__mobile-link'
            href={getUserPortalLoginUrl()}
            onClick={onClose}
          >
            {t('landing.navUserPortal')}
          </a>
        </nav>
        <div className='landing__mobile-panel-cta'>
          <Link className='landing__btn landing__btn--ghost landing__btn--mobile-cta' to='/login' onClick={onClose}>
            {t('landing.signIn')}
          </Link>
        </div>
      </aside>
    </div>,
    portalTarget
  );
}
