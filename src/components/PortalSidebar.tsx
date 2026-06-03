import {
  Bus,
  CalendarDays,
  GraduationCap,
  LayoutGrid,
  Layers,
  LogOut,
  MessageCircle,
  School,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import {
  PORTAL_NAV_GROUPS,
  PORTAL_SECTIONS,
  type PortalSectionId,
} from '@/lib/portal-sections';
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

type PortalSidebarProps = {
  activeSection: PortalSectionId;
  visibleSections: PortalSectionId[];
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
  productName,
  roleLabel,
  userName,
  onNavigate,
  onLogout,
  mobile,
  onCloseMobile,
}: PortalSidebarProps) {
  const { t } = useTranslation();

  const handleNav = (id: PortalSectionId) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground',
        mobile ? 'border-r' : 'hidden border-r md:flex'
      )}
      aria-label={t('portalHome.navLabel')}
    >
      <div className='flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary'>
            NF
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold leading-tight'>{productName}</p>
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
        {PORTAL_NAV_GROUPS.map((group) => {
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
                {items.map(({ id, labelKey }) => {
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
                        <span className='truncate'>{t(labelKey)}</span>
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
