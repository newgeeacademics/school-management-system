import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { getPortalSession } from '@/lib/auth';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import {
  collectScheduleDays,
  collectScheduleTimeRows,
} from '@/lib/schedule-time';

export function PortalScheduleView() {
  const { t } = useTranslation();
  const { feed } = usePortalFeedContext();
  const session = getPortalSession();
  const isTeacher = session?.role === 'teacher';

  const days = useMemo(() => collectScheduleDays(feed.schedule), [feed.schedule]);
  const timeRows = useMemo(() => collectScheduleTimeRows(feed.schedule), [feed.schedule]);

  if (feed.schedule.length === 0) {
    return (
      <section className='portal-card p-4 md:p-5'>
        <p className='text-sm italic text-muted-foreground'>{t('portalHome.emptySchedule')}</p>
      </section>
    );
  }

  return (
    <div className='space-y-3'>
      {isTeacher ? (
        <p className='text-sm text-muted-foreground'>{t('portalSchedule.teacherHint')}</p>
      ) : null}

      <section className='portal-card overflow-x-auto'>
        <table className='w-full min-w-[640px] border-collapse text-sm'>
          <thead className='bg-muted'>
            <tr>
              <th className='sticky left-0 z-10 min-w-[88px] border-b border-border bg-muted px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground'>
                {t('portalSchedule.colTime')}
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className='min-w-[120px] border-b border-l border-border px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground'
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeRows.map((time) => (
              <tr key={time} className='odd:bg-card even:bg-muted/30'>
                <td className='sticky left-0 z-10 border-t border-border bg-inherit px-3 py-2.5 text-xs font-semibold text-foreground'>
                  {time}
                </td>
                {days.map((day) => {
                  const slot = feed.schedule.find((s) => s.day === day && s.time === time);
                  return (
                    <td
                      key={day}
                      className='border-t border-l border-border px-3 py-2.5 align-top'
                    >
                      {slot ? (
                        <div className='space-y-0.5'>
                          <p className='font-semibold text-foreground'>
                            {slot.courseName ?? t('portalSchedule.unassignedCourse')}
                          </p>
                          {slot.className ? (
                            <p className='text-xs text-muted-foreground'>{slot.className}</p>
                          ) : null}
                          {slot.room ? (
                            <p className='text-xs text-muted-foreground'>
                              {t('portalSchedule.roomLabel', { room: slot.room })}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground/40'>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
