import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalSidebar } from '@/components/PortalSidebar';
import { clearPortalSession, getPortalSession } from '@/lib/auth';
import { getSchoolAppOrigin } from '@/lib/school-app-url';
import { useTranslation } from '@/i18n';
import { PortalFeedProvider, usePortalFeedContext } from '@/context/PortalFeedContext';
import { PortalRoleSectionGuard } from '@/components/PortalRoleSectionGuard';
import { sectionFromPath, sectionLabelKey, sectionMeta, sectionsForRole } from '@/lib/portal-sections';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useState } from 'react';

function PortalLayoutInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const session = getPortalSession();
  const schoolOrigin = getSchoolAppOrigin();
  const activeSection = sectionFromPath(location.pathname);
  const meta = sectionMeta(activeSection);
  const { loading, error, reload, usesBackend, wsConnected, navigateSection } = usePortalFeedContext();

  if (!session) return null;

  const visibleSections = sectionsForRole(session.role);

  const handleLogout = () => {
    clearPortalSession();
    navigate('/connexion', { replace: true });
  };

  return (
    <PortalRoleSectionGuard>
    <div className='portal-dashboard flex h-svh w-full overflow-hidden bg-background'>
      {isMobile && mobileNavOpen ? (
        <button
          type='button'
          className='fixed inset-0 z-40 bg-black/30 md:hidden'
          aria-label={t('portalHome.closeMenu')}
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      {isMobile ? (
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:hidden',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <PortalSidebar
            mobile
            activeSection={activeSection}
            visibleSections={visibleSections}
            role={session.role}
            productName={t('portalHome.productName')}
            userName={session.name ?? session.emailHint}
            onNavigate={navigateSection}
            onLogout={handleLogout}
            onCloseMobile={() => setMobileNavOpen(false)}
          />
        </div>
      ) : (
        <PortalSidebar
          activeSection={activeSection}
          visibleSections={visibleSections}
          role={session.role}
          productName={t('portalHome.productName')}
          userName={session.name ?? session.emailHint}
          onNavigate={navigateSection}
          onLogout={handleLogout}
        />
      )}

      <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
        <header className='sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/70'>
          <div className='flex items-center gap-3 px-4 py-3 md:px-8 md:py-4'>
            {isMobile ? (
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='mt-0.5 shrink-0'
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className='size-4' aria-hidden />
                <span className='sr-only'>{t('portalHome.openMenu')}</span>
              </Button>
            ) : null}

            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-primary'>
                  {t('portalHome.homeTitle')}
                </p>
                <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary'>
                  {session.role === 'parent'
                    ? t('portalHome.roleParent')
                    : session.role === 'teacher'
                      ? t('portalHome.roleTeacher')
                      : t('portalHome.roleStudent')}
                </span>
              </div>
              <h1 className='mt-1 text-xl font-semibold tracking-tight text-foreground md:text-2xl'>
                {t(sectionLabelKey(activeSection, session.role))}
              </h1>
              <p className='mt-0.5 text-xs text-muted-foreground md:text-sm'>
                {session.role === 'parent' && activeSection === 'grades'
                  ? t('portalHome.descParentGrades')
                  : t(meta.descKey)}
              </p>
            </div>

            <div className='flex shrink-0 flex-col items-end gap-2'>
              {usesBackend ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    wsConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  )}
                  title={wsConnected ? t('portalHome.wsConnected') : t('portalHome.wsDisconnected')}
                >
                  {wsConnected ? <Wifi className='size-3' /> : <WifiOff className='size-3' />}
                  {wsConnected ? t('portalHome.wsLive') : t('portalHome.wsOffline')}
                </span>
              ) : null}
              <div className='flex gap-1.5'>
                {usesBackend ? (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='gap-1.5'
                    onClick={() => void reload()}
                    disabled={loading}
                  >
                    <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} aria-hidden />
                    <span className='hidden sm:inline'>{t('portalHome.refresh')}</span>
                  </Button>
                ) : null}
                <Button type='button' variant='outline' size='sm' className='gap-1.5 md:hidden' onClick={handleLogout}>
                  <LogOut className='size-3.5' aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className='portal-main flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 md:px-8 md:py-8'>
          <div className='mx-auto w-full max-w-5xl flex min-h-0 flex-1 flex-col gap-6'>
          {error ? (
            <p className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
          ) : null}

          <Outlet />

          {!usesBackend ? (
            <p className='text-center text-xs text-muted-foreground'>{t('portalHome.comingSoon')}</p>
          ) : null}

          <footer className='mt-auto border-t border-border/60 pt-6 text-center text-xs text-muted-foreground'>
            <p>{t('portalHome.footerDistinct')}</p>
            <a href={`${schoolOrigin}/`} className='mt-2 inline-block font-medium text-primary hover:underline'>
              {t('portalHome.schoolWebsiteLink')}
            </a>
          </footer>
          </div>
        </main>
      </div>
    </div>
    </PortalRoleSectionGuard>
  );
}

export function PortalLayout() {
  return (
    <PortalFeedProvider>
      <PortalLayoutInner />
    </PortalFeedProvider>
  );
}
