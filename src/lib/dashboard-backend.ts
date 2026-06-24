import type React from 'react';
import { BASE_URL, ACCESS_TOKEN_KEY, isApiUrlFromEnv } from '@/constants';
import { parseApiErrorResponse, wrapFetchError } from '@/lib/api-error';
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
  Announcement,
  FeeCategory,
  FeeInstallment,
  Student,
  StudentGrade,
  StudentIdCardData,
  Teacher,
  TeacherIdCardData,
  Driver,
  TransportRoute,
  GradeModificationRequest,
  CanteenMenuItem,
} from '@/pages/dashboard/dashboardTypes';

export const BACKEND_REQUIRED_MESSAGE =
  'Connexion au serveur requise. Démarrez le backend (port 8080) ou définissez VITE_API_URL puis redémarrez le front.';

/** True when the app has a resolved API base URL (local dev default or env). */
export function isBackendApiConfigured(): boolean {
  if (import.meta.env.PROD && BASE_URL === '') return true;
  return Boolean(BASE_URL?.trim());
}

/** True only when VITE_API_URL / VITE_BACKEND_BASE_URL was set explicitly. */
export function isBackendApiEnvConfigured(): boolean {
  return isApiUrlFromEnv;
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

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if (!res.ok) {
      throw new Error(await parseApiErrorResponse(res, `Erreur API ${res.status}`));
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (err) {
    throw wrapFetchError(err, 'Erreur de communication avec le serveur');
  }
}

export type AuthLoginResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
};

export async function loginAdmin(email: string, password: string) {
  return adminApiFetch<AuthLoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
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

function appUserLoginId(entity: Record<string, unknown>): string | undefined {
  const appUser = entity.appUser as Record<string, unknown> | undefined;
  if (appUser?.loginId) return String(appUser.loginId);
  return undefined;
}

function isSyntheticPortalEmail(email?: string): boolean {
  if (!email) return false;
  return email.toLowerCase().includes('@portal.classroom');
}

export function mapTeacherFromApi(t: Record<string, unknown>): Teacher {
  const appUser = t.appUser as Record<string, unknown> | undefined;
  const contactEmail = t.email ? String(t.email) : appUser?.email ? String(appUser.email) : undefined;
  return {
    id: String(t.id),
    name: String(t.name ?? ''),
    firstName: t.firstName ? String(t.firstName) : undefined,
    lastName: t.lastName ? String(t.lastName) : undefined,
    subject: String(t.subject ?? ''),
    staffId: t.staffId ? String(t.staffId) : undefined,
    initials: String(t.initials ?? (String(t.name ?? '').slice(0, 2).toUpperCase() || 'ED')),
    email: contactEmail && !isSyntheticPortalEmail(contactEmail) ? contactEmail : undefined,
    phone: t.phone ? String(t.phone) : undefined,
    loginId: appUserLoginId(t),
  };
}

function parseRoutePolyline(raw: unknown): [number, number][] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const points = raw
    .filter((p): p is number[] => Array.isArray(p) && p.length >= 2)
    .map((p) => [Number(p[0]), Number(p[1])] as [number, number]);
  return points.length >= 2 ? points : undefined;
}

export function mapTransportFromApi(t: Record<string, unknown>): TransportRoute {
  const studentsOnRoute = Array.isArray(t.students) ? t.students : [];
  const waypointsRaw = Array.isArray(t.waypoints) ? t.waypoints : [];
  let routePolyline: [number, number][] | undefined;
  if (typeof t.routePolylineJson === 'string' && t.routePolylineJson) {
    try {
      routePolyline = parseRoutePolyline(JSON.parse(t.routePolylineJson));
    } catch {
      routePolyline = undefined;
    }
  } else {
    routePolyline = parseRoutePolyline(t.routePolyline);
  }
  return {
    id: String(t.id),
    name: String(t.name ?? ''),
    driverName: String(t.driverName ?? ''),
    driverId: relationId(t.driver),
    departureTime: String(t.departureTime ?? ''),
    returnTime: t.returnTime ? String(t.returnTime) : undefined,
    note: t.note ? String(t.note) : undefined,
    studentIds: studentsOnRoute
      .map((s) => relationId(s))
      .filter((id): id is string => Boolean(id)),
    waypoints: waypointsRaw.map((wp) => {
      const w = wp as Record<string, unknown>;
      return {
        lat: Number(w.lat ?? 0),
        lng: Number(w.lng ?? 0),
        name: String(w.name ?? ''),
      };
    }),
    routePolyline,
  };
}

