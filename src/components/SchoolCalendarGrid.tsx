import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarGridEvent = {
  id: string;
  label: string;
  date: string;
  time?: string;
  location?: string;
  type?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function parseEventDate(date: string): Date | null {
  if (!date || !ISO_DATE.test(date)) return null;
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type SchoolCalendarGridProps = {
  events: CalendarGridEvent[];
  className?: string;
  unscheduledTitle?: string;
};

export const SchoolCalendarGrid: React.FC<SchoolCalendarGridProps> = ({
  events,
  className,
  unscheduledTitle = 'Événements sans date calendaire',
}) => {
  const [month, setMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { gridDays, unscheduled } = React.useMemo(() => {
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    let startPad = start.getDay() - 1;
    if (startPad < 0) startPad = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    while (days.length % 7 !== 0) days.push(null);

    const unscheduled: CalendarGridEvent[] = [];
    for (const ev of events) {
      if (!parseEventDate(ev.date)) unscheduled.push(ev);
    }

    return { gridDays: days, unscheduled };
  }, [month, events]);

  const eventsForDay = (day: Date) =>
    events.filter((ev) => {
      const d = parseEventDate(ev.date);
      return d && sameDay(d, day);
    });

  const monthLabel = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const today = new Date();

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between gap-2'>
        <Button
          type='button'
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() =>
            setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
          }
          aria-label='Mois précédent'
        >
          <ChevronLeft className='size-4' />
        </Button>
        <p className='text-sm font-semibold capitalize'>{monthLabel}</p>
        <Button
          type='button'
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() =>
            setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
          }
          aria-label='Mois suivant'
        >
          <ChevronRight className='size-4' />
        </Button>
      </div>

      <div className='grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border'>
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className='bg-muted/60 px-1 py-2 text-center text-[10px] font-medium text-muted-foreground'
          >
            {weekday}
          </div>
        ))}
        {gridDays.map((day, index) => {
          const dayEvents = day ? eventsForDay(day) : [];
          const isToday = day ? sameDay(day, today) : false;
          return (
            <div
              key={index}
              className={cn(
                'min-h-[76px] bg-card p-1',
                !day && 'bg-muted/20',
                isToday && 'ring-1 ring-inset ring-primary/40'
              )}
            >
              {day ? (
                <>
                  <p
                    className={cn(
                      'text-[10px] font-medium',
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {day.getDate()}
                  </p>
                  <ul className='mt-0.5 space-y-0.5'>
                    {dayEvents.map((ev) => (
                      <li
                        key={ev.id}
                        className='truncate rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary'
                        title={[ev.label, ev.time, ev.location].filter(Boolean).join(' · ')}
                      >
                        {ev.label}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {unscheduled.length > 0 ? (
        <div className='space-y-2 rounded-lg border border-dashed p-3'>
          <p className='text-xs font-medium text-muted-foreground'>{unscheduledTitle}</p>
          <ul className='space-y-1 text-xs'>
            {unscheduled.map((ev) => (
              <li key={ev.id} className='text-foreground'>
                <span className='font-medium'>{ev.label}</span>
                {ev.date ? <span className='text-muted-foreground'> · {ev.date}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
