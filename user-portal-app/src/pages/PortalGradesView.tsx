import { useCallback, useEffect, useMemo, useState } from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import { getPortalSession } from '@/lib/auth';
import {
  EVAL_TYPE_OPTIONS,
  PERIOD_OPTIONS,
  computeStudentAverage,
  createPortalEvaluation,
  fetchPortalGradesDetail,
  getGradeScore,
  savePortalGrade,
  type EvaluationPeriod,
  type EvaluationType,
  type PortalGradesDetail,
} from '@/lib/portal-grades';
import { cn } from '@/lib/utils';

const selectClass =
  'mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type TabId = 'marks' | 'bulletin';

type PortalGradesViewProps = {
  fixedClassId?: string;
  embedded?: boolean;
};

export function PortalGradesView({ fixedClassId, embedded: _embedded = false }: PortalGradesViewProps = {}) {
  const { t } = useTranslation();
  const session = getPortalSession();
  const [tab, setTab] = useState<TabId>('marks');
  const [period, setPeriod] = useState<EvaluationPeriod>('Trimestre 1');
  const [classId, setClassId] = useState(fixedClassId ?? '');
  const [studentId, setStudentId] = useState('');
  const [data, setData] = useState<PortalGradesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newEval, setNewEval] = useState({
    courseId: '',
    label: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'Devoir' as EvaluationType,
    coefficient: 1,
    maxScore: 20,
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchPortalGradesDetail({
        classId: classId || undefined,
        period,
        studentId: studentId || undefined,
      });
      setData(detail);
      if (!fixedClassId && !classId && detail.classId) setClassId(detail.classId);
      if (!studentId && detail.studentId) setStudentId(detail.studentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalGrades.loadError'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [classId, fixedClassId, period, studentId, t]);

  useEffect(() => {
    if (fixedClassId) setClassId(fixedClassId);
  }, [fixedClassId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const canEdit = data?.canEdit ?? false;
  const isParent = session?.role === 'parent';
  const showStudentPicker = isParent && (data?.students.length ?? 0) > 1;
  const showClassPicker = !fixedClassId && canEdit && (data?.classes.length ?? 0) > 1;

  const bulletinRows = useMemo(() => {
    if (!data) return [];
    if (data.bulletin.length > 0) return data.bulletin;
    return data.students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      average: computeStudentAverage(data.evaluations, data.grades, s.id),
      rank: null as number | null,
    }));
  }, [data]);

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !newEval.courseId || !newEval.label.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createPortalEvaluation({
        classId,
        courseId: newEval.courseId,
        label: newEval.label.trim(),
        date: newEval.date,
        period,
        type: newEval.type,
        coefficient: newEval.coefficient,
        maxScore: newEval.maxScore,
      });
      setNewEval((prev) => ({ ...prev, label: '' }));
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalGrades.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = async (evaluationId: string, sid: string, raw: string) => {
    if (!canEdit) return;
    const trimmed = raw.trim();
    if (trimmed === '') return;
    const score = Number(trimmed);
    if (Number.isNaN(score) || score < 0) return;
    setSaving(true);
    setError(null);
    try {
      await savePortalGrade({ evaluationId, studentId: sid, score });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalGrades.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return <p className='text-sm text-muted-foreground'>{t('common.loading')}</p>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        {showClassPicker ? (
          <div className='min-w-[10rem] flex-1'>
            <Label htmlFor='grades-class'>{t('portalGrades.classLabel')}</Label>
            <select
              id='grades-class'
              className={selectClass}
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value=''>{t('portalGrades.chooseClass')}</option>
              {data?.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {showStudentPicker ? (
          <div className='min-w-[10rem] flex-1'>
            <Label htmlFor='grades-student'>{t('portalGrades.studentLabel')}</Label>
            <select
              id='grades-student'
              className={selectClass}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value=''>{t('portalGrades.chooseStudent')}</option>
              {data?.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className='min-w-[10rem] flex-1'>
          <Label htmlFor='grades-period'>{t('portalGrades.periodLabel')}</Label>
          <select
            id='grades-period'
            className={selectClass}
            value={period}
            onChange={(e) => setPeriod(e.target.value as EvaluationPeriod)}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='flex gap-2'>
        {(['marks', 'bulletin'] as TabId[]).map((id) => (
          <Button
            key={id}
            type='button'
            size='sm'
            variant={tab === id ? 'default' : 'outline'}
            onClick={() => setTab(id)}
          >
            {id === 'marks' ? t('portalGrades.tabMarks') : t('portalGrades.tabBulletin')}
          </Button>
        ))}
      </div>

      {error ? (
        <p className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
      ) : null}

      {!canEdit && tab === 'marks' ? (
        <p className='text-xs text-muted-foreground'>{t('portalGrades.readOnlyHint')}</p>
      ) : null}

      {tab === 'bulletin' ? (
        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <GraduationCap className='size-4 text-primary' aria-hidden />
            {t('portalGrades.bulletinTitle')}
          </h2>
          {bulletinRows.length === 0 ? (
            <p className='mt-3 text-xs italic text-muted-foreground'>{t('portalGrades.emptyBulletin')}</p>
          ) : (
            <div className='mt-3 overflow-x-auto'>
              <table className='w-full min-w-[20rem] text-sm'>
                <thead>
                  <tr className='border-b border-border text-left text-xs text-muted-foreground'>
                    {canEdit ? <th className='py-2 pr-3'>{t('portalGrades.colStudent')}</th> : null}
                    <th className='py-2 pr-3'>{t('portalGrades.colAverage')}</th>
                    {canEdit ? <th className='py-2'>{t('portalGrades.colRank')}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {bulletinRows.map((row) => (
                    <tr key={row.studentId} className='border-b border-border/60'>
                      {canEdit ? (
                        <td className='py-2 pr-3 font-medium text-foreground'>{row.studentName}</td>
                      ) : null}
                      <td className='py-2 pr-3'>
                        {row.average != null ? (
                          <span className='font-semibold text-foreground'>{row.average}/20</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      {canEdit ? (
                        <td className='py-2 text-muted-foreground'>{row.rank ?? '—'}</td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {tab === 'marks' && canEdit ? (
        <form onSubmit={handleCreateEvaluation} className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <Plus className='size-4 text-primary' aria-hidden />
            {t('portalGrades.newEvaluation')}
          </h2>
          {!classId ? (
            <p className='mt-2 text-xs text-muted-foreground'>{t('portalGrades.chooseClassFirst')}</p>
          ) : (
            <div className='mt-3 grid gap-3 sm:grid-cols-2'>
              <div>
                <Label htmlFor='eval-course'>{t('portalGrades.courseLabel')}</Label>
                <select
                  id='eval-course'
                  className={selectClass}
                  value={newEval.courseId}
                  onChange={(e) => setNewEval((p) => ({ ...p, courseId: e.target.value }))}
                  required
                >
                  <option value=''>{t('portalGrades.chooseCourse')}</option>
                  {data?.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor='eval-label'>{t('portalGrades.evalLabel')}</Label>
                <Input
                  id='eval-label'
                  value={newEval.label}
                  onChange={(e) => setNewEval((p) => ({ ...p, label: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor='eval-date'>{t('portalGrades.dateLabel')}</Label>
                <Input
                  id='eval-date'
                  type='date'
                  value={newEval.date}
                  onChange={(e) => setNewEval((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor='eval-type'>{t('portalGrades.typeLabel')}</Label>
                <select
                  id='eval-type'
                  className={selectClass}
                  value={newEval.type}
                  onChange={(e) => setNewEval((p) => ({ ...p, type: e.target.value as EvaluationType }))}
                >
                  {EVAL_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor='eval-coef'>{t('portalGrades.coefLabel')}</Label>
                <Input
                  id='eval-coef'
                  type='number'
                  min={0.1}
                  step={0.1}
                  value={newEval.coefficient}
                  onChange={(e) => setNewEval((p) => ({ ...p, coefficient: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor='eval-max'>{t('portalGrades.maxLabel')}</Label>
                <Input
                  id='eval-max'
                  type='number'
                  min={1}
                  value={newEval.maxScore}
                  onChange={(e) => setNewEval((p) => ({ ...p, maxScore: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className='sm:col-span-2'>
                <Button type='submit' disabled={saving || !classId}>
                  {t('portalGrades.addEvaluation')}
                </Button>
              </div>
            </div>
          )}
        </form>
      ) : null}

      {tab === 'marks' ? (
        <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <h2 className='text-sm font-semibold text-foreground'>{t('portalGrades.marksTitle')}</h2>
          {!data?.evaluations.length ? (
            <p className='mt-3 text-xs italic text-muted-foreground'>{t('portalGrades.emptyMarks')}</p>
          ) : !data.students.length ? (
            <p className='mt-3 text-xs italic text-muted-foreground'>{t('portalGrades.noStudents')}</p>
          ) : (
            <div className='mt-3 overflow-x-auto'>
              <table className='w-full min-w-[28rem] text-sm'>
                <thead>
                  <tr className='border-b border-border text-left text-xs text-muted-foreground'>
                    <th className='py-2 pr-3'>{t('portalGrades.colStudent')}</th>
                    {data.evaluations.map((ev) => (
                      <th key={ev.id} className='min-w-[7rem] py-2 pr-2'>
                        <span className='block font-medium text-foreground'>{ev.label}</span>
                        <span className='text-[10px]'>
                          {ev.courseName} · /{ev.maxScore}
                        </span>
                      </th>
                    ))}
                    <th className='py-2'>{t('portalGrades.colAverage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student) => {
                    const avg = computeStudentAverage(data.evaluations, data.grades, student.id);
                    return (
                      <tr key={student.id} className='border-b border-border/60'>
                        <td className='py-2 pr-3 font-medium text-foreground'>{student.name}</td>
                        {data.evaluations.map((ev) => {
                          const score = getGradeScore(data.grades, ev.id, student.id);
                          return (
                            <td key={ev.id} className='py-2 pr-2'>
                              {canEdit ? (
                                <Input
                                  type='number'
                                  min={0}
                                  max={ev.maxScore}
                                  step={0.25}
                                  className='h-8 w-20 text-sm'
                                  defaultValue={score === '' ? undefined : score}
                                  disabled={saving}
                                  onBlur={(e) => void handleGradeChange(ev.id, student.id, e.target.value)}
                                />
                              ) : (
                                <span className={cn('font-medium', score === '' ? 'text-muted-foreground' : 'text-foreground')}>
                                  {score === '' ? '—' : `${score}/${ev.maxScore}`}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className='py-2 font-semibold text-foreground'>{avg != null ? `${avg}/20` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
