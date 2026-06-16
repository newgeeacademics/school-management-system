import {
  Bell,
  Bus,
  CalendarDays,
  Megaphone,
  Wallet,
  CheckCircle2,
  GraduationCap,
  LayoutGrid,
  Layers,
  LogOut,
  MessageCircle,
  Phone,
  School,
  UserCircle2,
  Utensils,
  X,
  XCircle,
} from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import type { PortalRole } from '@/lib/auth';
import {
  navGroupsForRole,
  PORTAL_SECTIONS,
  sectionLabelKey,
  type PortalSectionId,
} from '@/lib/portal-sections';
import { cn } from '@/lib/utils';

const SECTION_ICONS: Record<PortalSectionId, React.ComponentType<{ className?: string }>> = {
  overview: LayoutGrid,
  classes: Layers,
  students: UserCircle2,
  schools: School,
  schedule: CalendarDays,
  grades: GraduationCap,
  presence: CheckCircle2,
  absences: XCircle,
  notifications: Bell,
  canteen: Utensils,
  transport: Bus,
  messages: MessageCircle,
  directory: Phone,
  announcements: Megaphone,
  fees: Wallet,
};

type PortalSidebarProps = {
  activeSection: PortalSectionId;
  visibleSections: PortalSectionId[];
  role: PortalRole;
  productName: string;
  roleLabel: string;
  userName?: string;
  onNavigate: (id: PortalSectionId) => void;
  onLogout: () => void;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

export function PortalSidebar({
  activeSection,
  visibleSections,
  role,
  productName,
  roleLabel,
  userName,
  onNavigate,
  onLogout,
  mobile,
  onCloseMobile,
}: PortalSidebarProps) {
  const { t } = useTranslation();
  const navGroups = navGroupsForRole(role);

  const handleNav = (id: PortalSectionId) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  return (
    <aside
      className={cn(
        'flex h-svh w-64 shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground',
        mobile ? 'border-r' : 'hidden border-r md:flex md:h-svh'
      )}
      aria-label={t('portalHome.navLabel')}
    >
      <div className='flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <AppLogo markClassName='app-logo__mark--compact' name={productName} />
          <div className='min-w-0'>
            <p className='truncate text-[11px] text-muted-foreground'>{roleLabel}</p>
          </div>
        </div>
        {mobile ? (
          <Button type='button' variant='ghost' size='icon' className='size-8 shrink-0' onClick={onCloseMobile}>
            <X className='size-4' aria-hidden />
            <span className='sr-only'>{t('portalHome.closeMenu')}</span>
          </Button>
        ) : null}
      </div>

      <nav className='flex-1 overflow-y-auto px-2 py-3'>
        {navGroups.map((group) => {
          const items = PORTAL_SECTIONS.filter(
            (s) => group.sectionIds.includes(s.id) && visibleSections.includes(s.id)
          );
          if (items.length === 0) return null;
          return (
            <div key={group.labelKey} className='mb-4'>
              <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>
                {t(group.labelKey)}
              </p>
              <ul className='space-y-0.5'>
                {items.map(({ id }) => {
                  const Icon = SECTION_ICONS[id];
                  const active = activeSection === id;
                  return (
                    <li key={id}>
                      <button
                        type='button'
                        onClick={() => handleNav(id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                          active
                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                        )}
                      >
                        <Icon className='size-4 shrink-0 opacity-80' aria-hidden />
                        <span className='truncate'>{t(sectionLabelKey(id, role))}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className='border-t border-sidebar-border p-3'>
        {userName ? (
          <p className='mb-2 truncate px-1 text-xs font-medium text-foreground'>{userName}</p>
        ) : null}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground'
          onClick={onLogout}
        >
          <LogOut className='size-3.5' aria-hidden />
          {t('portalHome.logout')}
        </Button>
      </div>
    </aside>
  );
}