export function mapDriverFromApi(d: Record<string, unknown>): Driver {
  const appUser = d.appUser as Record<string, unknown> | undefined;
  return {
    id: String(d.id),
    name: String(d.name ?? ''),
    firstName: d.firstName ? String(d.firstName) : undefined,
    lastName: d.lastName ? String(d.lastName) : undefined,
    staffId: d.staffId ? String(d.staffId) : undefined,
    licenseNumber: d.licenseNumber ? String(d.licenseNumber) : undefined,
    email: d.email ? String(d.email) : appUser?.email ? String(appUser.email) : undefined,
    phone: d.phone ? String(d.phone) : undefined,
  };
}

export function mapClassFromApi(c: Record<string, unknown>): ClassItem {
  return {
    id: String(c.id),
    name: String(c.name ?? ''),
    level: String(c.level ?? ''),
    studentsCount: Number(c.studentsCount ?? 0),
    homeroomTeacherId: relationId(c.homeroomTeacher),
  };
}

export function mapMatiereFromApi(m: Record<string, unknown>): Matiere {
  return {
    id: String(m.id),
    name: String(m.name ?? ''),
  };
}

export function mapCourseFromApi(c: Record<string, unknown>): Course {
  return {
    id: String(c.id),
    name: String(c.name ?? ''),
    matiereId: relationId(c.matiere) ?? '',
    level: String(c.level ?? ''),
  };
}

export function mapRoomFromApi(r: Record<string, unknown>): Room {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    type: String(r.type ?? ''),
    capacity: r.capacity != null ? Number(r.capacity) : undefined,
  };
}

export function mapCalendarEventFromApi(e: Record<string, unknown>): CalendarEvent {
  return {
    id: String(e.id),
    label: String(e.label ?? ''),
    date: String(e.date ?? ''),
    time: e.time ? String(e.time) : undefined,
    location: e.location ? String(e.location) : undefined,
    type: EVENT_FROM_API[String(e.type)] ?? 'Autre',
  };
}

export function mapScheduleFromApi(s: Record<string, unknown>): ScheduleItem {
  return {
    id: String(s.id),
    classId: relationId(s.classItem) ?? '',
    courseId: relationId(s.course),
    day: String(s.day ?? ''),
    time: String(s.time ?? ''),
    room: s.room ? String(s.room) : undefined,
  };
}

export function mapEvaluationFromApi(e: Record<string, unknown>): Evaluation {
  return {
    id: String(e.id),
    classId: relationId(e.classItem) ?? '',
    courseId: relationId(e.course) ?? '',
    label: String(e.label ?? ''),
    date: String(e.date ?? ''),
    period: PERIOD_FROM_API[String(e.period)] ?? 'Trimestre 1',
    type: EVAL_TYPE_FROM_API[String(e.type)] ?? 'Devoir',
    coefficient: Number(e.coefficient ?? 1),
    maxScore: Number(e.maxScore ?? 20),
  };
}

export function mapCanteenMenuItemFromApi(c: Record<string, unknown>): CanteenMenuItem {
  return {
    id: String(c.id),
    day: String(c.day ?? ''),
    mealType: MEAL_FROM_API[String(c.mealType)] ?? 'Déjeuner',
    dish: String(c.dish ?? ''),
    note: c.note ? String(c.note) : undefined,
  };
}

