import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, RefreshCw } from 'lucide-react';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { PortalBottomNav } from '@/components/PortalBottomNav';
import { PortalMoreSectionsSheet } from '@/components/PortalMoreSectionsSheet';
import { PortalSidebar } from '@/components/PortalSidebar';
import { Button } from '@/components/ui/button';
import { clearPortalSession, getPortalSession } from '@/lib/auth';
import { useTranslation } from '@/i18n';
import { PortalFeedProvider, usePortalFeedContext } from '@/context/PortalFeedContext';
import {
  bottomNavForRole,
  bottomNavIndexForSection,
  roleHasNotifications,
} from '@/lib/portal-bottom-nav';
import { fetchPortalNotifications } from '@/lib/portal-notifications';
import { sectionFromPath, sectionLabelKey, sectionMeta, sectionsForRole } from '@/lib/portal-sections';
import { cn } from '@/lib/utils';

function PortalLayoutInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const session = getPortalSession();
  const activeSection = sectionFromPath(location.pathname);
  const meta = sectionMeta(activeSection);
  const { loading, error, reload, usesBackend, navigateSection } = usePortalFeedContext();
  const [moreOpen, setMoreOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(() =>
    session ? bottomNavIndexForSection(activeSection, session.role) : 0,
  );

  useEffect(() => {
    if (!session) return;
    setBottomIndex(bottomNavIndexForSection(activeSection, session.role));
  }, [activeSection, session]);

  useEffect(() => {
    if (!session || !roleHasNotifications(session.role) || !usesBackend) {
      setNotificationCount(0);
      return;
    }
    let cancelled = false;
    void fetchPortalNotifications()
      .then((data) => {
        if (!cancelled) setNotificationCount(data.notifications.length);
      })
      .catch(() => {
        if (!cancelled) setNotificationCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [session, usesBackend, activeSection]);

  if (!session) return null;

  const handleLogout = () => {
    clearPortalSession();
    navigate('/connexion', { replace: true });
  };

  const handleBottomNav = (index: number) => {
    const items = bottomNavForRole(session.role);
    const item = items[index];
    if (!item.section) {
      setMoreOpen(true);
      setBottomIndex(items.length - 1);
      return;
    }
    setBottomIndex(index);
    navigateSection(item.section);
  };

  const handleMoreSelect = (section: Parameters<typeof navigateSection>[0]) => {
    navigateSection(section);
    setBottomIndex(bottomNavForRole(session.role).length - 1);
  };

  const displayName = session.name ?? session.emailHint ?? '';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  const visibleSections = sectionsForRole(session.role);

  return (
    <div className='portal-dashboard flex min-h-svh'>
      <PortalSidebar
        activeSection={activeSection}
        visibleSections={visibleSections}
        role={session.role}
        productName={t('portalHome.productName')}
        userName={displayName}
        onNavigate={navigateSection}
        onLogout={handleLogout}
      />

      <div className='flex min-h-svh min-w-0 flex-1 flex-col'>
        <header className='shrink-0 border-b border-border bg-card'>
          <div className='portal-container flex items-center gap-3 py-3 md:py-3.5'>
            <div className='min-w-0 flex-1 md:pl-0'>
              <h1 className='truncate text-base font-semibold text-foreground md:text-lg'>
                {t(sectionLabelKey(activeSection, session.role))}
              </h1>
              <p className='truncate text-xs text-muted-foreground'>
                {session.role === 'parent' && activeSection === 'grades'
                  ? t('portalHome.descParentGrades')
                  : t(meta.descKey)}
              </p>
            </div>
            <div className='flex shrink-0 items-center gap-0.5'>
              {roleHasNotifications(session.role) ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='relative size-9'
                  onClick={() => navigateSection('notifications')}
                >
                  <Bell className='size-[18px] text-muted-foreground' aria-hidden />
                  {notificationCount > 0 ? (
                    <span className='absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white'>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  ) : null}
                </Button>
              ) : null}
              {usesBackend ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-9'
                  onClick={() => void reload()}
                  disabled={loading}
                >
                  <RefreshCw
                    className={cn('size-[18px] text-muted-foreground', loading && 'animate-spin')}
                    aria-hidden
                  />
                </Button>
              ) : null}
              <div className='group relative'>
                <button
                  type='button'
                  className='flex size-8 items-center justify-center rounded-md border border-border bg-muted text-sm font-semibold text-foreground'
                  aria-label={displayName}
                >
                  {initial}
                </button>
                <div className='invisible absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-border bg-card p-2 opacity-0 shadow-md transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100'>
                  <p className='px-2 py-1 text-sm font-medium text-foreground'>{displayName}</p>
                  <p className='px-2 pb-1 text-xs text-muted-foreground'>{session.email}</p>
                  <button
                    type='button'
                    onClick={handleLogout}
                    className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted'
                  >
                    <LogOut className='size-4' aria-hidden />
                    {t('portalHome.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <PushNotificationPrompt role={session.role} usesBackend={usesBackend} />

        {error ? (
          <div className='shrink-0 border-b border-amber-200 bg-amber-50'>
            <div className='portal-container flex items-center justify-between gap-3 py-2.5 text-sm text-amber-900'>
              <span className='min-w-0 flex-1'>{error}</span>
              <Button type='button' variant='ghost' size='sm' onClick={() => void reload()}>
                {t('portalHome.retry')}
              </Button>
            </div>
          </div>
        ) : null}

        <main className='min-h-0 flex-1 overflow-y-auto pb-2 md:pb-6'>
          <div className='portal-container py-4 md:py-6'>
            <Outlet />
            {!usesBackend ? (
              <p className='py-6 text-center text-xs text-muted-foreground md:text-sm'>
                {t('portalHome.comingSoon')}
              </p>
            ) : null}
          </div>
        </main>

        <PortalBottomNav
          role={session.role}
          activeSection={activeSection}
          activeIndex={bottomIndex}
          notificationCount={notificationCount}
          onSelect={handleBottomNav}
        />

        <PortalMoreSectionsSheet
          open={moreOpen}
          role={session.role}
          onClose={() => setMoreOpen(false)}
          onSelect={handleMoreSelect}
        />
      </div>
    </div>
  );
}

export function PortalLayout() {
  return (
    <PortalFeedProvider>
      <PortalLayoutInner />
    </PortalFeedProvider>
  );
}
