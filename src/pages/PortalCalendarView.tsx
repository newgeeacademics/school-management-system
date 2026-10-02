import { MapPin } from 'lucide-react';

import { SchoolCalendarGrid } from '@/components/SchoolCalendarGrid';
import { useTranslation } from '@/i18n';
import { usePortalFeedContext } from '@/context/PortalFeedContext';

export function PortalCalendarView() {
  const { t } = useTranslation();
  const { feed } = usePortalFeedContext();

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>{t('portalHome.descCalendar')}</p>

      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <SchoolCalendarGrid
          events={feed.events}
          unscheduledTitle={t('portalHome.calendarUnscheduled')}
        />
      </section>

      {feed.events.length > 0 ? (
        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <h2 className='mb-3 text-sm font-semibold text-foreground'>
            {t('portalHome.calendarUpcoming')}
          </h2>
          <ul className='space-y-2 text-sm'>
            {feed.events.map((event) => (
              <li
                key={event.id}
                className='rounded-lg border border-border/60 bg-muted/30 px-3 py-2'
              >
                <p className='font-medium text-foreground'>{event.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {event.date}
                  {event.time ? ` · ${event.time}` : ''}
                </p>
                {event.location ? (
                  <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                    <MapPin className='size-3' aria-hidden />
                    {event.location}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className='text-xs italic text-muted-foreground'>{t('portalHome.emptyEvents')}</p>
      )}
    </div>
  );
}
