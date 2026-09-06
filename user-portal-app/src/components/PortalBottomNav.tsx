import { useTranslation } from '@/i18n';
import type { PortalRole } from '@/lib/auth';
import { bottomNavForRole } from '@/lib/portal-bottom-nav';
import type { PortalSectionId } from '@/lib/portal-sections';
import { cn } from '@/lib/utils';

type PortalBottomNavProps = {
  role: PortalRole;
  activeSection: PortalSectionId;
  activeIndex: number;
  notificationCount?: number;
  onSelect: (index: number) => void;
};

export function PortalBottomNav({
  role,
  activeSection,
  activeIndex,
  notificationCount = 0,
  onSelect,
}: PortalBottomNavProps) {
  const { t } = useTranslation();
  const items = bottomNavForRole(role);

  return (
    <nav
      className='shrink-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden'
      aria-label={t('portalHome.navLabel')}
    >
      <div className='portal-container flex h-16 items-stretch'>
        {items.map((item, index) => {
          const active = index === activeIndex;
          const Icon = active ? item.activeIcon : item.icon;
          const showBadge =
            item.section === 'notifications' &&
            notificationCount > 0 &&
            activeSection !== 'notifications';

          return (
            <button
              key={item.labelKey}
              type='button'
              onClick={() => onSelect(index)}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 md:gap-1',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span className='relative'>
                <Icon className='size-[22px] md:size-6' strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {showBadge ? (
                  <span className='absolute -right-1.5 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white'>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                ) : null}
              </span>
              <span className={cn('text-[11px]', active ? 'font-semibold' : 'font-medium')}>
                {t(item.labelKey)}
              </span>
              {active ? (
                <span className='absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary/20 md:inset-x-4' />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
