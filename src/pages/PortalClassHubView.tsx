import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckSquare, ClipboardList, GraduationCap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import { usePortalFeedContext } from '@/context/PortalFeedContext';
import { getPortalSession } from '@/lib/auth';
import {
  createPortalHomework,
  deletePortalHomework,
  fetchPortalHomework,
  fetchPortalRollCall,
  savePortalRollCall,
  type AttendanceStatusApi,
  type PortalHomeworkList,
  type PortalRollCall,
} from '@/lib/portal-class-hub';
import { PortalGradesView } from '@/pages/PortalGradesView';
import { cn } from '@/lib/utils';

type HubTab = 'attendance' | 'grades' | 'homework';

const STATUS_OPTIONS: { value: AttendanceStatusApi; labelKey: string; color: string }[] = [
  { value: 'PRESENT', labelKey: 'portalAttendance.status.PRESENT', color: 'bg-emerald-500' },
  { value: 'ABSENT', labelKey: 'portalAttendance.status.ABSENT', color: 'bg-red-500' },
  { value: 'RETARD', labelKey: 'portalAttendance.status.RETARD', color: 'bg-amber-500' },
];

function ClassList({ onSelect }: { onSelect: (classId: string) => void }) {
  const { t } = useTranslation();
  const { feed } = usePortalFeedContext();

  if (feed.classes.length === 0) {
    return <p className='text-sm italic text-muted-foreground'>{t('portalClassHub.emptyClasses')}</p>;
  }

  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted-foreground'>{t('portalClassHub.listIntro')}</p>
      <div className='grid gap-3 sm:grid-cols-2'>
        {feed.classes.map((classe) => (
          <button
            key={classe.id}
            type='button'
            onClick={() => onSelect(classe.id)}
            className='rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-muted/30'
          >
            <p className='font-semibold text-foreground'>{classe.name}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {classe.level ?? '—'}
              {classe.studentsCount != null ? ` · ${classe.studentsCount} ${t('portalClassHub.students')}` : ''}
            </p>
            <p className='mt-3 text-xs font-medium text-primary'>{t('portalClassHub.openClass')}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AttendanceTab({ classId, className }: { classId: string; className: string }) {
  const { t } = useTranslation();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<PortalRollCall | null>(null);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatusApi>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const roll = await fetchPortalRollCall(classId, date);
      setData(roll);
      const next: Record<string, AttendanceStatusApi> = {};
      for (const row of roll.students) {
        next[row.studentId] = row.status;
      }
      setStatuses(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalClassHub.attendanceLoadError'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [classId, date, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!data?.canEdit) return;
    setSaving(true);
    setError(null);
    try {
      const entries = Object.entries(statuses).map(([studentId, status]) => ({ studentId, status }));
      const saved = await savePortalRollCall({ classId, date, entries });
      setData(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalClassHub.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className='text-sm text-muted-foreground'>{t('portalClassHub.loading')}</p>;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='grid gap-1.5'>
          <Label htmlFor='roll-date'>{t('portalClassHub.dateLabel')}</Label>
          <Input
            id='roll-date'
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='w-auto'
          />
        </div>
        <p className='text-sm text-muted-foreground'>{className}</p>
      </div>

      {error ? <p className='text-sm text-destructive'>{error}</p> : null}

      {!data || data.students.length === 0 ? (
        <p className='text-sm italic text-muted-foreground'>{t('portalGrades.noStudents')}</p>
      ) : (
        <ul className='divide-y rounded-xl border border-border bg-card'>
          {data.students.map((row) => (
            <li key={row.studentId} className='flex flex-wrap items-center justify-between gap-3 px-4 py-3'>
              <span className='text-sm font-medium'>{row.studentName}</span>
              <div className='flex gap-1.5'>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type='button'
                    disabled={!data.canEdit}
                    onClick={() => setStatuses((prev) => ({ ...prev, [row.studentId]: opt.value }))}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium text-white transition',
                      opt.color,
                      statuses[row.studentId] === opt.value ? 'opacity-100 ring-2 ring-offset-2 ring-primary' : 'opacity-40',
                      !data.canEdit && 'cursor-default',
                    )}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {data?.canEdit ? (
        <Button type='button' onClick={() => void handleSave()} disabled={saving}>
          {saving ? t('portalClassHub.saving') : t('portalClassHub.saveAttendance')}
        </Button>
      ) : null}
    </div>
  );
}

function HomeworkTab({ classId, className }: { classId: string; className: string }) {
  const { t } = useTranslation();
  const [data, setData] = useState<PortalHomeworkList | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPortalHomework(classId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalClassHub.homeworkLoadError'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [classId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;
    setSaving(true);
    setError(null);
    try {
      await createPortalHomework({
        classId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        dueDate: form.dueDate,
      });
      setForm({ title: '', description: '', dueDate: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalClassHub.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await deletePortalHomework(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalClassHub.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className='text-sm text-muted-foreground'>{t('portalClassHub.loading')}</p>;

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>{className}</p>
      {error ? <p className='text-sm text-destructive'>{error}</p> : null}

      {data?.canEdit ? (
        <form onSubmit={(e) => void handleCreate(e)} className='space-y-3 rounded-xl border border-border bg-muted/20 p-4'>
          <p className='text-sm font-medium'>{t('portalClassHub.addHomework')}</p>
          <div className='grid gap-2'>
            <Label htmlFor='hw-title'>{t('portalClassHub.homeworkTitle')}</Label>
            <Input
              id='hw-title'
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='hw-desc'>{t('portalClassHub.homeworkDesc')}</Label>
            <Input
              id='hw-desc'
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='hw-due'>{t('portalClassHub.homeworkDue')}</Label>
            <Input
              id='hw-due'
              type='date'
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              required
            />
          </div>
          <Button type='submit' size='sm' disabled={saving}>
            {t('portalClassHub.addHomeworkBtn')}
          </Button>
        </form>
      ) : null}

      {data && data.items.length === 0 ? (
        <p className='text-sm italic text-muted-foreground'>{t('portalClassHub.emptyHomework')}</p>
      ) : (
        <ul className='space-y-2'>
          {data?.items.map((item) => (
            <li key={item.id} className='flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3'>
              <div>
                <p className='font-medium text-foreground'>{item.title}</p>
                {item.description ? (
                  <p className='mt-1 text-xs text-muted-foreground'>{item.description}</p>
                ) : null}
                <p className='mt-1 text-xs text-primary'>
                  {t('portalClassHub.dueOn', { date: item.dueDate })}
                </p>
              </div>
              {data.canEdit ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='shrink-0 text-destructive'
                  onClick={() => void handleDelete(item.id)}
                  disabled={saving}
                  aria-label={t('portalClassHub.deleteHomework')}
                >
                  <Trash2 className='size-4' />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClassManagement({ classId }: { classId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { feed } = usePortalFeedContext();
  const [tab, setTab] = useState<HubTab>('attendance');

  const classe = feed.classes.find((c) => c.id === classId);
  const className = classe?.name ?? t('portalClassHub.unknownClass');

  const tabs: { id: HubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'attendance', label: t('portalClassHub.tabAttendance'), icon: CheckSquare },
    { id: 'grades', label: t('portalClassHub.tabGrades'), icon: GraduationCap },
    { id: 'homework', label: t('portalClassHub.tabHomework'), icon: ClipboardList },
  ];

  return (
    <div className='space-y-4'>
      <Button type='button' variant='ghost' size='sm' className='-ml-2 gap-1' onClick={() => navigate('/accueil/classes')}>
        <ArrowLeft className='size-4' />
        {t('portalClassHub.backToList')}
      </Button>

      <div className='rounded-xl border border-border bg-muted/20 px-4 py-3'>
        <p className='text-lg font-semibold text-foreground'>{className}</p>
        {classe?.level ? <p className='text-xs text-muted-foreground'>{classe.level}</p> : null}
      </div>

      <div className='flex flex-wrap gap-2 border-b border-border pb-2'>
        {tabs.map((item) => (
          <button
            key={item.id}
            type='button'
            onClick={() => setTab(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
              tab === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            <item.icon className='size-4' aria-hidden />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'attendance' ? <AttendanceTab classId={classId} className={className} /> : null}
      {tab === 'grades' ? <PortalGradesView fixedClassId={classId} embedded /> : null}
      {tab === 'homework' ? <HomeworkTab classId={classId} className={className} /> : null}
    </div>
  );
}

export function PortalClassHubView() {
  const { classId } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const session = getPortalSession();

  if (session?.role !== 'teacher') {
    return null;
  }

  if (!classId) {
    return <ClassList onSelect={(id) => navigate(`/accueil/classes/${id}`)} />;
  }

  return <ClassManagement classId={classId} />;
}
