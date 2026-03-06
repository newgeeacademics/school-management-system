import type React from 'react';

export type SectionId =
  | 'overview'
  | 'classes'
  | 'teachers'
  | 'students'
  | 'parents'
  | 'courses'
  | 'rooms'
  | 'calendar'
  | 'schedule'
  | 'users'
  | 'payments'
  | 'canteen'
  | 'transport';

export type Teacher = {
  id: string;
  initials: string;
  name: string;
  subject: string;
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
  classId?: string;
};

export type ParentContact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  studentId?: string;
};

export type Course = {
  id: string;
  name: string;
  level: string;
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
  name: string;
  subject: string;
};

export type NewStudentFormState = {
  name: string;
  classId: string;
};

export type NewParentFormState = {
  name: string;
  phone: string;
  email: string;
  studentId: string;
};

export type NewCourseFormState = {
  name: string;
  level: string;
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

export type AppUserRole = 'admin' | 'teacher' | 'parent' | 'student';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
};

export type NewUserFormState = {
  name: string;
  email: string;
  role: AppUserRole;
};

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