export function mapStudentFromApi(s: Record<string, unknown>): Student {
  const appUser = s.appUser as Record<string, unknown> | undefined;
  const contactEmail = s.email ? String(s.email) : appUser?.email ? String(appUser.email) : undefined;
  return {
    id: String(s.id),
    name: String(s.name ?? ''),
    firstName: s.firstName ? String(s.firstName) : undefined,
    lastName: s.lastName ? String(s.lastName) : undefined,
    classId: relationId(s.classItem),
    email: contactEmail && !isSyntheticPortalEmail(contactEmail) ? contactEmail : undefined,
    phone: s.phone ? String(s.phone) : appUser?.phone ? String(appUser.phone) : undefined,
    matricule: s.matricule ? String(s.matricule) : undefined,
    idCardNumber: s.idCardNumber ? String(s.idCardNumber) : undefined,
    loginId: appUserLoginId(s),
  };
}

export function mapParentFromApi(p: Record<string, unknown>): ParentContact {
  const contactEmail = p.email ? String(p.email) : undefined;
  return {
    id: String(p.id),
    name: String(p.name ?? ''),
    firstName: p.firstName ? String(p.firstName) : undefined,
    lastName: p.lastName ? String(p.lastName) : undefined,
    phone: p.phone ? String(p.phone) : undefined,
    email: contactEmail && !isSyntheticPortalEmail(contactEmail) ? contactEmail : undefined,
    studentId: relationId(p.student),
    loginId: appUserLoginId(p),
  };
}

const USER_ROLE_TO_API: Record<AppUserRole, string> = {
  admin: 'ADMIN',
  teacher: 'TEACHER',
  parent: 'PARENT',
  student: 'STUDENT',
  staff: 'STAFF',
};

const USER_ROLE_FROM_API: Record<string, AppUserRole> = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
  STAFF: 'staff',
};

const FEE_CATEGORY_TO_API: Record<FeeCategory, string> = {
  Scolarité: 'SCOLARITE',
  Cantine: 'CANTINE',
  Transport: 'TRANSPORT',
};

const FEE_CATEGORY_FROM_API: Record<string, FeeCategory> = {
  SCOLARITE: 'Scolarité',
  CANTINE: 'Cantine',
  TRANSPORT: 'Transport',
};

export function mapUserFromApi(u: Record<string, unknown>): AppUser {
  const contactEmail = u.email ? String(u.email) : '';
  return {
    id: String(u.id),
    name: String(u.name ?? ''),
    email: contactEmail && !isSyntheticPortalEmail(contactEmail) ? contactEmail : '',
    phone: u.phone ? String(u.phone) : undefined,
    role: USER_ROLE_FROM_API[String(u.role)] ?? 'teacher',
    loginId: u.loginId ? String(u.loginId) : undefined,
  };
}

export function mapFeeInstallmentFromApi(f: Record<string, unknown>): FeeInstallment {
  return {
    id: String(f.id),
    category: FEE_CATEGORY_FROM_API[String(f.category)] ?? 'Scolarité',
    academicYear: String(f.academicYear ?? ''),
    label: String(f.label ?? ''),
    amount: Number(f.amount ?? 0),
    periodStart: String(f.periodStart ?? ''),
    periodEnd: String(f.periodEnd ?? ''),
    description: f.description ? String(f.description) : undefined,
    sortOrder: Number(f.sortOrder ?? 0),
  };
}

