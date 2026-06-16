import { useEffect, useState } from 'react';
import {
  Bus,
  CalendarDays,
  ExternalLink,
  MessageCircle,
  Navigation,
  School,
  Utensils,
} from 'lucide-react';
import { fetchPortalNotifications } from '@/lib/portal-notifications';
import { PortalAttendanceView } from '@/pages/PortalAttendanceView';
import { PortalGradesView } from '@/pages/PortalGradesView';
import { PortalNotificationsView } from '@/pages/PortalNotificationsView';
import { PortalAnnouncementsView } from '@/pages/PortalAnnouncementsView';
import { PortalDirectoryView } from '@/pages/PortalDirectoryView';
import { PortalFeesView } from '@/pages/PortalFeesView';
import { PortalMessagesView } from '@/pages/PortalMessagesView';
import { useTranslation } from '@/i18n';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import { getPortalSession } from '@/lib/auth';
import { getTrackingAppOrigin } from '@/lib/school-app-url';
import type { PortalSectionId } from '@/lib/portal-sections';

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
    <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <div className='space-y-2 text-sm text-muted-foreground'>
        {count > 0 ? children : <p className='text-xs italic'>{empty}</p>}
      </div>
    </section>
  );
}

export function PortalOverviewView() {
  const { t } = useTranslation();
  const { feed, usesBackend } = usePortalFeedContext();
  const session = getPortalSession();
  const isParent = session?.role === 'parent';
  const [notificationsCount, setNotificationsCount] = useState(0);

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

  const introKey = isParent
    ? usesBackend
      ? 'portalHome.introParentLive'
      : 'portalHome.introParent'
    : usesBackend
      ? 'portalHome.introLive'
      : 'portalHome.intro';

  const summaryCards = isParent
    ? [
        { label: t('portalHome.navMyChild'), count: feed.students.length },
        { label: t('portalHome.cardSchedule'), count: feed.schedule.length },
        { label: t('portalHome.cardGrades'), count: feed.grades.length },
        { label: t('portalHome.navNotifications'), count: notificationsCount },
        { label: t('portalHome.cardCanteen'), count: feed.canteen.length },
        { label: t('portalHome.cardTransport'), count: feed.transport.length },
      ]
    : [
        { label: t('portalHome.cardClasses'), count: feed.classes.length },
        { label: t('portalHome.cardStudents'), count: feed.students.length },
        { label: t('portalHome.cardSchedule'), count: feed.schedule.length },
        { label: t('portalHome.cardGrades'), count: feed.grades.length },
        { label: t('portalHome.cardCanteen'), count: feed.canteen.length },
        { label: t('portalHome.cardTransport'), count: feed.transport.length },
      ];

  return (
    <div className='space-y-4'>
      <p className='text-base leading-relaxed text-muted-foreground'>{t(introKey)}</p>
      <div className='grid gap-3 sm:grid-cols-2'>
        {summaryCards.map((item) => (
          <div key={item.label} className='rounded-xl border border-border bg-muted/30 px-4 py-3'>
            <p className='text-xs text-muted-foreground'>{item.label}</p>
            <p className='text-2xl font-semibold text-foreground'>{item.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalSectionView({ section }: { section: PortalSectionId }) {
  const { t } = useTranslation();
  const { feed } = usePortalFeedContext();
  const session = getPortalSession();
  const isParent = session?.role === 'parent';

  if (section === 'overview') {
    return <PortalOverviewView />;
  }

  if (section === 'presence') {
    return <PortalAttendanceView variant='presence' />;
  }

  if (section === 'absences') {
    return <PortalAttendanceView variant='absences' />;
  }

  if (section === 'notifications') {
    return <PortalNotificationsView />;
  }

  if (section === 'directory') {
    return <PortalDirectoryView />;
  }

  if (section === 'announcements') {
    return <PortalAnnouncementsView />;
  }

  if (section === 'messages') {
    return <PortalMessagesView />;
  }

  if (section === 'fees') {
    return <PortalFeesView />;
  }

  if (section === 'classes') {
    return (
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
      </FeedSection>
    );
  }

  if (section === 'students') {
    return (
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
      </FeedSection>
    );
  }

  if (section === 'schools') {
    return (
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
      </FeedSection>
    );
  }

  if (section === 'schedule') {
    return (
      <FeedSection empty={t('portalHome.emptySchedule')} count={feed.schedule.length}>
        {feed.schedule.map((item) => (
          <div key={item.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
            <CalendarDays className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            <p>
              <span className='font-medium text-foreground'>{item.day}</span> · {item.time}
              {item.className ? ` · ${item.className}` : ''}
              {item.courseName ? ` · ${item.courseName}` : ''}
              {item.room ? ` · ${item.room}` : ''}
            </p>
          </div>
        ))}
      </FeedSection>
    );
  }

  if (section === 'grades') {
    return <PortalGradesView />;
  }

  if (section === 'canteen') {
    return (
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

    return (
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
      </FeedSection>
    );
  }

  return (
    <FeedSection empty={t('portalHome.emptyEvents')} count={feed.events.length}>
      {feed.events.map((event) => (
        <div key={event.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
          <MessageCircle className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
          <p>
            <span className='font-medium text-foreground'>{event.label}</span>
            {event.date ? ` · ${event.date}` : ''}
          </p>
        </div>
      ))}
    </FeedSection>
  );
}
