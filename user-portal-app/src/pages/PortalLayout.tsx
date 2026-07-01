import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, RefreshCw } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { PortalBottomNav } from '@/components/PortalBottomNav';
import { PortalMoreSectionsSheet } from '@/components/PortalMoreSectionsSheet';
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
import { sectionFromPath, sectionLabelKey, sectionMeta } from '@/lib/portal-sections';
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

  return (
    <div className='portal-dashboard flex min-h-svh flex-col bg-[#f1f5f9]'>
      <header className='shrink-0 border-b border-[#e2e8f0] bg-white'>
        <div className='portal-container flex items-center gap-3 py-3 md:py-4'>
          <AppLogo markClassName='app-logo__mark--compact' />
          <div className='min-w-0 flex-1'>
            <h1 className='truncate text-lg font-bold text-[#0f172a] md:text-xl'>
              {t(sectionLabelKey(activeSection, session.role))}
            </h1>
            <p className='truncate text-xs text-[#64748b] md:text-sm'>
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
                className='relative size-9 md:size-10'
                onClick={() => navigateSection('notifications')}
              >
                <Bell className='size-5 text-[#64748b]' aria-hidden />
                {notificationCount > 0 ? (
                  <span className='absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white'>
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
                className='size-9 md:size-10'
                onClick={() => void reload()}
                disabled={loading}
              >
                <RefreshCw className={cn('size-5 text-[#64748b]', loading && 'animate-spin')} aria-hidden />
              </Button>
            ) : null}
            <div className='group relative'>
              <button
                type='button'
                className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary md:size-9 md:text-base'
                aria-label={displayName}
              >
                {initial}
              </button>
              <div className='invisible absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-[#e2e8f0] bg-white p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100'>
                <p className='px-2 py-1 text-sm font-semibold text-foreground'>{displayName}</p>
                <p className='px-2 pb-1 text-xs text-muted-foreground'>{session.email}</p>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted'
                >
                  <LogOut className='size-4' aria-hidden />
                  {t('portalHome.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className='shrink-0 border-b border-[#fed7aa] bg-[#fff7ed]'>
          <div className='portal-container flex items-center justify-between gap-3 py-2.5 text-sm text-[#9a3412]'>
            <span className='min-w-0 flex-1'>{error}</span>
            <Button type='button' variant='ghost' size='sm' onClick={() => void reload()}>
              {t('portalHome.retry')}
            </Button>
          </div>
        </div>
      ) : null}

      <main className='min-h-0 flex-1 overflow-y-auto pb-2'>
        <div className='portal-container animate-in fade-in duration-200 py-4 md:py-6'>
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
  );
}

export function PortalLayout() {
  return (
    <PortalFeedProvider>
      <PortalLayoutInner />
    </PortalFeedProvider>
  );
}