export function mapAnnouncementFromApi(a: Record<string, unknown>): Announcement {
  return {
    id: String(a.id),
    title: String(a.title ?? ''),
    body: String(a.body ?? ''),
    eventDate: a.eventDate ? String(a.eventDate) : undefined,
    location: a.location ? String(a.location) : undefined,
    published: Boolean(a.published),
    publishedAt: String(a.publishedAt ?? ''),
  };
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
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  setParents: React.Dispatch<React.SetStateAction<ParentContact[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  setGrades: React.Dispatch<React.SetStateAction<StudentGrade[]>>;
  setPaymentReminders: React.Dispatch<React.SetStateAction<PaymentReminder[]>>;
  setPaymentReceipts: React.Dispatch<React.SetStateAction<PaymentReceipt[]>>;
  setFeeInstallments?: React.Dispatch<React.SetStateAction<FeeInstallment[]>>;
  setAnnouncements?: React.Dispatch<React.SetStateAction<Announcement[]>>;
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
    drivers,
    parents,
    users,
    attendance,
    evaluations,
    grades,
    reminders,
    receipts,
    feeInstallments,
    announcements,
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
    adminApiFetch<Record<string, unknown>[]>('/api/drivers'),
    adminApiFetch<Record<string, unknown>[]>('/api/parents'),
    adminApiFetch<Record<string, unknown>[]>('/api/users'),
    adminApiFetch<Record<string, unknown>[]>('/api/attendance'),
    adminApiFetch<Record<string, unknown>[]>('/api/grades/evaluations'),
    adminApiFetch<Record<string, unknown>[]>('/api/grades'),
    adminApiFetch<Record<string, unknown>[]>('/api/payments/reminders'),
    adminApiFetch<Record<string, unknown>[]>('/api/payments/receipts'),
    adminApiFetch<Record<string, unknown>[]>('/api/fees'),
    adminApiFetch<Record<string, unknown>[]>('/api/announcements'),
  ]);

  setters.setTeachers(teachers.map(mapTeacherFromApi));
  setters.setClasses(classes.map(mapClassFromApi));
  setters.setStudents(students.map(mapStudentFromApi));
  setters.setMatieres(matieres.map(mapMatiereFromApi));
  setters.setCourses(courses.map(mapCourseFromApi));
  setters.setRooms(rooms.map(mapRoomFromApi));
  setters.setEvents(events.map(mapCalendarEventFromApi));
  setters.setSchedule(schedule.map(mapScheduleFromApi));
  setters.setCanteenMenuItems(canteen.map(mapCanteenMenuItemFromApi));
  setters.setTransportRoutes(transport.map(mapTransportFromApi));
  setters.setDrivers(drivers.map(mapDriverFromApi));
  setters.setParents(parents.map(mapParentFromApi));
  setters.setUsers(users.map(mapUserFromApi));
  setters.setAttendanceRecords(
    attendance.map((a) => ({
      id: String(a.id),
      date: String(a.date ?? ''),
      classId: relationId(a.classItem),
      studentId: relationId(a.student) ?? '',
      status: ATTENDANCE_FROM_API[String(a.status)] ?? 'Présent',
    }))
  );
  setters.setEvaluations(evaluations.map(mapEvaluationFromApi));
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
  setters.setFeeInstallments?.(feeInstallments.map(mapFeeInstallmentFromApi));
  setters.setAnnouncements?.(announcements.map(mapAnnouncementFromApi));
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
}): Promise<CanteenMenuItem> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/canteen', {
    method: 'POST',
    body: JSON.stringify({
      day: item.day,
      mealType: MEAL_TO_API[item.mealType] ?? 'DEJEUNER',
      dish: item.dish,
      note: item.note,
    }),
  });
  return mapCanteenMenuItemFromApi(data);
}

export async function createScheduleOnBackend(item: {
  classId: string;
  courseId?: string;
  day: string;
  time: string;
  room?: string;
}): Promise<ScheduleItem> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/schedule', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return mapScheduleFromApi(data);
}

export async function createTransportOnBackend(item: {
  name: string;
  driverName?: string;
  driverId?: string;
  departureTime: string;
  returnTime?: string;
  note?: string;
  waypoints?: { lat: number; lng: number; name: string }[];
  routePolyline?: [number, number][];
  studentIds?: string[];
}): Promise<TransportRoute> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/transport', {
    method: 'POST',
    body: JSON.stringify({
      name: item.name,
      driverName: item.driverName,
      driverId: item.driverId,
      departureTime: item.departureTime,
      returnTime: item.returnTime,
      note: item.note,
      waypoints: item.waypoints,
      routePolyline: item.routePolyline,
      studentIds: item.studentIds,
    }),
  });
  return mapTransportFromApi(data);
}

