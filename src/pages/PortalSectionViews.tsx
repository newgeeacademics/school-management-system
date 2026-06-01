import {
  Bus,
  CalendarDays,
  GraduationCap,
  MessageCircle,
  School,
  Utensils,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import type { PortalSectionId } from '@/lib/portal-sections';

function FeedSection({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <h2 className='text-sm font-semibold text-foreground'>{title}</h2>
      <div className='mt-3 space-y-2 text-sm text-muted-foreground'>
        {count > 0 ? children : <p className='text-xs italic'>{empty}</p>}
      </div>
    </section>
  );
}

export function PortalOverviewView() {
  const { t } = useTranslation();
  const { feed, usesBackend } = usePortalFeedContext();

  return (
    <div className='space-y-4'>
      <p className='text-base leading-relaxed text-muted-foreground'>
        {usesBackend ? t('portalHome.introLive') : t('portalHome.intro')}
      </p>
      <div className='grid gap-3 sm:grid-cols-2'>
        {[
          { label: t('portalHome.cardSchools'), count: feed.schools.length },
          { label: t('portalHome.cardSchedule'), count: feed.schedule.length },
          { label: t('portalHome.cardGrades'), count: feed.grades.length },
          { label: t('portalHome.cardCanteen'), count: feed.canteen.length },
          { label: t('portalHome.cardTransport'), count: feed.transport.length },
          { label: t('portalHome.cardMessages'), count: feed.events.length },
        ].map((item) => (
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

  if (section === 'overview') {
    return <PortalOverviewView />;
  }

  if (section === 'schools') {
    return (
      <FeedSection title={t('portalHome.cardSchools')} empty={t('portalHome.emptySchools')} count={feed.schools.length}>
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
      <FeedSection title={t('portalHome.cardSchedule')} empty={t('portalHome.emptySchedule')} count={feed.schedule.length}>
        {feed.schedule.map((item) => (
          <div key={item.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
            <CalendarDays className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            <p>
              <span className='font-medium text-foreground'>{item.day}</span> · {item.time}
              {item.room ? ` · ${item.room}` : ''}
            </p>
          </div>
        ))}
      </FeedSection>
    );
  }

  if (section === 'grades') {
    return (
      <FeedSection title={t('portalHome.cardGrades')} empty={t('portalHome.emptyGrades')} count={feed.grades.length}>
        {feed.grades.map((grade) => (
          <div key={grade.id} className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2'>
            <GraduationCap className='mt-0.5 size-4 shrink-0 text-primary' aria-hidden />
            <p>
              <span className='font-medium text-foreground'>{grade.score}/20</span>
            </p>
          </div>
        ))}
      </FeedSection>
    );
  }

  if (section === 'canteen') {
    return (
      <FeedSection title={t('portalHome.cardCanteen')} empty={t('portalHome.emptyCanteen')} count={feed.canteen.length}>
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
    return (
      <FeedSection title={t('portalHome.cardTransport')} empty={t('portalHome.emptyTransport')} count={feed.transport.length}>
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
    <FeedSection title={t('portalHome.cardMessages')} empty={t('portalHome.emptyEvents')} count={feed.events.length}>
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
