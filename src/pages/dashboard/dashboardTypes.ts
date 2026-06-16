import type React from 'react';

export type SectionId =
  | 'overview'
  | 'system_registry'
  | 'classes'
  | 'teachers'
  | 'students'
  | 'parents'
  | 'courses'
  | 'matieres'
  | 'rooms'
  | 'calendar'
  | 'schedule'
  | 'attendance'
  | 'grades'
  | 'users'
  | 'payments'
  | 'fee_schedules'
  | 'announcements'
  | 'canteen'
  | 'transport'
  | 'reports'
  | 'sis'
  | 'curriculum'
  | 'exams'
  | 'permissions'
  | 'settings_profile'
  | 'settings_branding'
  | 'settings_academics'
  | 'settings_attendance'
  | 'settings_examinations'
  | 'settings_finance'
  | 'settings_communication'
  | 'settings_security'
  | 'settings_compliance'
  | 'settings_automation'
  | 'billing';

export type Teacher = {
  id: string;
  initials: string;
  name: string;
  firstName?: string;
  lastName?: string;
  subject: string;
  staffId?: string;
  email?: string;
  phone?: string;
};

export type ClassItem = {
  id: string;
  name: string;
  level: string;
  studentsCount: number;
  homeroomTeacherId?: string;
};

export type Student = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  classId?: string;
  email?: string;
  phone?: string;
  matricule?: string;
  idCardNumber?: string;
};

export type ParentContact = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  studentId?: string;
};

export type Course = {
  id: string;
  /** Libellé du cours (optionnel, peut reprendre le nom de la matière). */
  name: string;
  /** Référence vers la matière (Mathématiques, Français, etc.). */
  matiereId?: string;
  /** Niveau / cycle concerné (ex. Collège, Lycée, 3ème…). */
  level: string;
};

export type Matiere = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  name: string;
  type: string;
  capacity?: number;
};

export type CalendarEvent = {
  id: string;
  label: string;
  date: string;
  time?: string;
  location?: string;
  type: 'Promotion' | 'Réunion' | 'Examen' | 'Autre';
};

export type ScheduleItem = {
  id: string;
  classId: string;
  courseId?: string;
  day: string;
  time: string;
  room?: string;
};

export type AttendanceStatus = 'Présent' | 'Absent' | 'Retard';

export type AttendanceRecord = {
  id: string;
  date: string;
  classId?: string;
  studentId: string;
  status: AttendanceStatus;
};

export type CanteenMenuItem = {
  id: string;
  day: string;
  mealType: 'Déjeuner' | 'Dîner' | 'Goûter';
  dish: string;
  note?: string;
};

export type TransportRouteWaypoint = {
  lat: number;
  lng: number;
  name: string;
};

export type TransportRoute = {
  id: string;
  name: string;
  driverName: string;
  departureTime: string;
  returnTime?: string;
  note?: string;
  /** Saved trajet for display on map (e.g. for parents). */
  waypoints?: TransportRouteWaypoint[];
  routePolyline?: [number, number][];
  /** Student IDs assigned to this route (see this trajet in their dashboard). */
  studentIds?: string[];
};

export type EvaluationPeriod = 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3' | 'Semestre 1' | 'Semestre 2';

export type Evaluation = {
  id: string;
  classId: string;
  courseId: string;
  label: string;
  date: string;
  period: EvaluationPeriod;
  type: 'Devoir' | 'Interro' | 'Examen';
  coefficient: number;
  maxScore: number;
};

export type StudentGrade = {
  id: string;
  evaluationId: string;
  studentId: string;
  score: number;
};

export type PaymentReminder = {
  id: string;
  parentName: string;
  studentName?: string;
  amount: number;
  dueDate: string;
  status: 'En attente' | 'Envoyé' | 'Payé';
};

export type PaymentReceipt = {
  id: string;
  parentName: string;
  studentName?: string;
  amount: number;
  date: string;
  reference: string;
};

export type NewClassFormState = {
  name: string;
  /** Type d’établissement (Maternelle, Primaire, etc.) quand l’école propose plusieurs types. */
  schoolType: string;
  level: string;
  studentsCount: string;
  homeroomTeacherId: string;
};

export type NewTeacherFormState = {
  firstName: string;
  lastName: string;
  subject: string;
  staffId: string;
  email: string;
  password: string;
  phone: string;
  homeroomClassIds: string[];
};

export type NewStudentFormState = {
  firstName: string;
  lastName: string;
  idCardNumber: string;
  classId: string;
  email: string;
  phone: string;
  password: string;
};

export type FeeCategory = 'Scolarité' | 'Cantine' | 'Transport';

export type FeeInstallment = {
  id: string;
  category: FeeCategory;
  academicYear: string;
  label: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  description?: string;
  sortOrder: number;
};

export type NewFeeInstallmentFormState = {
  category: FeeCategory;
  academicYear: string;
  label: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  description: string;
  sortOrder: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  eventDate?: string;
  location?: string;
  published: boolean;
  publishedAt: string;
  notifyByEmail?: boolean;
};

export type NewAnnouncementFormState = {
  title: string;
  body: string;
  eventDate: string;
  location: string;
  published: boolean;
  notifyByEmail: boolean;
};

export type ParentMessageAudience = 'PARENTS' | 'CLASS_PARENTS' | 'ALL_FAMILIES';

export type NewParentMessageFormState = {
  subject: string;
  body: string;
  audience: ParentMessageAudience;
  classId: string;
  sendEmail: boolean;
  publishOnPortal: boolean;
};

export type NewParentFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  studentId: string;
};

export type NewCourseFormState = {
  name: string;
  matiereId: string;
  level: string;
};

export type NewMatiereFormState = {
  name: string;
};

export type NewRoomFormState = {
  name: string;
  type: string;
  capacity: string;
};

export type NewEventFormState = {
  label: string;
  date: string;
  time: string;
  location: string;
  type: CalendarEvent['type'];
};

export type NewSlotFormState = {
  classId: string;
  courseId: string;
  day: string;
  time: string;
  room: string;
};

export type NewCanteenItemFormState = {
  day: string;
  mealType: CanteenMenuItem['mealType'];
  dish: string;
  note: string;
};

export type NewTransportRouteFormState = {
  name: string;
  driverName: string;
  departureTime: string;
  returnTime: string;
  note: string;
};

export type NewEvaluationFormState = {
  classId: string;
  courseId: string;
  label: string;
  date: string;
  period: EvaluationPeriod;
  type: Evaluation['type'];
  coefficient: string;
  maxScore: string;
};

export type NewPaymentReminderFormState = {
  parentName: string;
  studentName: string;
  amount: string;
  dueDate: string;
  note: string;
};

export type NewPaymentReceiptFormState = {
  parentName: string;
  studentName: string;
  amount: string;
  date: string;
  reference: string;
};

export type AppUserRole = 'admin' | 'teacher' | 'parent' | 'student' | 'staff';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AppUserRole;
};

export type NewUserFormState = {
  name: string;
  email: string;
  phone: string;
  role: AppUserRole;
  password?: string;
};

export type StudentIdCardData = {
  studentId: string;
  matricule: string;
  idCardNumber: string;
  firstName: string;
  lastName: string;
  studentName: string;
  className: string;
  schoolName: string;
  schoolCity?: string;
  academicYear: string;
  qrPayload: string;
};

export type TeacherIdCardData = {
  teacherId: string;
  staffId: string;
  firstName: string;
  lastName: string;
  teacherName: string;
  subject: string;
  schoolName: string;
  schoolCity?: string;
  academicYear: string;
  qrPayload: string;
};

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