export async function updateTransportStudentsOnBackend(
  routeId: string,
  studentIds: string[],
): Promise<TransportRoute> {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/transport/${routeId}/students`, {
    method: 'PATCH',
    body: JSON.stringify(studentIds),
  });
  return mapTransportFromApi(data);
}

export async function createDriverOnBackend(item: {
  firstName: string;
  lastName: string;
  staffId?: string;
  licenseNumber?: string;
  email?: string;
  password?: string;
  phone?: string;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/drivers', {
    method: 'POST',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      staffId: item.staffId?.trim() || undefined,
      licenseNumber: item.licenseNumber?.trim() || undefined,
      email: item.email?.trim() || undefined,
      password: item.password?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
    }),
  });
  return mapDriverFromApi(data);
}

export async function updateDriverOnBackend(
  id: string,
  item: {
    firstName: string;
    lastName: string;
    staffId?: string;
    licenseNumber?: string;
    email?: string;
    password?: string;
    phone?: string;
  },
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      staffId: item.staffId?.trim() || undefined,
      licenseNumber: item.licenseNumber?.trim() || undefined,
      email: item.email?.trim() || undefined,
      password: item.password?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
    }),
  });
  return mapDriverFromApi(data);
}

export async function deleteDriverOnBackend(id: string) {
  await adminApiFetch(`/api/drivers/${id}`, { method: 'DELETE' });
}

export async function createEventOnBackend(item: {
  label: string;
  date: string;
  time?: string;
  location?: string;
  type: string;
}): Promise<CalendarEvent> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/calendar', {
    method: 'POST',
    body: JSON.stringify({
      label: item.label,
      date: item.date,
      time: item.time,
      location: item.location,
      type: EVENT_TO_API[item.type] ?? 'AUTRE',
    }),
  });
  return mapCalendarEventFromApi(data);
}

export async function createClassOnBackend(item: {
  name: string;
  level: string;
  studentsCount?: number;
  homeroomTeacherId?: string;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/classes', {
    method: 'POST',
    body: JSON.stringify({
      name: item.name,
      level: item.level,
      studentsCount: item.studentsCount ?? 0,
      homeroomTeacherId: item.homeroomTeacherId || null,
    }),
  });
  return mapClassFromApi(data);
}

export async function updateClassOnBackend(
  id: string,
  item: { name: string; level: string; studentsCount: number; homeroomTeacherId?: string }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: item.name,
      level: item.level,
      studentsCount: item.studentsCount,
      homeroomTeacherId: item.homeroomTeacherId || null,
    }),
  });
  return mapClassFromApi(data);
}

export async function deleteClassOnBackend(id: string) {
  await adminApiFetch(`/api/classes/${id}`, { method: 'DELETE' });
}

export async function refreshUsersFromBackend(): Promise<AppUser[]> {
  const users = await adminApiFetch<Record<string, unknown>[]>('/api/users');
  return users.map(mapUserFromApi);
}

export async function createTeacherOnBackend(item: {
  firstName: string;
  lastName: string;
  subject: string;
  staffId?: string;
  email?: string;
  password?: string;
  phone?: string;
  homeroomClassIds?: string[];
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/teachers', {
    method: 'POST',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      subject: item.subject,
      staffId: item.staffId?.trim() || undefined,
      email: item.email?.trim() || undefined,
      password: item.password?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      homeroomClassIds: item.homeroomClassIds?.length ? item.homeroomClassIds : undefined,
    }),
  });
  return mapTeacherFromApi(data);
}

export async function updateTeacherOnBackend(
  id: string,
  item: {
    firstName: string;
    lastName: string;
    subject: string;
    staffId?: string;
    email?: string;
    password?: string;
    phone?: string;
    homeroomClassIds?: string[];
  }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      subject: item.subject,
      staffId: item.staffId?.trim() || undefined,
      email: item.email?.trim() || undefined,
      password: item.password?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      homeroomClassIds: item.homeroomClassIds ?? [],
    }),
  });
  return mapTeacherFromApi(data);
}

export async function deleteTeacherOnBackend(id: string) {
  await adminApiFetch(`/api/teachers/${id}`, { method: 'DELETE' });
}

export async function createStudentOnBackend(item: {
  firstName: string;
  lastName: string;
  idCardNumber?: string;
  classId?: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/students', {
    method: 'POST',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      idCardNumber: item.idCardNumber?.trim() || undefined,
      classId: item.classId || null,
      email: item.email?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      password: item.password?.trim() || undefined,
    }),
  });
  return mapStudentFromApi(data);
}

export async function updateStudentOnBackend(
  id: string,
  item: {
    firstName: string;
    lastName: string;
    idCardNumber?: string;
    classId?: string;
    email?: string;
    phone?: string;
    password?: string;
  }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      idCardNumber: item.idCardNumber?.trim() || undefined,
      classId: item.classId || null,
      email: item.email?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      password: item.password?.trim() || undefined,
    }),
  });
  return mapStudentFromApi(data);
}

export async function fetchStudentIdCardOnBackend(studentId: string): Promise<StudentIdCardData> {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/students/${studentId}/id-card`);
  return {
    studentId: String(data.studentId ?? studentId),
    matricule: String(data.matricule ?? ''),
    idCardNumber: String(data.idCardNumber ?? data.matricule ?? ''),
    firstName: String(data.firstName ?? ''),
    lastName: String(data.lastName ?? ''),
    studentName: String(data.studentName ?? ''),
    className: String(data.className ?? ''),
    schoolName: String(data.schoolName ?? ''),
    schoolCity: data.schoolCity ? String(data.schoolCity) : undefined,
    academicYear: String(data.academicYear ?? ''),
    qrPayload: String(data.qrPayload ?? ''),
  };
}

