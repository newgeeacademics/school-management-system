import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Bus,
  CalendarDays,
  Check,
  ClipboardList,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Menu,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

function scrollToSection(hash: string) {
  const id = hash.replace(/^#/, '');
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Separate user-portal app (see `user-portal-app/`). */
function userPortalConnexionHref() {
  return `${(import.meta.env.VITE_USER_PORTAL_URL ?? 'http://localhost:5174').replace(/\/$/, '')}/connexion`;
}

function NavAnchor({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (href.startsWith('#')) {
        e.preventDefault();
        scrollToSection(href);
        onNavigate?.();
      }
    },
    [href, onNavigate]
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors shrink-0'
    >
      {children}
    </a>
  );
}

export const LandingPage = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className='min-h-[100dvh] min-h-svh flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-x-hidden relative'>
      <div
        className='pointer-events-none absolute inset-0 grain-texture-light opacity-30'
        aria-hidden='true'
      />

      <header
        className={`fixed left-0 right-0 top-0 z-50 w-full border-b backdrop-blur-sm transition-colors ${
          scrolled ? 'bg-white/95 border-gray-200 shadow-sm' : 'bg-white/90 border-gray-200/80'
        }`}
      >
        <div className='container mx-auto flex h-14 sm:h-16 items-center justify-between gap-3 px-4 sm:px-5 md:px-6 max-w-7xl'>
          <Link
            to='/'
            className='font-bold text-base sm:text-lg md:text-xl text-gray-900 truncate hover:text-blue-600 transition-colors'
          >
            {t('landing.brandName')}
          </Link>

          <nav aria-label='Primary' className='hidden lg:flex items-center gap-4 xl:gap-6 shrink min-w-0'>
            <NavAnchor href='#fonctionnalites'>{t('landing.navFeatures')}</NavAnchor>
            <NavAnchor href='#evenements'>{t('landing.navEvents')}</NavAnchor>
            <NavAnchor href='#tarifs'>{t('landing.navPricing')}</NavAnchor>
            <NavAnchor href='#a-propos'>{t('landing.navAbout')}</NavAnchor>
          </nav>

          <div className='flex items-center gap-2 sm:gap-3 shrink-0'>
            <div className='hidden md:block'>
              <LanguageSwitcher showLabel className='text-gray-700' />
            </div>
            <Button asChild variant='outline' size='sm' className='hidden md:inline-flex text-gray-700 border-gray-200'>
              <a href={userPortalConnexionHref()}>{t('landing.navUserPortal')}</a>
            </Button>
            <Button asChild variant='ghost' size='sm' className='hidden md:inline-flex text-gray-700'>
              <Link to='/login'>{t('landing.signIn')}</Link>
            </Button>

            <div className='flex lg:hidden'>
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <main className='flex-1 pt-14 sm:pt-16'>
        {/* Hero */}
        <section className='container mx-auto px-4 sm:px-5 md:px-6 py-10 sm:py-14 md:py-20 max-w-7xl'>
          <div className='grid lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
            <div className='text-center lg:text-left'>
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight'>
                {t('landing.heroTitle')}
              </h1>
              <p className='mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0'>
                {t('landing.heroSubtitle')}
              </p>
              <div className='mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
                <Button
                  asChild
                  size='lg'
                  className='bg-blue-500 hover:bg-blue-600 text-white h-12 px-6 sm:px-8 text-base'
                >
                  <Link to='/register'>
                    {t('landing.heroCta')}
                    <ArrowRight className='ml-2 h-4 w-4 inline-block' />
                  </Link>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  className='h-12 px-6 sm:px-8 text-base bg-white/70 hover:bg-white'
                  onClick={() => scrollToSection('#fonctionnalites')}
                >
                  {t('landing.navFeatures')}
                </Button>
              </div>
            </div>
            <div className='flex justify-center lg:justify-end' aria-hidden={false}>
              <HeroPhoneMockup />
            </div>
          </div>
        </section>

        {/* Fonctionnalit├⌐s ΓÇö blocs A, B, C */}
        <section
          id='fonctionnalites'
          className='scroll-mt-[4.5rem] border-t border-gray-200/80 bg-white/60 py-12 sm:py-16 md:py-20'
        >
          <div className='container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl space-y-16 sm:space-y-20 md:space-y-24'>
            <PresentationRow
              eyebrow={t('landing.parentsEyebrow')}
              title={t('landing.parentsTitle')}
              body={t('landing.parentsText')}
              mockup={<MapBusIllustration />}
              mockupAlt={t('landing.parentsMockupAlt')}
              imageFirst={false}
            />
            <PresentationRow
              eyebrow={t('landing.teachersEyebrow')}
              title={t('landing.teachersTitle')}
              body={t('landing.teachersText')}
              mockup={<AttendanceIllustration />}
              mockupAlt={t('landing.teachersMockupAlt')}
              imageFirst
            />
            <PresentationRow
              eyebrow={t('landing.adminEyebrow')}
              title={t('landing.adminTitle')}
              body={t('landing.adminText')}
              mockup={<AdminIllustration />}
              mockupAlt={t('landing.adminMockupAlt')}
              imageFirst={false}
            />
          </div>
        </section>

        {/* Scan & s├⌐curit├⌐ */}
        <section
          id='scan-securite'
          className='scroll-mt-[4.5rem] border-t border-gray-200/80 bg-gradient-to-br from-blue-50/80 to-white py-12 sm:py-16 md:py-20'
        >
          <div className='container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl'>
            <div className='grid lg:grid-cols-2 gap-10 items-center'>
              <div>
                <p className='text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2'>
                  {t('landing.scanEyebrow')}
                </p>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight'>
                  {t('landing.scanTitle')}
                </h2>
                <p className='mt-4 text-gray-600 text-base sm:text-lg leading-relaxed'>
                  {t('landing.scanText')}
                </p>
              </div>
              <div className='flex justify-center'>
                <QrScanIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* ├ëv├⌐nements, Tarifs, ├Ç propos */}
        <section
          id='evenements'
          className='scroll-mt-[4.5rem] border-t border-gray-200/80 py-12 sm:py-14 bg-white'
        >
          <div className='container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl'>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>{t('landing.eventsTitle')}</h2>
            <p className='mt-3 text-gray-600 max-w-2xl'>{t('landing.eventsText')}</p>
          </div>
        </section>

        <section id='tarifs' className='scroll-mt-[4.5rem] border-t border-gray-200/80 py-12 sm:py-14 bg-gray-50/50'>
          <div className='container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl'>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>{t('landing.pricingTitle')}</h2>
            <p className='mt-3 text-gray-600 max-w-2xl'>{t('landing.pricingText')}</p>
          </div>
        </section>

        <section id='a-propos' className='scroll-mt-[4.5rem] border-t border-gray-200/80 py-12 sm:py-14 bg-white'>
          <div className='container mx-auto px-4 sm:px-5 md:px-6 max-w-7xl'>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>{t('landing.aboutTitle')}</h2>
            <p className='mt-3 text-gray-600 max-w-2xl'>{t('landing.aboutText')}</p>
          </div>
        </section>

        {/* CTA */}
        <section className='py-12 sm:py-16 md:py-20 border-t border-gray-200/80'>
          <div className='container mx-auto px-4 sm:px-5 md:px-6 text-center max-w-7xl'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-3'>{t('landing.ctaBandTitle')}</h2>
            <p className='text-gray-600 max-w-lg mx-auto mb-8 text-sm sm:text-base'>{t('landing.ctaBandSubtitle')}</p>
            <Button asChild size='lg' className='bg-blue-500 hover:bg-blue-600 text-white h-12 px-8'>
              <Link to='/register'>{t('landing.heroCta')}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className='border-t border-gray-200 bg-gray-50/80 pb-[env(safe-area-inset-bottom)]'>
        <div className='container mx-auto px-4 sm:px-5 md:px-6 py-10 sm:py-12 max-w-7xl'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10'>
            <div className='lg:col-span-1'>
              <p className='font-bold text-gray-900 text-lg'>{t('landing.brandName')}</p>
              <p className='mt-2 text-sm text-gray-600'>{t('landing.footerTagline')}</p>
            </div>
            <div>
              <p className='font-semibold text-gray-900 text-sm mb-3'>{t('landing.footerContact')}</p>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>
                  <span className='text-gray-500 block text-xs'>{t('landing.footerPhoneLabel')}</span>
                  <a href='tel:+2250555965862' className='hover:text-blue-600 transition-colors'>
                    +225 05 55 96 58 62
                  </a>
                </li>
                <li>
                  <span className='text-gray-500 block text-xs'>{t('landing.footerEmailLabel')}</span>
                  <a href='mailto:contact@newgeeacademy.com' className='hover:text-blue-600 transition-colors break-all'>
                    contact@newgeeacademy.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className='font-semibold text-gray-900 text-sm mb-3'>{t('landing.footerUsefulLinks')}</p>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#cgu' onClick={(e) => { e.preventDefault(); scrollToSection('#cgu'); }} className='text-gray-600 hover:text-blue-600 transition-colors'>
                    {t('landing.footerCgu')}
                  </a>
                </li>
                <li>
                  <a href='#mentions-legales' onClick={(e) => { e.preventDefault(); scrollToSection('#mentions-legales'); }} className='text-gray-600 hover:text-blue-600 transition-colors'>
                    {t('landing.footerLegal')}
                  </a>
                </li>
                <li>
                  <a href='mailto:contact@newgeeacademy.com?subject=Support%20NewGee' className='text-gray-600 hover:text-blue-600 transition-colors'>
                    {t('landing.footerSupport')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className='font-semibold text-gray-900 text-sm mb-3'>{t('landing.footerSocial')}</p>
              <p className='text-xs text-gray-500 mb-3'>{t('landing.footerSocialHint')}</p>
              <div className='flex items-center gap-3 text-gray-500'>
                <a
                  href='https://www.linkedin.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-blue-600 transition-colors p-1'
                  aria-label='LinkedIn'
                >
                  <Linkedin className='h-5 w-5' />
                </a>
                <a
                  href='https://www.facebook.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-blue-600 transition-colors p-1'
                  aria-label='Facebook'
                >
                  <Facebook className='h-5 w-5' />
                </a>
                <a
                  href='https://www.instagram.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-blue-600 transition-colors p-1'
                  aria-label='Instagram'
                >
                  <Instagram className='h-5 w-5' />
                </a>
              </div>
            </div>
          </div>

          <div id='cgu' className='scroll-mt-[4.5rem] mt-10 pt-8 border-t border-gray-200'>
            <p className='text-xs sm:text-sm text-gray-500 leading-relaxed'>{t('landing.footerCguBloc')}</p>
          </div>
          <div id='mentions-legales' className='scroll-mt-[4.5rem] mt-6'>
            <p className='text-xs sm:text-sm text-gray-500 leading-relaxed'>{t('landing.footerLegalBloc')}</p>
          </div>

          <p className='mt-10 text-center text-xs text-gray-400'>
            {t('landing.footerCopyright', { year })}
          </p>
        </div>
      </footer>
    </div>
  );
};

