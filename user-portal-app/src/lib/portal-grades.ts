import { apiFetch } from '@/lib/api';

export type EvaluationPeriod =
  | 'Trimestre 1'
  | 'Trimestre 2'
  | 'Trimestre 3'
  | 'Semestre 1'
  | 'Semestre 2';

export type EvaluationType = 'Devoir' | 'Interro' | 'Examen';

export type PortalGradesDetail = {
  role: string;
  canEdit: boolean;
  classId?: string;
  period: string;
  studentId?: string;
  classes: { id: string; name: string; level?: string }[];
  courses: { id: string; name: string }[];
  students: { id: string; name: string; classId?: string; className?: string }[];
  evaluations: {
    id: string;
    classId: string;
    courseId: string;
    courseName: string;
    label: string;
    date: string;
    period: string;
    type: string;
    coefficient: number;
    maxScore: number;
  }[];
  grades: { id: string; evaluationId: string; studentId: string; score: number }[];
  bulletin: { studentId: string; studentName: string; average: number | null; rank: number | null }[];
};

const PERIOD_TO_API: Record<EvaluationPeriod, string> = {
  'Trimestre 1': 'TRIMESTRE_1',
  'Trimestre 2': 'TRIMESTRE_2',
  'Trimestre 3': 'TRIMESTRE_3',
  'Semestre 1': 'SEMESTRE_1',
  'Semestre 2': 'SEMESTRE_2',
};

const EVAL_TYPE_TO_API: Record<EvaluationType, string> = {
  Devoir: 'DEVOIR',
  Interro: 'INTERRO',
  Examen: 'EXAMEN',
};

export const PERIOD_OPTIONS: EvaluationPeriod[] = [
  'Trimestre 1',
  'Trimestre 2',
  'Trimestre 3',
];

export const EVAL_TYPE_OPTIONS: EvaluationType[] = ['Devoir', 'Interro', 'Examen'];

export async function fetchPortalGradesDetail(params: {
  classId?: string;
  period?: EvaluationPeriod;
  studentId?: string;
}): Promise<PortalGradesDetail> {
  const query = new URLSearchParams();
  if (params.classId) query.set('classId', params.classId);
  if (params.period) query.set('period', params.period);
  if (params.studentId) query.set('studentId', params.studentId);
  const qs = query.toString();
  return apiFetch<PortalGradesDetail>(`/api/portal/grades${qs ? `?${qs}` : ''}`);
}

export async function createPortalEvaluation(item: {
  classId: string;
  courseId: string;
  label: string;
  date: string;
  period: EvaluationPeriod;
  type: EvaluationType;
  coefficient: number;
  maxScore: number;
}) {
  return apiFetch('/api/portal/grades/evaluations', {
    method: 'POST',
    body: JSON.stringify({
      classId: item.classId,
      courseId: item.courseId,
      label: item.label,
      date: item.date,
      period: PERIOD_TO_API[item.period],
      type: EVAL_TYPE_TO_API[item.type],
      coefficient: item.coefficient,
      maxScore: item.maxScore,
    }),
  });
}

export async function savePortalGrade(item: {
  evaluationId: string;
  studentId: string;
  score: number;
}) {
  return apiFetch('/api/portal/grades', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export function getGradeScore(
  grades: PortalGradesDetail['grades'],
  evaluationId: string,
  studentId: string
): number | '' {
  const row = grades.find((g) => g.evaluationId === evaluationId && g.studentId === studentId);
  return typeof row?.score === 'number' ? row.score : '';
}

export function computeStudentAverage(
  evaluations: PortalGradesDetail['evaluations'],
  grades: PortalGradesDetail['grades'],
  studentId: string
): number | null {
  let num = 0;
  let den = 0;
  for (const ev of evaluations) {
    const g = grades.find((gr) => gr.evaluationId === ev.id && gr.studentId === studentId);
    if (g && ev.maxScore > 0) {
      const on20 = (g.score / ev.maxScore) * 20;
      num += on20 * ev.coefficient;
      den += ev.coefficient;
    }
  }
  if (!den) return null;
  return Math.round((num / den) * 100) / 100;
}