export async function fetchTeacherIdCardOnBackend(teacherId: string): Promise<TeacherIdCardData> {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/teachers/${teacherId}/id-card`);
  return {
    teacherId: String(data.teacherId ?? teacherId),
    staffId: String(data.staffId ?? ''),
    firstName: String(data.firstName ?? ''),
    lastName: String(data.lastName ?? ''),
    teacherName: String(data.teacherName ?? ''),
    subject: String(data.subject ?? ''),
    schoolName: String(data.schoolName ?? ''),
    schoolCity: data.schoolCity ? String(data.schoolCity) : undefined,
    academicYear: String(data.academicYear ?? ''),
    qrPayload: String(data.qrPayload ?? ''),
  };
}

export async function downloadStudentRosterDocx(classId?: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const query = classId ? `?classId=${encodeURIComponent(classId)}` : '';
  try {
    const res = await fetch(`${BASE_URL}/api/students/export/roster.docx${query}`, { headers });
    if (!res.ok) {
      throw new Error(await parseApiErrorResponse(res, 'Erreur export liste élèves'));
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = classId ? `liste-eleves-${classId}.docx` : 'liste-eleves.docx';
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    throw wrapFetchError(err, 'Erreur de communication avec le serveur');
  }
}

export async function deleteStudentOnBackend(id: string) {
  await adminApiFetch(`/api/students/${id}`, { method: 'DELETE' });
}

export async function createMatiereOnBackend(name: string): Promise<Matiere> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/matieres', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return mapMatiereFromApi(data);
}

export async function createCourseOnBackend(item: {
  name: string;
  matiereId: string;
  level: string;
}): Promise<Course> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return mapCourseFromApi(data);
}

export async function createRoomOnBackend(item: {
  name: string;
  type: string;
  capacity?: number;
}): Promise<Room> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return mapRoomFromApi(data);
}

export async function createParentOnBackend(item: {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  studentId?: string;
  password?: string;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/parents', {
    method: 'POST',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      phone: item.phone,
      email: item.email?.trim() || undefined,
      studentId: item.studentId || null,
      password: item.password?.trim() || undefined,
    }),
  });
  return mapParentFromApi(data);
}

export async function updateParentOnBackend(
  id: string,
  item: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    studentId?: string;
    password?: string;
  }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/parents/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: item.firstName.trim(),
      lastName: item.lastName.trim(),
      phone: item.phone,
      email: item.email?.trim() || undefined,
      studentId: item.studentId || null,
      password: item.password?.trim() || undefined,
    }),
  });
  return mapParentFromApi(data);
}

export async function deleteParentOnBackend(id: string) {
  await adminApiFetch(`/api/parents/${id}`, { method: 'DELETE' });
}

export async function createUserOnBackend(item: {
  name: string;
  email?: string;
  phone?: string;
  role: AppUserRole;
  password?: string;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      name: item.name,
      email: item.email?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      role: USER_ROLE_TO_API[item.role],
      password: item.password,
    }),
  });
  return mapUserFromApi(data);
}

export async function updateUserOnBackend(
  id: string,
  item: { name: string; email?: string; phone?: string; role: AppUserRole; password?: string }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: item.name,
      email: item.email?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      role: USER_ROLE_TO_API[item.role],
      password: item.password,
    }),
  });
  return mapUserFromApi(data);
}

export async function createFeeInstallmentOnBackend(item: {
  category: FeeCategory;
  academicYear: string;
  label: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  description?: string;
  sortOrder?: number;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/fees', {
    method: 'POST',
    body: JSON.stringify({
      category: FEE_CATEGORY_TO_API[item.category],
      academicYear: item.academicYear,
      label: item.label,
      amount: item.amount,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      description: item.description,
      sortOrder: item.sortOrder,
    }),
  });
  return mapFeeInstallmentFromApi(data);
}

export async function updateFeeInstallmentOnBackend(
  id: string,
  item: {
    category: FeeCategory;
    academicYear: string;
    label: string;
    amount: number;
    periodStart: string;
    periodEnd: string;
    description?: string;
    sortOrder?: number;
  }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/fees/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      category: FEE_CATEGORY_TO_API[item.category],
      academicYear: item.academicYear,
      label: item.label,
      amount: item.amount,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      description: item.description,
      sortOrder: item.sortOrder,
    }),
  });
  return mapFeeInstallmentFromApi(data);
}

export async function deleteFeeInstallmentOnBackend(id: string) {
  await adminApiFetch(`/api/fees/${id}`, { method: 'DELETE' });
}

export type CommunicationResult = {
  recipientsCount: number;
  emailsSent: number;
  emailConfigured: boolean;
  portalPublished: boolean;
  message?: string;
};

export async function fetchCommunicationStatusOnBackend() {
  return adminApiFetch<{ configured: boolean; enabled: boolean }>('/api/communications/status');
}

export async function sendParentMessageOnBackend(item: {
  subject: string;
  body: string;
  audience: 'PARENTS' | 'CLASS_PARENTS' | 'ALL_FAMILIES';
  classId?: string;
  sendEmail?: boolean;
  publishOnPortal?: boolean;
}) {
  const path =
    item.audience === 'ALL_FAMILIES' ? '/api/communications/broadcast' : '/api/communications/parents';
  return adminApiFetch<CommunicationResult>(path, {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function createAnnouncementOnBackend(item: {
  title: string;
  body: string;
  eventDate?: string;
  location?: string;
  published?: boolean;
  notifyByEmail?: boolean;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return mapAnnouncementFromApi(data);
}

export async function updateAnnouncementOnBackend(
  id: string,
  item: {
    title: string;
    body: string;
    eventDate?: string;
    location?: string;
    published?: boolean;
    notifyByEmail?: boolean;
  }
) {
  const data = await adminApiFetch<Record<string, unknown>>(`/api/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
  return mapAnnouncementFromApi(data);
}

