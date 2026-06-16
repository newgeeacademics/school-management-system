import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';
import { apiFetch } from '@/lib/api';

export type EvaluationPeriod = string;

export type EvaluationType = string;

export type PortalGradingConfig = {
  gradingScale: number;
  evaluationTypes: string[];
  evaluationPeriods: string[];
};

export type PortalGradesDetail = {
  role: string;
  canEdit: boolean;
  classId?: string;
  period: string;
  studentId?: string;
  gradingConfig?: PortalGradingConfig;
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
    teacherName?: string;
    hasDocument?: boolean;
    documentFileName?: string;
    documentContentType?: string;
  }[];
  grades: { id: string; evaluationId: string; studentId: string; score: number }[];
  bulletin: { studentId: string; studentName: string; average: number | null; rank: number | null }[];
};

const PERIOD_TO_API: Record<string, string> = {
  'Trimestre 1': 'TRIMESTRE_1',
  'Trimestre 2': 'TRIMESTRE_2',
  'Trimestre 3': 'TRIMESTRE_3',
  'Semestre 1': 'SEMESTRE_1',
  'Semestre 2': 'SEMESTRE_2',
};

const EVAL_TYPE_TO_API: Record<string, string> = {
  Devoir: 'DEVOIR',
  Interro: 'INTERRO',
  Examen: 'EXAMEN',
  Composition: 'COMPOSITION',
  Contrôle: 'CONTROLE',
  Controle: 'CONTROLE',
  Projet: 'PROJET',
};

export const DEFAULT_PERIOD_OPTIONS = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
export const DEFAULT_EVAL_TYPE_OPTIONS = ['Devoir', 'Interro', 'Examen'];

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
      period: PERIOD_TO_API[item.period] ?? item.period,
      type: EVAL_TYPE_TO_API[item.type] ?? 'DEVOIR',
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

export type PortalGradeModificationRequest = {
  id: string;
  evaluationId: string;
  evaluationLabel: string;
  studentId: string;
  studentName: string;
  currentScore: number;
  requestedScore: number;
  maxScore?: number;
  reason: string;
  status: string;
};

export async function fetchPortalGradeModificationRequests(): Promise<PortalGradeModificationRequest[]> {
  return apiFetch<PortalGradeModificationRequest[]>('/api/grades/modification-requests');
}

export async function submitPortalGradeModificationRequest(item: {
  evaluationId: string;
  studentId: string;
  requestedScore: number;
  reason: string;
}) {
  return apiFetch('/api/grades/modification-requests', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function uploadPortalEvaluationDocument(evaluationId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/api/portal/grades/evaluations/${evaluationId}/document`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      (body && typeof body === 'object' && 'error' in body && String(body.error)) ||
        `Upload failed (${res.status})`
    );
  }
  return res.json();
}

export function getEvaluationDocumentUrl(evaluationId: string): string {
  return `${BASE_URL}/api/portal/grades/evaluations/${evaluationId}/document`;
}

export async function downloadPortalEvaluationDocument(evaluationId: string, filename: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  const res = await fetch(getEvaluationDocumentUrl(evaluationId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
  studentId: string,
  gradingScale = 20
): number | null {
  let num = 0;
  let den = 0;
  for (const ev of evaluations) {
    const g = grades.find((gr) => gr.evaluationId === ev.id && gr.studentId === studentId);
    if (g && ev.maxScore > 0) {
      const normalized = (g.score / ev.maxScore) * gradingScale;
      num += normalized * ev.coefficient;
      den += ev.coefficient;
    }
  }
  if (!den) return null;
  return Math.round((num / den) * 100) / 100;
}
