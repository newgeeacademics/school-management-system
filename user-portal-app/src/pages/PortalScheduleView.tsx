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
      <section className='rounded-2xl border border-[#e2e8f0] bg-white p-5'>
        <p className='text-sm italic text-muted-foreground'>{t('portalHome.emptySchedule')}</p>
      </section>
    );
  }

  return (
    <div className='space-y-3'>
      {isTeacher ? (
        <p className='text-sm text-muted-foreground'>{t('portalSchedule.teacherHint')}</p>
      ) : null}

      <section className='overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white'>
        <table className='w-full min-w-[640px] border-collapse text-sm'>
          <thead className='bg-[#f8fafc]'>
            <tr>
              <th className='sticky left-0 z-10 min-w-[88px] border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-left text-xs font-semibold text-[#64748b]'>
                {t('portalSchedule.colTime')}
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className='min-w-[120px] border-b border-l border-[#e2e8f0] px-3 py-2.5 text-left text-xs font-semibold text-[#64748b]'
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeRows.map((time) => (
              <tr key={time} className='odd:bg-white even:bg-[#fafbfc]'>
                <td className='sticky left-0 z-10 border-t border-[#e2e8f0] bg-inherit px-3 py-2.5 text-xs font-semibold text-[#0f172a]'>
                  {time}
                </td>
                {days.map((day) => {
                  const slot = feed.schedule.find((s) => s.day === day && s.time === time);
                  return (
                    <td
                      key={day}
                      className='border-t border-l border-[#e2e8f0] px-3 py-2.5 align-top'
                    >
                      {slot ? (
                        <div className='space-y-0.5'>
                          <p className='font-semibold text-[#0f172a]'>
                            {slot.courseName ?? t('portalSchedule.unassignedCourse')}
                          </p>
                          {slot.className ? (
                            <p className='text-xs text-[#64748b]'>{slot.className}</p>
                          ) : null}
                          {slot.room ? (
                            <p className='text-xs text-[#64748b]'>
                              {t('portalSchedule.roomLabel', { room: slot.room })}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className='text-xs text-[#cbd5e1]'>—</span>
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
