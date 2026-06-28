import {
  Bell,
  Bus,
  Calendar,
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
  calendar: Calendar,
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
        'portal-sidebar flex h-svh w-[17rem] shrink-0 flex-col border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-sm',
        mobile ? '' : 'hidden md:flex md:h-svh'
      )}
      aria-label={t('portalHome.navLabel')}
    >
      <div className='border-b border-sidebar-border/80 px-5 py-5'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <AppLogo markClassName='app-logo__mark--compact' name={productName} />
            {userName ? (
              <p className='mt-3 truncate text-sm font-semibold text-foreground'>{userName}</p>
            ) : (
              <p className='mt-3 truncate text-sm text-muted-foreground'>{productName}</p>
            )}
            <p className='mt-0.5 text-[11px] text-muted-foreground capitalize'>
              {role === 'parent'
                ? t('portalHome.roleParent')
                : role === 'teacher'
                  ? t('portalHome.roleTeacher')
                  : t('portalHome.roleStudent')}
            </p>
          </div>
          {mobile ? (
            <Button type='button' variant='ghost' size='icon' className='size-8 shrink-0' onClick={onCloseMobile}>
              <X className='size-4' aria-hidden />
              <span className='sr-only'>{t('portalHome.closeMenu')}</span>
            </Button>
          ) : null}
        </div>
      </div>

      <nav className='flex-1 overflow-y-auto px-3 py-4'>
        {navGroups.map((group) => {
          const items = PORTAL_SECTIONS.filter(
            (s) => group.sectionIds.includes(s.id) && visibleSections.includes(s.id)
          );
          if (items.length === 0) return null;
          return (
            <div key={group.labelKey} className='mb-5'>
              <p className='mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80'>
                {t(group.labelKey)}
              </p>
              <ul className='space-y-1'>
                {items.map(({ id }) => {
                  const Icon = SECTION_ICONS[id];
                  const active = activeSection === id;
                  return (
                    <li key={id}>
                      <button
                        type='button'
                        onClick={() => handleNav(id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/80'
                        )}
                      >
                        <Icon className={cn('size-4 shrink-0', active ? 'opacity-100' : 'opacity-70')} aria-hidden />
                        <span className='truncate font-medium'>{t(sectionLabelKey(id, role))}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className='border-t border-sidebar-border/80 p-4'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='w-full justify-start gap-2 rounded-xl text-xs text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground'
          onClick={onLogout}
        >
          <LogOut className='size-3.5' aria-hidden />
          {t('portalHome.logout')}
        </Button>
      </div>
    </aside>
  );
}
