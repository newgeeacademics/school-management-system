import { useEffect, useState } from 'react';
import {
  Bell,
  Bus,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  MessageCircle,
  Navigation,
  School,
  UserCircle2,
  Utensils,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { fetchPortalFees } from '@/lib/portal-fees';
import { fetchPortalNotifications } from '@/lib/portal-notifications';
import { PortalAttendanceView } from '@/pages/PortalAttendanceView';
import { PortalGradesView } from '@/pages/PortalGradesView';
import { PortalNotificationsView } from '@/pages/PortalNotificationsView';
import { PortalAnnouncementsView } from '@/pages/PortalAnnouncementsView';
import { PortalCalendarView } from '@/pages/PortalCalendarView';
import { PortalDirectoryView } from '@/pages/PortalDirectoryView';
import { PortalFeesView } from '@/pages/PortalFeesView';
import { PortalMessagesView } from '@/pages/PortalMessagesView';
import { PortalScheduleView } from '@/pages/PortalScheduleView';
import { useTranslation } from '@/i18n';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import { getPortalSession } from '@/lib/auth';
import { getTrackingAppOrigin } from '@/lib/school-app-url';
import type { PortalSectionId } from '@/lib/portal-sections';
import { cn } from '@/lib/utils';

function FeedSection({
  empty,
  count,
  children,
}: {
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className='portal-card p-4 md:p-5'>
      <div
        className={cn(
          'text-sm text-muted-foreground',
          count > 0 && 'grid gap-2 sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {count > 0 ? children : <p className='text-xs italic'>{empty}</p>}
      </div>
    </section>
  );
}

export function PortalOverviewView() {
  const { t } = useTranslation();
  const { feed, usesBackend, navigateSection } = usePortalFeedContext();
  const session = getPortalSession();
  const isParent = session?.role === 'parent';
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [feesCount, setFeesCount] = useState(0);

  useEffect(() => {
    if (!isParent || !usesBackend) {
      setNotificationsCount(0);
      return;
    }
    let cancelled = false;
    void fetchPortalNotifications()
      .then((data) => {
        if (!cancelled) setNotificationsCount(data.notifications.length);
      })
      .catch(() => {
        if (!cancelled) setNotificationsCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [isParent, usesBackend]);

  useEffect(() => {
    if (!isParent || !usesBackend) {
      setFeesCount(0);
      return;
    }
    let cancelled = false;
    void fetchPortalFees()
      .then((data) => {
        if (!cancelled) setFeesCount(data.length);
      })
      .catch(() => {
        if (!cancelled) setFeesCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [isParent, usesBackend]);

  const displayName = session?.name ?? session?.emailHint ?? '';
  const firstName = displayName.split(' ')[0] || displayName;
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  const quickActions = isParent
    ? [
        { label: t('portalHome.navMyChild'), icon: UserCircle2, section: 'students' as const },
        { label: t('portalHome.cardGrades'), icon: GraduationCap, section: 'grades' as const },
        { label: t('portalHome.navFees'), icon: Wallet, section: 'fees' as const },
        { label: t('portalHome.navPresence'), icon: CheckCircle2, section: 'presence' as const },
      ]
    : [
        { label: t('portalHome.cardSchedule'), icon: CalendarDays, section: 'schedule' as const },
        { label: t('portalHome.cardGrades'), icon: GraduationCap, section: 'grades' as const },
        { label: t('portalHome.cardCanteen'), icon: Utensils, section: 'canteen' as const },
        { label: t('portalHome.cardMessages'), icon: MessageCircle, section: 'messages' as const },
      ];

  const stats: Array<{
    label: string;
    value: number;
    icon: LucideIcon;
    section: PortalSectionId;
    highlight?: boolean;
  }> = isParent
    ? [
        { label: t('portalHome.overviewChildren'), value: feed.students.length, icon: Users, section: 'students' as const },
        { label: t('portalHome.navFees'), value: feesCount, icon: Wallet, section: 'fees' as const },
        { label: t('portalHome.cardGrades'), value: feed.grades.length, icon: GraduationCap, section: 'grades' as const },
        {
          label: t('portalHome.navNotifications'),
          value: notificationsCount,
          icon: Bell,
          section: 'notifications' as const,
          highlight: notificationsCount > 0,
        },
      ]
    : [
        { label: t('portalHome.cardClasses'), value: feed.classes.length, icon: School, section: 'classes' as const },
        { label: t('portalHome.overviewCourses'), value: feed.schedule.length, icon: CalendarDays, section: 'schedule' as const },
        { label: t('portalHome.cardGrades'), value: feed.grades.length, icon: GraduationCap, section: 'grades' as const },
        { label: t('portalHome.cardCalendar'), value: feed.events.length, icon: Calendar, section: 'calendar' as const },
      ];

  return (
    <div className='space-y-6 pb-4'>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]'>
        <div className='portal-card flex items-center gap-4 p-4 md:p-5'>
          <div className='flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-base font-semibold text-primary-foreground md:size-12'>
            {initial}
          </div>
          <div className='min-w-0'>
            <p className='text-base font-semibold text-foreground md:text-lg'>
              {t('portalHome.welcomeHello', { name: firstName })}
            </p>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              {isParent ? t('portalHome.welcomeParent') : t('portalHome.welcomeDefault')}
            </p>
          </div>
        </div>

        <div className='portal-card p-4 md:p-5'>
          <div className='flex items-center justify-between gap-2'>
            <h2 className='portal-section-title'>{t('portalHome.cardCalendar')}</h2>
            {feed.events.length > 0 ? (
              <button
                type='button'
                onClick={() => navigateSection('calendar')}
                className='text-xs font-medium text-primary hover:underline'
              >
                {t('portalHome.calendarUpcoming')}
              </button>
            ) : null}
          </div>
          {feed.events.length === 0 ? (
            <p className='mt-3 text-sm text-muted-foreground'>{t('portalHome.emptyEvents')}</p>
          ) : (
            <ul className='mt-3 space-y-2'>
              {feed.events.slice(0, 3).map((event) => (
                <li
                  key={event.id}
                  className='flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0'
                >
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium text-foreground'>{event.label}</p>
                    <p className='text-xs text-muted-foreground'>
                      {event.date}
                      {event.time ? ` · ${event.time}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className='portal-section-title'>{t('portalHome.quickAccess')}</h2>
        <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.section}
                type='button'
                onClick={() => navigateSection(action.section)}
                className='portal-card flex min-h-[84px] flex-col p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40 md:min-h-[88px]'
              >
                <span className='flex size-8 items-center justify-center rounded-md bg-secondary text-primary'>
                  <Icon className='size-4' aria-hidden />
                </span>
                <span className='mt-auto text-xs font-medium leading-tight text-foreground md:text-sm'>
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className='portal-section-title'>{t('portalHome.overviewTitle')}</h2>
        <div className='mt-3 grid grid-cols-2 gap-2 md:grid-cols-4'>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.section}
                type='button'
                onClick={() => navigateSection(stat.section)}
                className={cn(
                  'portal-card flex min-h-[84px] flex-col p-3.5 text-left transition-colors hover:border-primary/40 md:min-h-[88px] md:p-4',
                  stat.highlight && 'border-destructive/30 bg-destructive/5',
                )}
              >
                <div className='flex items-center justify-between'>
                  <Icon className='size-4 text-muted-foreground' aria-hidden />
                  {stat.highlight ? (
                    <span className='size-2 rounded-full bg-destructive' aria-hidden />
                  ) : null}
                </div>
                <p className='mt-auto text-xl font-semibold tabular-nums text-foreground md:text-2xl'>
                  {stat.value}
                </p>
                <p className='text-xs text-muted-foreground'>{stat.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PortalSectionView({ section }: { section: PortalSectionId }) {
  const { t } = useTranslation();
  const { feed } = usePortalFeedContext();
  const session = getPortalSession();
  const isParent = session?.role === 'parent';

  const shell = (content: React.ReactNode) => <div className='space-y-4'>{content}</div>;

  if (section === 'overview') {
    return <PortalOverviewView />;
  }

  if (section === 'presence') {
    return shell(<PortalAttendanceView variant='presence' />);
  }

  if (section === 'absences') {
    return shell(<PortalAttendanceView variant='absences' />);
  }

  if (section === 'notifications') {
    return shell(<PortalNotificationsView />);
  }

  if (section === 'directory') {
    return shell(<PortalDirectoryView />);
  }

  if (section === 'announcements') {
    return shell(<PortalAnnouncementsView />);
  }

  if (section === 'messages') {
    return shell(<PortalMessagesView />);
  }

  if (section === 'fees') {
    return shell(<PortalFeesView />);
  }

  if (section === 'classes') {
    return shell(
      <FeedSection empty={t('portalHome.emptyClasses')} count={feed.classes.length}>
        {feed.classes.map((classe) => (
          <div key={classe.id} className='rounded-lg bg-muted/40 px-3 py-2'>
            <p className='font-medium text-foreground'>{classe.name}</p>
            <p className='text-xs text-muted-foreground'>
              {classe.level ?? '—'}
              {classe.studentsCount != null ? ` · ${classe.studentsCount} élève(s)` : ''}
            </p>
          </div>
        ))}
      </FeedSection>,
    );
  }

  if (section === 'students') {
    return shell(
      <FeedSection
        empty={isParent ? t('portalHome.emptyMyChild') : t('portalHome.emptyStudents')}
        count={feed.students.length}
      >
        {feed.students.map((student) => (
          <div key={student.id} className='rounded-xl border border-border bg-muted/30 px-4 py-3'>
            <p className='font-medium text-foreground'>{student.name}</p>
            <p className='text-xs text-muted-foreground'>
              {student.className ? `${t('portalHome.classLabel')}: ${student.className}` : t('portalHome.noClass')}
            </p>
            {isParent ? (
              <p className='mt-2 text-[11px] text-primary'>{t('portalHome.childHint')}</p>
            ) : null}
          </div>
        ))}
      </FeedSection>,
    );
  }

  if (section === 'schools') {
    return shell(
      <FeedSection empty={t('portalHome.emptySchools')} count={feed.schools.length}>
        {feed.schools.map((school) => (
          <div key={school.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
            <School className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            <div>
              <p className='font-medium text-foreground'>{school.name}</p>
              <p className='text-xs'>
                {[school.city, school.country].filter(Boolean).join(', ') || school.officialEmail || '—'}
              </p>
            </div>
          </div>
        ))}
      </FeedSection>,
    );
  }

  if (section === 'calendar') {
    return shell(<PortalCalendarView />);
  }

  if (section === 'schedule') {
    return shell(<PortalScheduleView />);
  }

  if (section === 'grades') {
    return shell(<PortalGradesView />);
  }

  if (section === 'canteen') {
    return shell(
      <FeedSection empty={t('portalHome.emptyCanteen')} count={feed.canteen.length}>
        {feed.canteen.map((item) => (
          <div key={item.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
            <Utensils className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            <p>
              <span className='font-medium text-foreground'>{item.day}</span> · {item.mealType} · {item.dish}
            </p>
          </div>
        ))}
      </FeedSection>
    );
  }

  if (section === 'transport') {
    const trackingUrl = getTrackingAppOrigin();

    return shell(
      <FeedSection empty={t('portalHome.emptyTransport')} count={feed.transport.length}>
        {trackingUrl ? (
          <a
            href={trackingUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='mb-3 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10'
          >
            <span className='flex items-center gap-2'>
              <Navigation className='size-4 shrink-0' aria-hidden />
              {t('portalHome.openLiveTracking')}
            </span>
            <ExternalLink className='size-4 shrink-0 opacity-70' aria-hidden />
          </a>
        ) : null}
        {feed.transport.map((route) => (
          <div key={route.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
            <Bus className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            <p>
              <span className='font-medium text-foreground'>{route.name}</span>
              {route.departureTime ? ` · ${route.departureTime}` : ''}
            </p>
          </div>
        ))}
      </FeedSection>,
    );
  }

  return shell(
    <FeedSection empty={t('portalHome.emptySection')} count={0}>
      <p className='text-xs text-muted-foreground'>{t('portalHome.comingSoon')}</p>
    </FeedSection>,
  );
}
