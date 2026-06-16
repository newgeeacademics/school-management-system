import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, GraduationCap, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import { getPortalSession } from '@/lib/auth';
import {
  DEFAULT_EVAL_TYPE_OPTIONS,
  DEFAULT_PERIOD_OPTIONS,
  computeStudentAverage,
  createPortalEvaluation,
  downloadPortalEvaluationDocument,
  fetchPortalGradesDetail,
  getGradeScore,
  savePortalGrade,
  fetchPortalGradeModificationRequests,
  submitPortalGradeModificationRequest,
  type PortalGradeModificationRequest,
  uploadPortalEvaluationDocument,
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
  const [modRequests, setModRequests] = useState<PortalGradeModificationRequest[]>([]);
  const [modDialog, setModDialog] = useState<{
    evaluationId: string;
    studentId: string;
    studentName: string;
    evaluationLabel: string;
    maxScore: number;
    currentScore: number;
    requestedScore: number;
    reason: string;
  } | null>(null);

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
      if (detail.canEdit) {
        try {
          const requests = await fetchPortalGradeModificationRequests();
          setModRequests(requests);
        } catch {
          setModRequests([]);
        }
      } else {
        setModRequests([]);
      }
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
  const gradingScale = data?.gradingConfig?.gradingScale ?? 20;
  const periodOptions = data?.gradingConfig?.evaluationPeriods?.length
    ? data.gradingConfig.evaluationPeriods
    : DEFAULT_PERIOD_OPTIONS;
  const typeOptions = data?.gradingConfig?.evaluationTypes?.length
    ? data.gradingConfig.evaluationTypes
    : DEFAULT_EVAL_TYPE_OPTIONS;

  const bulletinRows = useMemo(() => {
    if (!data) return [];
    if (data.bulletin.length > 0) return data.bulletin;
    const scale = data.gradingConfig?.gradingScale ?? 20;
    return data.students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      average: computeStudentAverage(data.evaluations, data.grades, s.id, scale),
      rank: null as number | null,
    }));
  }, [data]);

  useEffect(() => {
    if (data?.gradingConfig?.gradingScale) {
      setNewEval((p) => ({ ...p, maxScore: data.gradingConfig!.gradingScale }));
    }
    if (data?.gradingConfig?.evaluationTypes?.[0]) {
      setNewEval((p) => ({ ...p, type: data.gradingConfig!.evaluationTypes[0] as EvaluationType }));
    }
  }, [data?.gradingConfig?.gradingScale, data?.gradingConfig?.evaluationTypes]);

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

  const handleUploadDocument = async (evaluationId: string, file: File) => {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      await uploadPortalEvaluationDocument(evaluationId, file);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalGrades.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = async (
    evaluationId: string,
    sid: string,
    raw: string,
    previousScore: number | '',
    studentName: string,
    evaluationLabel: string,
    maxScore: number,
  ) => {
    if (!canEdit) return;
    const trimmed = raw.trim();
    if (trimmed === '') return;
    const score = Number(trimmed);
    if (Number.isNaN(score) || score < 0) return;

    if (previousScore !== '' && score !== previousScore) {
      setModDialog({
        evaluationId,
        studentId: sid,
        studentName,
        evaluationLabel,
        maxScore,
        currentScore: previousScore,
        requestedScore: score,
        reason: '',
      });
      return;
    }

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

  const submitModificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modDialog || !modDialog.reason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await submitPortalGradeModificationRequest({
        evaluationId: modDialog.evaluationId,
        studentId: modDialog.studentId,
        requestedScore: modDialog.requestedScore,
        reason: modDialog.reason.trim(),
      });
      setModDialog(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portalGrades.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const hasPendingRequest = (evaluationId: string, sid: string) =>
    modRequests.some(
      (r) => r.status === 'PENDING' && r.evaluationId === evaluationId && r.studentId === sid,
    );

  if (loading && !data) {
    return <p className='text-sm text-muted-foreground'>{t('common.loading')}</p>;
  }

  return (
    <div className='space-y-4'>
      {modDialog ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-md rounded-xl border bg-card p-4 shadow-lg'>
            <h3 className='text-sm font-semibold'>Demande de modification de note</h3>
            <form className='mt-3 space-y-3 text-sm' onSubmit={(e) => void submitModificationRequest(e)}>
              <p>
                <span className='font-medium'>{modDialog.studentName}</span> · {modDialog.evaluationLabel}
              </p>
              <p className='text-muted-foreground text-xs'>
                Note actuelle : {modDialog.currentScore}/{modDialog.maxScore}
              </p>
              <div>
                <Label htmlFor='portal-mod-score'>Nouvelle note demandée</Label>
                <Input
                  id='portal-mod-score'
                  type='number'
                  min={0}
                  max={modDialog.maxScore}
                  step={0.25}
                  className='mt-1'
                  value={modDialog.requestedScore}
                  onChange={(e) =>
                    setModDialog((d) => (d ? { ...d, requestedScore: Number(e.target.value) } : d))
                  }
                />
              </div>
              <div>
                <Label htmlFor='portal-mod-reason'>Motif *</Label>
                <textarea
                  id='portal-mod-reason'
                  className='mt-1 min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm'
                  value={modDialog.reason}
                  onChange={(e) =>
                    setModDialog((d) => (d ? { ...d, reason: e.target.value } : d))
                  }
                  required
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={() => setModDialog(null)}>
                  Annuler
                </Button>
                <Button type='submit' size='sm' disabled={saving || !modDialog.reason.trim()}>
                  Envoyer à l&apos;administration
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {canEdit ? (
        <p className='text-xs text-muted-foreground rounded-lg border border-dashed px-3 py-2'>
          La saisie initiale est directe. Pour modifier une note déjà enregistrée, changez la valeur
          puis envoyez une demande à l&apos;administration.
        </p>
      ) : null}

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
            {periodOptions.map((p) => (
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
                          <span className='font-semibold text-foreground'>
                            {row.average}/{gradingScale}
                          </span>
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
                  {typeOptions.map((type) => (
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
                      <th key={ev.id} className='min-w-[7rem] py-2 pr-2 align-top'>
                        <span className='block font-medium text-foreground'>{ev.label}</span>
                        <span className='text-[10px] text-muted-foreground'>
                          {ev.courseName} · {ev.type} · /{ev.maxScore}
                        </span>
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {canEdit ? (
                            <label className='inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted'>
                              <Upload className='size-3' aria-hidden />
                              {ev.hasDocument ? t('portalGrades.replaceDoc') : t('portalGrades.uploadDoc')}
                              <input
                                type='file'
                                className='sr-only'
                                accept='.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg'
                                disabled={saving}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) void handleUploadDocument(ev.id, f);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          ) : null}
                          {ev.hasDocument && ev.documentFileName ? (
                            <button
                              type='button'
                              className='inline-flex items-center gap-1 rounded-md border border-primary/30 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/5'
                              onClick={() =>
                                void downloadPortalEvaluationDocument(ev.id, ev.documentFileName!)
                              }
                            >
                              <Download className='size-3' aria-hidden />
                              {t('portalGrades.downloadDoc')}
                            </button>
                          ) : null}
                        </div>
                      </th>
                    ))}
                    <th className='py-2'>{t('portalGrades.colAverage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student) => {
                    const avg = computeStudentAverage(
                      data.evaluations,
                      data.grades,
                      student.id,
                      gradingScale
                    );
                    return (
                      <tr key={student.id} className='border-b border-border/60'>
                        <td className='py-2 pr-3 font-medium text-foreground'>{student.name}</td>
                        {data.evaluations.map((ev) => {
                          const score = getGradeScore(data.grades, ev.id, student.id);
                          const pending = hasPendingRequest(ev.id, student.id);
                          return (
                            <td key={ev.id} className='py-2 pr-2'>
                              {canEdit ? (
                                <div className='space-y-1'>
                                <Input
                                  type='number'
                                  min={0}
                                  max={ev.maxScore}
                                  step={0.25}
                                  className='h-8 w-20 text-sm'
                                  defaultValue={score === '' ? undefined : score}
                                  disabled={saving || (score !== '' && pending)}
                                  onBlur={(e) =>
                                    void handleGradeChange(
                                      ev.id,
                                      student.id,
                                      e.target.value,
                                      score,
                                      student.name,
                                      ev.label,
                                      ev.maxScore,
                                    )
                                  }
                                />
                                {pending ? (
                                  <span className='text-[10px] text-amber-700'>En attente</span>
                                ) : null}
                                </div>
                              ) : (
                                <span className={cn('font-medium', score === '' ? 'text-muted-foreground' : 'text-foreground')}>
                                  {score === '' ? '—' : `${score}/${ev.maxScore}`}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className='py-2 font-semibold text-foreground'>
                          {avg != null ? `${avg}/${gradingScale}` : '—'}
                        </td>
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
