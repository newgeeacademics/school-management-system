import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bus,
  CalendarDays,
  GraduationCap,
  LayoutGrid,
  Layers,
  LogOut,
  MessageCircle,
  RefreshCw,
  School,
  Users,
  Utensils,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearPortalSession, getPortalSession, type PortalRole } from '@/lib/auth';
import { getSchoolAppOrigin } from '@/lib/school-app-url';
import { useTranslation } from '@/i18n';
import { PortalFeedProvider, usePortalFeedContext } from '@/context/PortalFeedContext';
import { PORTAL_SECTIONS, sectionFromPath, sectionsForRole, type PortalSectionId } from '@/lib/portal-sections';
import { cn } from '@/lib/utils';

const SECTION_ICONS: Record<PortalSectionId, React.ComponentType<{ className?: string }>> = {
  overview: LayoutGrid,
  classes: Layers,
  students: Users,
  schools: School,
  schedule: CalendarDays,
  grades: GraduationCap,
  canteen: Utensils,
  transport: Bus,
  messages: MessageCircle,
};

function roleLabel(role: PortalRole, t: (k: string) => string): string {
  if (role === 'student') return t('userPortal.student');
  if (role === 'parent') return t('userPortal.parent');
  return t('userPortal.teacher');
}

function PortalLayoutInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const session = getPortalSession();
  const schoolOrigin = getSchoolAppOrigin();
  const activeSection = sectionFromPath(location.pathname);
  const { loading, error, reload, usesBackend, wsConnected, navigateSection } = usePortalFeedContext();

  if (!session) return null;

  const handleLogout = () => {
    clearPortalSession();
    navigate('/connexion', { replace: true });
  };

  const visibleSections = sectionsForRole(session.role);

  return (
    <div className='min-h-svh portal-shell flex flex-col'>
      <header className='border-b border-teal-200/50 bg-teal-50/60'>
        <div className='mx-auto max-w-3xl px-4 py-4 sm:px-6'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-primary'>{t('portalHome.productName')}</p>
              <p className='text-lg font-semibold text-foreground'>{t('portalHome.homeTitle')}</p>
              <p className='text-sm text-muted-foreground'>
                {t('portalHome.signedInAs')} · <span className='font-medium text-foreground'>{roleLabel(session.role, t)}</span>
              </p>
              {session.name ? (
                <p className='mt-1 text-xs text-muted-foreground'>{session.name}</p>
              ) : session.emailHint ? (
                <p className='mt-1 text-xs text-muted-foreground'>{session.emailHint}</p>
              ) : null}
            </div>
            <div className='flex flex-col items-end gap-2'>
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
              <div className='flex gap-2'>
                {usesBackend ? (
                  <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={() => void reload()} disabled={loading}>
                    <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
                    {t('portalHome.refresh')}
                  </Button>
                ) : null}
                <Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={handleLogout}>
                  <LogOut className='size-4' aria-hidden />
                  {t('portalHome.logout')}
                </Button>
              </div>
            </div>
          </div>

          <nav className='mt-4 flex gap-2 overflow-x-auto pb-1' aria-label={t('portalHome.navLabel')}>
            {PORTAL_SECTIONS.filter(({ id }) => visibleSections.includes(id)).map(({ id, labelKey }) => {
              const Icon = SECTION_ICONS[id];
              const active = activeSection === id;
              return (
                <Button
                  key={id}
                  type='button'
                  size='sm'
                  variant={active ? 'default' : 'outline'}
                  className='shrink-0 gap-1.5'
                  onClick={() => navigateSection(id)}
                >
                  <Icon className='size-4' aria-hidden />
                  {t(labelKey)}
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6'>
        {error ? (
          <p className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
        ) : null}

        <Outlet />

        {!usesBackend ? (
          <p className='text-center text-xs text-muted-foreground'>{t('portalHome.comingSoon')}</p>
        ) : null}

        <footer className='mt-auto border-t border-border pt-6 text-center text-xs text-muted-foreground'>
          <p>{t('portalHome.footerDistinct')}</p>
          <a href={`${schoolOrigin}/`} className='mt-2 inline-block font-medium text-primary hover:underline'>
            {t('portalHome.schoolWebsiteLink')}
          </a>
        </footer>
      </main>
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
