import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GradeModificationRequestsPanel } from '@/pages/dashboard/GradeModificationRequestsPanel';

import type {
  ClassItem,
  Course,
  Evaluation,
  EvaluationPeriod,
  GradeModificationRequest,
  NewEvaluationFormState,
  Student,
  StudentGrade,
} from './dashboardTypes';

type GradesSectionProps = {
  classes: ClassItem[];
  courses: Course[];
  students: Student[];
  evaluations: Evaluation[];
  grades: StudentGrade[];
  gradeModificationRequests: GradeModificationRequest[];
  isAdmin: boolean;
  newEvaluation: NewEvaluationFormState;
  setNewEvaluation: React.Dispatch<React.SetStateAction<NewEvaluationFormState>>;
  onCreateEvaluation: (e: React.FormEvent) => void;
  onUpdateGrade: (evaluationId: string, studentId: string, score: number | '') => void;
  onSubmitGradeModificationRequest: (payload: {
    evaluationId: string;
    studentId: string;
    requestedScore: number;
    reason: string;
  }) => void | Promise<void>;
  onApproveGradeModificationRequest: (id: string, adminNote?: string) => void | Promise<void>;
  onRejectGradeModificationRequest: (id: string, adminNote?: string) => void | Promise<void>;
};

const PERIOD_OPTIONS: EvaluationPeriod[] = [
  'Trimestre 1',
  'Trimestre 2',
  'Trimestre 3',
];