export async function deleteAnnouncementOnBackend(id: string) {
  await adminApiFetch(`/api/announcements/${id}`, { method: 'DELETE' });
}

export type AppModule = 'ADMIN_CONSOLE' | 'FAMILY_PORTAL' | 'FINANCE_OFFICE';
export type AccessLevel = 'NONE' | 'READ' | 'WRITE';

export type RoleAccessEntry = {
  role: string;
  module: AppModule;
  accessLevel: AccessLevel;
};

export async function fetchRoleAccessMatrix(): Promise<RoleAccessEntry[]> {
  const rows = await adminApiFetch<Record<string, unknown>[]>('/api/role-access');
  return rows.map((r) => ({
    role: String(r.role),
    module: String(r.module) as AppModule,
    accessLevel: String(r.accessLevel) as AccessLevel,
  }));
}

export async function updateRoleAccessMatrix(entries: RoleAccessEntry[]): Promise<RoleAccessEntry[]> {
  const rows = await adminApiFetch<Record<string, unknown>[]>('/api/role-access', {
    method: 'PUT',
    body: JSON.stringify(entries),
  });
  return rows.map((r) => ({
    role: String(r.role),
    module: String(r.module) as AppModule,
    accessLevel: String(r.accessLevel) as AccessLevel,
  }));
}

