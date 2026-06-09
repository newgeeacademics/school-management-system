import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, UserCircle2, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import { getPortalSession } from '@/lib/auth';
import {
  fetchPortalAttendance,
  type AttendanceStatus,
  type PortalAttendanceDetail,
} from '@/lib/portal-attendance';
import { cn } from '@/lib/utils';

const selectClass =
  'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type PortalAttendanceViewProps = {
  variant: 'presence' | 'absences';
};

function statusIcon(status: AttendanceStatus) {
  if (status === 'PRESENT') return CheckCircle2;
  if (status === 'RETARD') return Clock;
  return XCircle;
}

function statusColor(status: AttendanceStatus) {
  if (status === 'PRESENT') return 'text-emerald-600 bg-emerald-50';
  if (status === 'RETARD') return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

export function PortalAttendanceView({ variant }: PortalAttendanceViewProps) {
  const statusFilter: AttendanceStatus | undefined = variant === 'presence' ? 'PRESENT' : undefined;
  const { t } = useTranslation();
  const session = getPortalSession();
  const [studentId, setStudentId] = useState('');
  const [data, setData] = useState<PortalAttendanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchPortalAttendance({
        studentId: studentId || undefined,
        status: statusFilter,
      });
      setData(detail);
      if (!studentId && detail.studentId) setStudentId(detail.studentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalAttendance.loadError'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, statusFilter, variant, t]);

  const visibleRecords =
    variant === 'absences'
      ? (data?.records ?? []).filter((r) => r.status === 'ABSENT' || r.status === 'RETARD')
      : (data?.records ?? []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const showStudentPicker = session?.role === 'parent' && (data?.students.length ?? 0) > 1;
  const stats = data?.stats;

  return (
    <div className='space-y-4'>
      {showStudentPicker ? (
        <div className='max-w-xs'>
          <Label htmlFor='attendance-student'>{t('portalGrades.studentLabel')}</Label>
          <select
            id='attendance-student'
            className={selectClass}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {data?.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.className ? ` (${s.className})` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {loading ? <p className='text-sm text-muted-foreground'>{t('common.loading')}</p> : null}
      {error ? (
        <p className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
      ) : null}

      {!loading && !error && stats ? (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            { label: t('portalAttendance.statPresent'), value: stats.presentCount, tone: 'text-emerald-700' },
            { label: t('portalAttendance.statAbsent'), value: stats.absentCount, tone: 'text-red-700' },
            { label: t('portalAttendance.statLate'), value: stats.lateCount, tone: 'text-amber-700' },
            {
              label: t('portalAttendance.statRate'),
              value: `${stats.attendanceRate}%`,
              tone: 'text-primary',
            },
          ].map((item) => (
            <div key={item.label} className='rounded-xl border border-border bg-muted/30 px-4 py-3'>
              <p className='text-xs text-muted-foreground'>{item.label}</p>
              <p className={cn('text-2xl font-semibold', item.tone)}>{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
        <h2 className='mb-3 text-sm font-semibold text-foreground'>
          {variant === 'absences'
            ? t('portalAttendance.absenceListTitle')
            : t('portalAttendance.presenceListTitle')}
        </h2>
        {!loading && visibleRecords.length === 0 ? (
          <p className='text-sm italic text-muted-foreground'>
            {variant === 'absences'
              ? t('portalAttendance.emptyAbsences')
              : t('portalAttendance.emptyPresence')}
          </p>
        ) : (
          <ul className='space-y-2'>
            {visibleRecords.map((record) => {
              const Icon = statusIcon(record.status);
              return (
                <li
                  key={record.id}
                  className='flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2.5 text-sm'
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                      statusColor(record.status)
                    )}
                  >
                    <Icon className='size-4' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium text-foreground'>
                      {record.date}
                      {record.className ? ` · ${record.className}` : ''}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {record.studentName ?? data?.studentName}
                      {' · '}
                      {t(`portalAttendance.status.${record.status}`)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!loading && data?.studentName && session?.role === 'parent' ? (
        <p className='flex items-center gap-2 text-xs text-muted-foreground'>
          <UserCircle2 className='size-3.5' aria-hidden />
          {t('portalAttendance.trackingChild', { name: data.studentName })}
        </p>
      ) : null}
    </div>
  );
}
