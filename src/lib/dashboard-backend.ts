import type React from 'react';
import { BASE_URL, ACCESS_TOKEN_KEY } from '@/constants';
import type { School } from '@/types';
import type {
  AppUser,
  AppUserRole,
  AttendanceRecord,
  AttendanceStatus,
  CalendarEvent,
  ClassItem,
  Course,
  Evaluation,
  EvaluationPeriod,
  Matiere,
  ParentContact,
  PaymentReceipt,
  PaymentReminder,
  Room,
  ScheduleItem,
  Student,
  StudentGrade,
  Teacher,
  TransportRoute,
} from '@/pages/dashboard/dashboardTypes';

export function isBackendApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function adminApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String(body.error)
        : body && typeof body === 'object' && 'message' in body
          ? String(body.message)
          : `API error ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function loginAdmin(email: string, password: string) {
  return adminApiFetch<{ token: string; role: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

function relationId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: unknown }).id);
  }
  return undefined;
}

const MEAL_TO_API: Record<string, string> = {
  Déjeuner: 'DEJEUNER',
  Dîner: 'DINER',
  Goûter: 'GOUTER',
};

const MEAL_FROM_API: Record<string, 'Déjeuner' | 'Dîner' | 'Goûter'> = {
  DEJEUNER: 'Déjeuner',
  DINER: 'Dîner',
  GOUTER: 'Goûter',
};

const EVENT_TO_API: Record<string, string> = {
  Promotion: 'PROMOTION',
  Réunion: 'REUNION',
  Examen: 'EXAMEN',
  Autre: 'AUTRE',
};

const EVENT_FROM_API: Record<string, CalendarEvent['type']> = {
  PROMOTION: 'Promotion',
  REUNION: 'Réunion',
  EXAMEN: 'Examen',
  AUTRE: 'Autre',
};

const PERIOD_TO_API: Record<EvaluationPeriod, string> = {
  'Trimestre 1': 'TRIMESTRE_1',
  'Trimestre 2': 'TRIMESTRE_2',
  'Trimestre 3': 'TRIMESTRE_3',
  'Semestre 1': 'SEMESTRE_1',
  'Semestre 2': 'SEMESTRE_2',
};

const PERIOD_FROM_API: Record<string, EvaluationPeriod> = {
  TRIMESTRE_1: 'Trimestre 1',
  TRIMESTRE_2: 'Trimestre 2',
  TRIMESTRE_3: 'Trimestre 3',
  SEMESTRE_1: 'Semestre 1',
  SEMESTRE_2: 'Semestre 2',
};

const EVAL_TYPE_TO_API: Record<Evaluation['type'], string> = {
  Devoir: 'DEVOIR',
  Interro: 'INTERRO',
  Examen: 'EXAMEN',
};

const EVAL_TYPE_FROM_API: Record<string, Evaluation['type']> = {
  DEVOIR: 'Devoir',
  INTERRO: 'Interro',
  EXAMEN: 'Examen',
};

const ATTENDANCE_TO_API: Record<AttendanceStatus, string> = {
  Présent: 'PRESENT',
  Absent: 'ABSENT',
  Retard: 'RETARD',
};

const ATTENDANCE_FROM_API: Record<string, AttendanceStatus> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'Retard',
};

const PAYMENT_STATUS_FROM_API: Record<string, PaymentReminder['status']> = {
  EN_ATTENTE: 'En attente',
  ENVOYE: 'Envoyé',
  PAYE: 'Payé',
};

const USER_ROLE_TO_API: Record<AppUserRole, string> = {
  admin: 'ADMIN',
  teacher: 'TEACHER',
  parent: 'PARENT',
  student: 'STUDENT',
};

const USER_ROLE_FROM_API: Record<string, AppUserRole> = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
};

let cachedSchoolId: string | null = null;

export type DashboardBackendSetters = {
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setClasses: React.Dispatch<React.SetStateAction<ClassItem[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setMatieres: React.Dispatch<React.SetStateAction<Matiere[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  setCanteenMenuItems: React.Dispatch<React.SetStateAction<import('@/pages/dashboard/dashboardTypes').CanteenMenuItem[]>>;
  setTransportRoutes: React.Dispatch<React.SetStateAction<TransportRoute[]>>;
  setParents: React.Dispatch<React.SetStateAction<ParentContact[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  setGrades: React.Dispatch<React.SetStateAction<StudentGrade[]>>;
  setPaymentReminders: React.Dispatch<React.SetStateAction<PaymentReminder[]>>;
  setPaymentReceipts: React.Dispatch<React.SetStateAction<PaymentReceipt[]>>;
};

export async function loadDashboardFromBackend(setters: DashboardBackendSetters): Promise<void> {
  const [
    teachers,
    classes,
    students,
    courses,
    matieres,
    rooms,
    events,
    schedule,
    canteen,
    transport,
    parents,
    users,
    attendance,
    evaluations,
    grades,
    reminders,
    receipts,
  ] = await Promise.all([
    adminApiFetch<Record<string, unknown>[]>('/api/teachers'),
    adminApiFetch<Record<string, unknown>[]>('/api/classes'),
    adminApiFetch<Record<string, unknown>[]>('/api/students'),
    adminApiFetch<Record<string, unknown>[]>('/api/courses'),
    adminApiFetch<Record<string, unknown>[]>('/api/matieres'),
    adminApiFetch<Record<string, unknown>[]>('/api/rooms'),
    adminApiFetch<Record<string, unknown>[]>('/api/calendar'),
    adminApiFetch<Record<string, unknown>[]>('/api/schedule'),
    adminApiFetch<Record<string, unknown>[]>('/api/canteen'),
    adminApiFetch<Record<string, unknown>[]>('/api/transport'),
    adminApiFetch<Record<string, unknown>[]>('/api/parents'),
    adminApiFetch<Record<string, unknown>[]>('/api/users'),
    adminApiFetch<Record<string, unknown>[]>('/api/attendance'),
    adminApiFetch<Record<string, unknown>[]>('/api/grades/evaluations'),
    adminApiFetch<Record<string, unknown>[]>('/api/grades'),
    adminApiFetch<Record<string, unknown>[]>('/api/payments/reminders'),
    adminApiFetch<Record<string, unknown>[]>('/api/payments/receipts'),
  ]);

  setters.setTeachers(
    teachers.map((t) => ({
      id: String(t.id),
      name: String(t.name ?? ''),
      subject: String(t.subject ?? ''),
      initials: String(t.initials ?? (String(t.name ?? '').slice(0, 2).toUpperCase() || 'ED')),
    }))
  );
  setters.setClasses(
    classes.map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ''),
      level: String(c.level ?? ''),
      studentsCount: Number(c.studentsCount ?? 0),
      homeroomTeacherId: relationId(c.homeroomTeacher),
    }))
  );
  setters.setStudents(
    students.map((s) => ({
      id: String(s.id),
      name: String(s.name ?? ''),
      classId: relationId(s.classItem),
    }))
  );
  setters.setMatieres(matieres.map((m) => ({ id: String(m.id), name: String(m.name ?? '') })));
  setters.setCourses(
    courses.map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ''),
      matiereId: relationId(c.matiere) ?? '',
      level: String(c.level ?? ''),
    }))
  );
  setters.setRooms(
    rooms.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? ''),
      type: String(r.type ?? ''),
      capacity: r.capacity != null ? Number(r.capacity) : undefined,
    }))
  );
  setters.setEvents(
    events.map((e) => ({
      id: String(e.id),
      label: String(e.label ?? ''),
      date: String(e.date ?? ''),
      time: e.time ? String(e.time) : undefined,
      location: e.location ? String(e.location) : undefined,
      type: EVENT_FROM_API[String(e.type)] ?? 'Autre',
    }))
  );
  setters.setSchedule(
    schedule.map((s) => ({
      id: String(s.id),
      classId: relationId(s.classItem) ?? '',
      courseId: relationId(s.course),
      day: String(s.day ?? ''),
      time: String(s.time ?? ''),
      room: s.room ? String(s.room) : undefined,
    }))
  );
  setters.setCanteenMenuItems(
    canteen.map((c) => ({
      id: String(c.id),
      day: String(c.day ?? ''),
      mealType: MEAL_FROM_API[String(c.mealType)] ?? 'Déjeuner',
      dish: String(c.dish ?? ''),
      note: c.note ? String(c.note) : undefined,
    }))
  );
  setters.setTransportRoutes(
    transport.map((t) => {
      const studentsOnRoute = Array.isArray(t.students) ? t.students : [];
      return {
        id: String(t.id),
        name: String(t.name ?? ''),
        driverName: String(t.driverName ?? ''),
        departureTime: String(t.departureTime ?? ''),
        returnTime: t.returnTime ? String(t.returnTime) : undefined,
        note: t.note ? String(t.note) : undefined,
        studentIds: studentsOnRoute
          .map((s) => relationId(s))
          .filter((id): id is string => Boolean(id)),
      };
    })
  );
  setters.setParents(
    parents.map((p) => ({
      id: String(p.id),
      name: String(p.name ?? ''),
      phone: p.phone ? String(p.phone) : undefined,
      email: p.email ? String(p.email) : undefined,
      studentId: relationId(p.student),
    }))
  );
  setters.setUsers(
    users.map((u) => ({
      id: String(u.id),
      name: String(u.name ?? ''),
      email: String(u.email ?? ''),
      role: USER_ROLE_FROM_API[String(u.role)] ?? 'teacher',
    }))
  );
  setters.setAttendanceRecords(
    attendance.map((a) => ({
      id: String(a.id),
      date: String(a.date ?? ''),
      classId: relationId(a.classItem),
      studentId: relationId(a.student) ?? '',
      status: ATTENDANCE_FROM_API[String(a.status)] ?? 'Présent',
    }))
  );
  setters.setEvaluations(
    evaluations.map((e) => ({
      id: String(e.id),
      classId: relationId(e.classItem) ?? '',
      courseId: relationId(e.course) ?? '',
      label: String(e.label ?? ''),
      date: String(e.date ?? ''),
      period: PERIOD_FROM_API[String(e.period)] ?? 'Trimestre 1',
      type: EVAL_TYPE_FROM_API[String(e.type)] ?? 'Devoir',
      coefficient: Number(e.coefficient ?? 1),
      maxScore: Number(e.maxScore ?? 20),
    }))
  );
  setters.setGrades(
    grades.map((g) => ({
      id: String(g.id),
      evaluationId: relationId(g.evaluation) ?? '',
      studentId: relationId(g.student) ?? '',
      score: Number(g.score ?? 0),
    }))
  );
  setters.setPaymentReminders(
    reminders.map((r) => ({
      id: String(r.id),
      parentName: String(r.parentName ?? ''),
      studentName: r.studentName ? String(r.studentName) : undefined,
      amount: Number(r.amount ?? 0),
      dueDate: String(r.dueDate ?? ''),
      status: PAYMENT_STATUS_FROM_API[String(r.status)] ?? 'En attente',
    }))
  );
  setters.setPaymentReceipts(
    receipts.map((r) => ({
      id: String(r.id),
      parentName: String(r.parentName ?? ''),
      studentName: r.studentName ? String(r.studentName) : undefined,
      amount: Number(r.amount ?? 0),
      date: String(r.date ?? ''),
      reference: String(r.reference ?? ''),
    }))
  );
}

export function mapSchoolFromApi(row: Record<string, unknown>): Partial<School> {
  const gps = String(row.gps ?? '');
  const parts = gps.includes(',') ? gps.split(',').map((s) => s.trim()) : ['', ''];
  const seriesRaw = row.series;
  const series =
    typeof seriesRaw === 'string' && seriesRaw
      ? seriesRaw.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : [];

  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    type: String(row.type ?? ''),
    system: String(row.system ?? ''),
    country: String(row.country ?? ''),
    city: String(row.city ?? ''),
    commune: String(row.district ?? ''),
    address: String(row.address ?? ''),
    gpsLat: parts[0] ? Number(parts[0]) : null,
    gpsLng: parts[1] ? Number(parts[1]) : null,
    phone: String(row.mainPhone ?? ''),
    officialEmail: String(row.officialEmail ?? ''),
    directorName: String(row.headName ?? ''),
    directorPhone: String(row.headPhone ?? ''),
    website: String(row.website ?? ''),
    studentCount: row.studentCount != null ? Number(row.studentCount) : null,
    teacherCount: row.teacherCount != null ? Number(row.teacherCount) : null,
    series,
    logoUrl: '',
    logoCldPubId: '',
    createdAt: row.createdAt ? String(row.createdAt) : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function schoolPatchToRequest(patch: Partial<School>): Record<string, unknown> {
  const gps =
    patch.gpsLat != null && patch.gpsLng != null ? `${patch.gpsLat},${patch.gpsLng}` : undefined;
  return {
    name: patch.name,
    system: patch.system,
    country: patch.country,
    city: patch.city,
    district: patch.commune,
    address: patch.address,
    gps,
    mainPhone: patch.phone,
    officialEmail: patch.officialEmail,
    headName: patch.directorName,
    headPhone: patch.directorPhone,
    website: patch.website,
    studentCount: patch.studentCount ?? undefined,
    teacherCount: patch.teacherCount ?? undefined,
    series: Array.isArray(patch.series) ? patch.series.join(', ') : undefined,
  };
}

export async function fetchLatestSchoolFromBackend(): Promise<Partial<School> | null> {
  const schools = await adminApiFetch<Record<string, unknown>[]>('/api/schools');
  if (!schools.length) return null;
  const latest = schools[schools.length - 1];
  cachedSchoolId = String(latest.id);
  return mapSchoolFromApi(latest);
}

export async function persistSchoolPatchOnBackend(patch: Partial<School>): Promise<void> {
  if (!cachedSchoolId) {
    const schools = await adminApiFetch<Record<string, unknown>[]>('/api/schools');
    if (!schools.length) throw new Error('Aucun établissement enregistré sur le serveur.');
    cachedSchoolId = String(schools[schools.length - 1].id);
  }
  await adminApiFetch(`/api/schools/${cachedSchoolId}`, {
    method: 'PUT',
    body: JSON.stringify(schoolPatchToRequest(patch)),
  });
}

export async function createCanteenOnBackend(item: {
  day: string;
  mealType: string;
  dish: string;
  note?: string;
}) {
  return adminApiFetch('/api/canteen', {
    method: 'POST',
    body: JSON.stringify({
      day: item.day,
      mealType: MEAL_TO_API[item.mealType] ?? 'DEJEUNER',
      dish: item.dish,
      note: item.note,
    }),
  });
}

export async function createScheduleOnBackend(item: {
  classId: string;
  courseId?: string;
  day: string;
  time: string;
  room?: string;
}) {
  return adminApiFetch('/api/schedule', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createTransportOnBackend(item: {
  name: string;
  driverName: string;
  departureTime: string;
  returnTime?: string;
  note?: string;
}) {
  return adminApiFetch('/api/transport', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function updateTransportStudentsOnBackend(routeId: string, studentIds: string[]) {
  return adminApiFetch(`/api/transport/${routeId}/students`, {
    method: 'PATCH',
    body: JSON.stringify(studentIds),
  });
}

export async function createEventOnBackend(item: {
  label: string;
  date: string;
  time?: string;
  location?: string;
  type: string;
}) {
  return adminApiFetch('/api/calendar', {
    method: 'POST',
    body: JSON.stringify({
      label: item.label,
      date: item.date,
      time: item.time,
      location: item.location,
      type: EVENT_TO_API[item.type] ?? 'AUTRE',
    }),
  });
}

export async function createClassOnBackend(item: {
  name: string;
  level: string;
  studentsCount?: number;
  homeroomTeacherId?: string;
}) {
  return adminApiFetch('/api/classes', {
    method: 'POST',
    body: JSON.stringify({
      name: item.name,
      level: item.level,
      studentsCount: item.studentsCount ?? 0,
      homeroomTeacherId: item.homeroomTeacherId,
    }),
  });
}

export async function createTeacherOnBackend(item: { name: string; subject: string; initials?: string }) {
  return adminApiFetch('/api/teachers', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createStudentOnBackend(item: { name: string; classId?: string }) {
  return adminApiFetch('/api/students', {
    method: 'POST',
    body: JSON.stringify({ name: item.name, classId: item.classId }),
  });
}

export async function createMatiereOnBackend(name: string) {
  return adminApiFetch('/api/matieres', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function createCourseOnBackend(item: { name: string; matiereId: string; level: string }) {
  return adminApiFetch('/api/courses', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createRoomOnBackend(item: { name: string; type: string; capacity?: number }) {
  return adminApiFetch('/api/rooms', { method: 'POST', body: JSON.stringify(item) });
}

export async function createParentOnBackend(item: {
  name: string;
  phone?: string;
  email?: string;
  studentId?: string;
}) {
  return adminApiFetch('/api/parents', { method: 'POST', body: JSON.stringify(item) });
}

export async function createUserOnBackend(item: { name: string; email: string; role: AppUserRole }) {
  return adminApiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      name: item.name,
      email: item.email,
      role: USER_ROLE_TO_API[item.role],
    }),
  });
}

export async function createPaymentReminderOnBackend(item: {
  parentName: string;
  studentName?: string;
  amount: number;
  dueDate: string;
}) {
  return adminApiFetch('/api/payments/reminders', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createPaymentReceiptOnBackend(item: {
  parentName: string;
  studentName?: string;
  amount: number;
  date: string;
  reference?: string;
}) {
  return adminApiFetch('/api/payments/receipts', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createEvaluationOnBackend(item: {
  classId: string;
  courseId: string;
  label: string;
  date: string;
  period: EvaluationPeriod;
  type: Evaluation['type'];
  coefficient: number;
  maxScore: number;
}) {
  return adminApiFetch('/api/grades/evaluations', {
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

export async function createOrUpdateGradeOnBackend(item: {
  evaluationId: string;
  studentId: string;
  score: number;
}) {
  return adminApiFetch('/api/grades', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createAttendanceOnBackend(item: {
  date: string;
  classId?: string;
  studentId: string;
  status: AttendanceStatus;
}) {
  return adminApiFetch('/api/attendance', {
    method: 'POST',
    body: JSON.stringify({
      date: item.date,
      classId: item.classId,
      studentId: item.studentId,
      status: ATTENDANCE_TO_API[item.status],
    }),
  });
}

export async function updateAttendanceOnBackend(
  id: string,
  item: { date: string; classId?: string; studentId: string; status: AttendanceStatus }
) {
  return adminApiFetch(`/api/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      date: item.date,
      classId: item.classId,
      studentId: item.studentId,
      status: ATTENDANCE_TO_API[item.status],
    }),
  });
}