export async function deleteUserOnBackend(id: string) {
  await adminApiFetch(`/api/users/${id}`, { method: 'DELETE' });
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
}): Promise<Evaluation> {
  const data = await adminApiFetch<Record<string, unknown>>('/api/grades/evaluations', {
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
  return mapEvaluationFromApi(data);
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

export function mapGradeModificationRequestFromApi(
  row: Record<string, unknown>,
): GradeModificationRequest {
  return {
    id: String(row.id),
    evaluationId: String(row.evaluationId ?? ''),
    evaluationLabel: String(row.evaluationLabel ?? ''),
    courseName: row.courseName ? String(row.courseName) : undefined,
    studentId: String(row.studentId ?? ''),
    studentName: String(row.studentName ?? ''),
    classId: row.classId ? String(row.classId) : undefined,
    className: row.className ? String(row.className) : undefined,
    teacherId: String(row.teacherId ?? ''),
    teacherName: String(row.teacherName ?? ''),
    currentScore: Number(row.currentScore ?? 0),
    requestedScore: Number(row.requestedScore ?? 0),
    maxScore: row.maxScore != null ? Number(row.maxScore) : undefined,
    reason: String(row.reason ?? ''),
    status: String(row.status ?? 'PENDING') as GradeModificationRequest['status'],
    adminNote: row.adminNote ? String(row.adminNote) : undefined,
    reviewedByName: row.reviewedByName ? String(row.reviewedByName) : undefined,
    createdAt: row.createdAt ? String(row.createdAt) : undefined,
    reviewedAt: row.reviewedAt ? String(row.reviewedAt) : undefined,
  };
}

export async function fetchGradeModificationRequests(
  status?: string,
): Promise<GradeModificationRequest[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const rows = await adminApiFetch<Record<string, unknown>[]>(
    `/api/grades/modification-requests${qs}`,
  );
  return rows.map(mapGradeModificationRequestFromApi);
}

export async function submitGradeModificationRequestOnBackend(item: {
  evaluationId: string;
  studentId: string;
  requestedScore: number;
  reason: string;
}) {
  const data = await adminApiFetch<Record<string, unknown>>('/api/grades/modification-requests', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return mapGradeModificationRequestFromApi(data);
}

export async function approveGradeModificationRequestOnBackend(
  id: string,
  adminNote?: string,
) {
  const data = await adminApiFetch<Record<string, unknown>>(
    `/api/grades/modification-requests/${id}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({ adminNote: adminNote?.trim() || undefined }),
    },
  );
  return mapGradeModificationRequestFromApi(data);
}

export async function rejectGradeModificationRequestOnBackend(
  id: string,
  adminNote?: string,
) {
  const data = await adminApiFetch<Record<string, unknown>>(
    `/api/grades/modification-requests/${id}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ adminNote: adminNote?.trim() || undefined }),
    },
  );
  return mapGradeModificationRequestFromApi(data);
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