function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='h-10 w-10' aria-label='Menu'>
          <Menu className='h-5 w-5' />
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[min(100vw-2rem,320px)]'>
        <SheetHeader>
          <SheetTitle className='sr-only'>{t('landing.brandName')}</SheetTitle>
        </SheetHeader>
        <nav className='flex flex-col gap-4 pt-8'>
          <NavAnchor href='#fonctionnalites' onNavigate={() => setOpen(false)}>
            {t('landing.navFeatures')}
          </NavAnchor>
          <NavAnchor href='#evenements' onNavigate={() => setOpen(false)}>
            {t('landing.navEvents')}
          </NavAnchor>
          <NavAnchor href='#tarifs' onNavigate={() => setOpen(false)}>
            {t('landing.navPricing')}
          </NavAnchor>
          <NavAnchor href='#a-propos' onNavigate={() => setOpen(false)}>
            {t('landing.navAbout')}
          </NavAnchor>
          <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
            <span className='text-sm font-medium text-gray-500'>{t('common.language')}</span>
            <LanguageSwitcher showLabel className='text-gray-700' />
          </div>
          <Button asChild variant='outline' size='lg' className='w-full justify-center'>
            <a href={userPortalConnexionHref()} onClick={() => setOpen(false)}>
              {t('landing.navUserPortal')}
            </a>
          </Button>
          <Button asChild variant='ghost' size='lg' className='w-full justify-center'>
            <Link to='/login' onClick={() => setOpen(false)}>
              {t('landing.signIn')}
            </Link>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function PresentationRow({
  eyebrow,
  title,
  body,
  mockup,
  mockupAlt,
  imageFirst,
}: {
  eyebrow: string;
  title: string;
  body: string;
  mockup: ReactNode;
  mockupAlt: string;
  imageFirst: boolean;
}) {
  const textBlock = (
    <div className='min-w-0'>
      <p className='text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2'>{eyebrow}</p>
      <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 leading-tight'>{title}</h2>
      <p className='mt-4 text-gray-600 text-base sm:text-lg leading-relaxed'>{body}</p>
    </div>
  );

  const imageBlock = (
    <figure className='rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden aspect-[4/3] max-h-[320px] flex items-center justify-center p-4 sm:p-6'>
      <figcaption className='sr-only'>{mockupAlt}</figcaption>
      {mockup}
    </figure>
  );

  return (
    <div
      className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
        imageFirst ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''
      }`}
    >
      {textBlock}
      {imageBlock}
    </div>
  );
}

function HeroPhoneMockup() {
  const { t } = useTranslation();
  return (
    <figure className='relative w-full max-w-[280px] sm:max-w-[320px]' aria-label={t('landing.heroMockupAlt')}>
      <div className='rounded-[2rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden aspect-[9/19] max-h-[420px] mx-auto'>
        <div className='h-full flex flex-col bg-gradient-to-b from-sky-100 to-white'>
          <div className='h-[45%] bg-gradient-to-br from-emerald-100 via-sky-50 to-sky-100 relative p-3'>
            <div className='absolute inset-3 rounded-xl bg-white/90 border border-sky-200/80 shadow-inner overflow-hidden'>
              <div className='h-6 border-b border-gray-100 flex items-center px-2 gap-1'>
                <MapPin className='h-3.5 w-3.5 text-blue-500 shrink-0' />
                <span className='text-[10px] text-gray-500 truncate'>{t('landing.mockupSchoolBus')}</span>
              </div>
              <div className='relative h-[calc(100%-1.5rem)] bg-gradient-to-br from-sky-100 to-emerald-50'>
                <svg viewBox='0 0 100 80' className='w-full h-full opacity-90' aria-hidden>
                  <path
                    d='M10 60 Q 35 20, 55 40 T 90 25'
                    fill='none'
                    stroke='#0ea5e9'
                    strokeWidth='2'
                    strokeDasharray='4 3'
                  />
                </svg>
                <div className='absolute left-[42%] top-[38%] flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white shadow-lg'>
                  <Bus className='h-4 w-4' />
                </div>
              </div>
            </div>
          </div>
          <div className='flex-1 p-3 space-y-2'>
            <p className='text-[10px] font-semibold text-gray-500 uppercase tracking-wide'>{t('landing.mockupGrades')}</p>
            <div className='space-y-1.5'>
              {['Math├⌐matiques', 'Fran├ºais', 'Sciences'].map((label, i) => (
                <div key={label} className='flex justify-between items-center text-[11px] bg-white rounded-lg px-2 py-1.5 border border-gray-100 shadow-sm'>
                  <span className='text-gray-700 truncate'>{label}</span>
                  <span className='font-semibold text-blue-600 tabular-nums'>{14 + i}/20</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Smartphone className='absolute -bottom-2 -right-2 h-10 w-10 text-gray-300 opacity-40 pointer-events-none hidden sm:block' aria-hidden />
    </figure>
  );
}

function MapBusIllustration() {
  const { t } = useTranslation();
  return (
    <div className='w-full h-full min-h-[200px] relative flex items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 rounded-xl border border-sky-100'>
      <svg viewBox='0 0 200 140' className='w-[90%] max-w-[280px] h-auto' aria-hidden>
        <path d='M15 100 Q 60 30, 100 70 T 185 40' fill='none' stroke='#38bdf8' strokeWidth='3' strokeLinecap='round' />
        <circle cx='100' cy='68' r='4' fill='#3b82f6' />
        <g transform='translate(88 56)'>
          <rect x='0' y='4' width='24' height='16' rx='3' fill='#2563eb' />
          <path d='M6 8 L10 12 L18 6' stroke='white' strokeWidth='2' fill='none' />
        </g>
      </svg>
      <div className='absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-white/95 rounded-lg px-2 py-1.5 border border-gray-100 shadow-sm text-xs text-gray-600'>
        <Bus className='h-4 w-4 text-blue-500 shrink-0' />
        <span className='truncate'>{t('landing.mockupEnRoute')}</span>
      </div>
    </div>
  );
}

function AttendanceIllustration() {
  const { t } = useTranslation();
  const rows = ['Kouassi A.', 'Traor├⌐ M.', 'Yao K.', 'Kon├⌐ S.'];
  return (
    <div className='w-full h-full min-h-[200px] flex flex-col p-4 bg-white rounded-xl border border-gray-100'>
      <div className='flex items-center gap-2 mb-3 pb-2 border-b border-gray-100'>
        <ClipboardList className='h-5 w-5 text-blue-500' />
        <span className='text-sm font-semibold text-gray-800'>{t('landing.mockupTakeAttendance')}</span>
      </div>
      <ul className='space-y-2 flex-1'>
        {rows.map((name) => (
          <li key={name} className='flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2'>
            <span className='text-gray-700 truncate'>{name}</span>
            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'>
              <Check className='h-3.5 w-3.5' strokeWidth={3} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminIllustration() {
  const { t } = useTranslation();
  return (
    <div className='w-full h-full min-h-[200px] grid grid-cols-5 gap-3 p-4'>
      <div className='col-span-3 flex flex-col justify-end gap-2 rounded-xl bg-gradient-to-t from-blue-50 to-white border border-blue-100 p-3'>
        <p className='text-xs font-medium text-gray-500'>{t('landing.mockupPayments')}</p>
        <div className='flex items-end gap-1.5 h-24'>
          {[40, 65, 45, 80, 55, 90].map((h, i) => (
            <div
              key={i}
              className='flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400 opacity-90'
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className='col-span-2 rounded-xl border border-gray-200 bg-white p-2 flex flex-col'>
        <div className='flex items-center gap-1 text-blue-600 mb-2'>
          <CalendarDays className='h-4 w-4' />
          <span className='text-[10px] font-semibold uppercase tracking-wide'>{t('landing.mockupCalendar')}</span>
        </div>
        <div className='grid grid-cols-7 gap-0.5 text-[8px] text-center text-gray-400 mb-1'>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, idx) => (
            <span key={`wd-${idx}`}>{d}</span>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-0.5 flex-1'>
          {Array.from({ length: 28 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded text-[8px] flex items-center justify-center ${
                i === 12 ? 'bg-blue-500 text-white font-bold' : 'bg-gray-50 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QrScanIllustration() {
  const { t } = useTranslation();
  return (
    <div className='relative rounded-2xl border-2 border-dashed border-blue-300 bg-white p-8 shadow-lg max-w-sm'>
      <QrCode className='h-32 w-32 sm:h-40 sm:w-40 text-gray-900 mx-auto' strokeWidth={1} />
      <div className='absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md'>
        {t('landing.scanVerifiedBadge')}
      </div>
    </div>
  );
}