export const GradesSection: React.FC<GradesSectionProps> = ({
  classes,
  courses,
  students,
  evaluations,
  grades,
  gradeModificationRequests,
  isAdmin,
  newEvaluation,
  setNewEvaluation,
  onCreateEvaluation,
  onUpdateGrade,
  onSubmitGradeModificationRequest,
  onApproveGradeModificationRequest,
  onRejectGradeModificationRequest,
}) => {
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<EvaluationPeriod>('Trimestre 1');
  const [modDialog, setModDialog] = React.useState<{
    evaluationId: string;
    studentId: string;
    studentName: string;
    evaluationLabel: string;
    maxScore: number;
    currentScore: number;
    requestedScore: number;
    reason: string;
  } | null>(null);

  const classStudents = React.useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId],
  );

  const classCourses = React.useMemo(
    () =>
      courses.filter((c) =>
        selectedClassId
          ? c.level === classes.find((cl) => cl.id === selectedClassId)?.level
          : true,
      ),
    [courses, classes, selectedClassId],
  );

  const classEvaluations = React.useMemo(
    () =>
      evaluations.filter(
        (ev) =>
          (!selectedClassId || ev.classId === selectedClassId) &&
          ev.period === selectedPeriod,
      ),
    [evaluations, selectedClassId, selectedPeriod],
  );

  const getCourseName = (id: string) =>
    courses.find((c) => c.id === id)?.name ?? 'Cours';

  const getGrade = (evaluationId: string, studentId: string): number | '' => {
    const g = grades.find(
      (gr) => gr.evaluationId === evaluationId && gr.studentId === studentId,
    );
    return typeof g?.score === 'number' ? g.score : '';
  };

  const hasPendingRequest = (evaluationId: string, studentId: string) =>
    gradeModificationRequests.some(
      (r) =>
        r.status === 'PENDING' &&
        r.evaluationId === evaluationId &&
        r.studentId === studentId,
    );

  const handleGradeInput = (
    ev: Evaluation,
    student: Student,
    raw: string,
    previousScore: number | '',
  ) => {
    if (!raw) {
      if (isAdmin) onUpdateGrade(ev.id, student.id, '');
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;

    if (!isAdmin && previousScore !== '' && num !== previousScore) {
      setModDialog({
        evaluationId: ev.id,
        studentId: student.id,
        studentName: student.name,
        evaluationLabel: ev.label,
        maxScore: ev.maxScore,
        currentScore: previousScore,
        requestedScore: num,
        reason: '',
      });
      return;
    }

    onUpdateGrade(ev.id, student.id, num);
  };

  const submitModificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modDialog || !modDialog.reason.trim()) return;
    await onSubmitGradeModificationRequest({
      evaluationId: modDialog.evaluationId,
      studentId: modDialog.studentId,
      requestedScore: modDialog.requestedScore,
      reason: modDialog.reason.trim(),
    });
    setModDialog(null);
  };

  const computeStudentAverage = (studentId: string): number | null => {
    const evals = classEvaluations;
    if (!evals.length) return null;
    let num = 0;
    let den = 0;
    for (const ev of evals) {
      const g = grades.find(
        (gr) => gr.evaluationId === ev.id && gr.studentId === studentId,
      );
      if (g && ev.maxScore > 0) {
        const on20 = (g.score / ev.maxScore) * 20;
        num += on20 * ev.coefficient;
        den += ev.coefficient;
      }
    }
    if (!den) return null;
    return Math.round((num / den) * 100) / 100;
  };

  const sortedStudents = React.useMemo(() => {
    const withAvg = classStudents.map((s) => ({
      ...s,
      avg: computeStudentAverage(s.id),
    }));
    return withAvg.sort((a, b) => {
      if (a.avg == null && b.avg == null) return 0;
      if (a.avg == null) return 1;
      if (b.avg == null) return -1;
      return b.avg - a.avg;
    });
  }, [classStudents, classEvaluations, grades]);

  return (
    <section className='space-y-5'>
      <GradeModificationRequestsPanel
        requests={gradeModificationRequests}
        isAdmin={isAdmin}
        onApprove={onApproveGradeModificationRequest}
        onReject={onRejectGradeModificationRequest}
      />

      {modDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-sm'>Demande de modification de note</CardTitle>
            </CardHeader>
            <CardContent>
              <form className='space-y-3 text-xs' onSubmit={(e) => void submitModificationRequest(e)}>
                <p>
                  <span className='font-medium'>{modDialog.studentName}</span> ·{' '}
                  {modDialog.evaluationLabel}
                </p>
                <p className='text-muted-foreground'>
                  Note actuelle : <strong>{modDialog.currentScore}/{modDialog.maxScore}</strong>
                </p>
                <div className='grid gap-1'>
                  <Label htmlFor='mod-score'>Nouvelle note demandée *</Label>
                  <Input
                    id='mod-score'
                    type='number'
                    min={0}
                    max={modDialog.maxScore}
                    step={0.25}
                    value={modDialog.requestedScore}
                    onChange={(e) =>
                      setModDialog((d) =>
                        d ? { ...d, requestedScore: Number(e.target.value) } : d,
                      )
                    }
                    required
                  />
                </div>
                <div className='grid gap-1'>
                  <Label htmlFor='mod-reason'>Motif *</Label>
                  <textarea
                    id='mod-reason'
                    className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs'
                    value={modDialog.reason}
                    onChange={(e) =>
                      setModDialog((d) => (d ? { ...d, reason: e.target.value } : d))
                    }
                    placeholder='Expliquez pourquoi cette note doit être modifiée…'
                    required
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button type='button' variant='outline' size='sm' onClick={() => setModDialog(null)}>
                    Annuler
                  </Button>
                  <Button type='submit' size='sm' disabled={!modDialog.reason.trim()}>
                    Envoyer à l&apos;administration
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Créer une évaluation
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-xs'>
            <form
              className='grid gap-3 md:grid-cols-2'
              onSubmit={onCreateEvaluation}
            >
              <div className='grid gap-2'>
                <Label htmlFor='eval-class'>Classe</Label>
                <Select
                  value={newEvaluation.classId}
                  onValueChange={(value) =>
                    setNewEvaluation((ev) => ({ ...ev, classId: value }))
                  }
                >
                  <SelectTrigger id='eval-class'>
                    <SelectValue placeholder='Choisir une classe' />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cl) => (
                      <SelectItem key={cl.id} value={cl.id}>
                        {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='eval-course'>Cours / matière</Label>
                <Select
                  value={newEvaluation.courseId}
                  onValueChange={(value) =>
                    setNewEvaluation((ev) => ({ ...ev, courseId: value }))
                  }
                >
                  <SelectTrigger id='eval-course'>
                    <SelectValue placeholder='Choisir un cours' />
                  </SelectTrigger>
                  <SelectContent>
                    {classCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='eval-label'>Intitulé</Label>
                <Input
                  id='eval-label'
                  value={newEvaluation.label}
                  onChange={(e) =>
                    setNewEvaluation((ev) => ({ ...ev, label: e.target.value }))
                  }
                  placeholder='Ex : Devoir n°1'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='eval-date'>Date</Label>
                <Input
                  id='eval-date'
                  type='date'
                  value={newEvaluation.date}
                  onChange={(e) =>
                    setNewEvaluation((ev) => ({ ...ev, date: e.target.value }))
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label>Période</Label>
                <Select
                  value={newEvaluation.period}
                  onValueChange={(value) =>
                    setNewEvaluation((ev) => ({
                      ...ev,
                      period: value as EvaluationPeriod,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Choisir une période' />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label>Type</Label>
                <Select
                  value={newEvaluation.type}
                  onValueChange={(value) =>
                    setNewEvaluation((ev) => ({
                      ...ev,
                      type: value as Evaluation['type'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Type de contrôle' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Devoir'>Devoir</SelectItem>
                    <SelectItem value='Interro'>Interro</SelectItem>
                    <SelectItem value='Examen'>Examen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='eval-coef'>Coefficient</Label>
                <Input
                  id='eval-coef'
                  type='number'
                  min={1}
                  value={newEvaluation.coefficient}
                  onChange={(e) =>
                    setNewEvaluation((ev) => ({
                      ...ev,
                      coefficient: e.target.value,
                    }))
                  }
                  placeholder='Ex : 1, 2…'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='eval-max'>Note maximale</Label>
                <Input
                  id='eval-max'
                  type='number'
                  min={1}
                  value={newEvaluation.maxScore}
                  onChange={(e) =>
                    setNewEvaluation((ev) => ({
                      ...ev,
                      maxScore: e.target.value,
                    }))
                  }
                  placeholder='Ex : 20'
                  required
                />
              </div>
              <div className='md:col-span-2 flex justify-end'>
                <Button
                  type='submit'
                  size='sm'
                  disabled={!newEvaluation.classId || !newEvaluation.courseId}
                >
                  Enregistrer l&apos;évaluation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Filtre pour la saisie des notes
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-xs'>
            <div className='grid gap-2'>
              <Label htmlFor='grades-class'>Classe</Label>
              <Select
                value={selectedClassId}
                onValueChange={(value) => setSelectedClassId(value)}
              >
                <SelectTrigger id='grades-class'>
                  <SelectValue placeholder='Choisir une classe' />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cl) => (
                    <SelectItem key={cl.id} value={cl.id}>
                      {cl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Période</Label>
              <Select
                value={selectedPeriod}
                onValueChange={(value) =>
                  setSelectedPeriod(value as EvaluationPeriod)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Choisissez d&apos;abord une classe et une période pour saisir ou
              consulter les notes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between gap-2'>
            <CardTitle className='text-sm font-medium'>
              Saisie des notes et conseil de classe
            </CardTitle>
            {selectedClassId && (
              <Badge variant='outline' className='text-[11px]'>
                {classes.find((c) => c.id === selectedClassId)?.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-3 text-xs'>
          {!selectedClassId || !classEvaluations.length ? (
            <p className='text-muted-foreground'>
              Créez au moins une évaluation pour cette classe et cette période
              afin de commencer la saisie des notes.
            </p>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-[11px]'>
                  <thead>
                    <tr>
                      <th className='border-b px-2 py-1 text-left'>Élève</th>
                      {classEvaluations.map((ev) => (
                        <th
                          key={ev.id}
                          className='border-b px-2 py-1 text-left align-bottom'
                        >
                          <div className='flex flex-col gap-0.5'>
                            <span className='font-medium truncate'>
                              {ev.label}
                            </span>
                            <span className='text-[10px] text-muted-foreground'>
                              {getCourseName(ev.courseId)} • coef {ev.coefficient}{' '}
                              • /{ev.maxScore}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className='border-b px-2 py-1 text-left'>Moyenne /20</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.length === 0 ? (
                      <tr>
                        <td
                          className='border-b px-2 py-2 text-[11px] text-muted-foreground'
                          colSpan={classEvaluations.length + 2}
                        >
                          Aucun élève n&apos;est encore rattaché à cette classe.
                          Ajoutez des élèves dans la section &laquo; Élèves &raquo;
                          puis revenez ici pour saisir les notes individuellement.
                        </td>
                      </tr>
                    ) : (
                      sortedStudents.map((student, index) => (
                        <tr key={student.id} className='hover:bg-muted/40'>
                          <td className='border-b px-2 py-1'>
                            <div className='flex items-center gap-1.5'>
                              <span className='text-[10px] text-muted-foreground'>
                                {index + 1}
                              </span>
                              <span className='font-medium'>{student.name}</span>
                            </div>
                          </td>
                          {classEvaluations.map((ev) => {
                            const current = getGrade(ev.id, student.id);
                            const pending = hasPendingRequest(ev.id, student.id);
                            return (
                            <td key={ev.id} className='border-b px-1.5 py-1'>
                              <div className='flex flex-col gap-0.5'>
                              <Input
                                key={`${ev.id}-${student.id}-${current}-${pending}`}
                                type='number'
                                min={0}
                                max={ev.maxScore}
                                className='h-7 px-1 text-[11px]'
                                defaultValue={current === '' ? undefined : current}
                                readOnly={!isAdmin && current !== ''}
                                title={
                                  !isAdmin && current !== ''
                                    ? 'Cliquez pour demander une modification à l\'administration'
                                    : undefined
                                }
                                onClick={() => {
                                  if (!isAdmin && current !== '' && !pending) {
                                    setModDialog({
                                      evaluationId: ev.id,
                                      studentId: student.id,
                                      studentName: student.name,
                                      evaluationLabel: ev.label,
                                      maxScore: ev.maxScore,
                                      currentScore: current,
                                      requestedScore: current,
                                      reason: '',
                                    });
                                  }
                                }}
                                onChange={(e) => {
                                  if (!isAdmin && current !== '') return;
                                  const raw = e.target.value;
                                  handleGradeInput(ev, student, raw, current);
                                }}
                              />
                              {pending && (
                                <Badge variant='outline' className='text-[9px] px-1 py-0 w-fit'>
                                  En attente
                                </Badge>
                              )}
                              </div>
                            </td>
                          );})}
                          <td className='border-b px-2 py-1'>
                            {student.avg != null ? (
                              <span
                                className={
                                  student.avg >= 10
                                    ? 'font-semibold text-emerald-600'
                                    : 'font-semibold text-red-600'
                                }
                              >
                                {student.avg.toFixed(2)}
                              </span>
                            ) : (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className='text-[11px] text-muted-foreground'>
                {isAdmin
                  ? 'En tant qu\'administration, vous pouvez modifier les notes directement. Les demandes des enseignants apparaissent ci-dessus.'
                  : 'La saisie initiale est directe. Pour modifier une note déjà enregistrée, cliquez sur la cellule et envoyez une demande à l\'administration.'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

