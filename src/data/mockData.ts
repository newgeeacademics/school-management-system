import type { User, Subject, Class } from '@/types';
import { UserRole } from '@/types';

const now = new Date().toISOString();

export const MOCK_USERS: User[] = [
  {
    id: 'user-admin-1',
    createdAt: now,
    updatedAt: now,
    email: 'admin@school.edu',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  {
    id: 'user-teacher-1',
    createdAt: now,
    updatedAt: now,
    email: 'teacher@school.edu',
    name: 'Jane Teacher',
    role: UserRole.TEACHER,
    department: 'Computer Science',
  },
  {
    id: 'user-teacher-2',
    createdAt: now,
    updatedAt: now,
    email: 'teacher2@school.edu',
    name: 'John Doe',
    role: UserRole.TEACHER,
    department: 'Mathematics',
  },
  {
    id: 'user-student-1',
    createdAt: now,
    updatedAt: now,
    email: 'student@school.edu',
    name: 'Alice Student',
    role: UserRole.STUDENT,
  },
  {
    id: 'user-student-2',
    createdAt: now,
    updatedAt: now,
    email: 'student2@school.edu',
    name: 'Bob Student',
    role: UserRole.STUDENT,
  },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: 'Introduction to Programming', code: 'CS101', description: 'Fundamentals of programming', department: 'Computer Science', createdAt: now },
  { id: 2, name: 'Algebra I', code: 'MATH101', description: 'Linear algebra basics', department: 'Mathematics', createdAt: now },
  { id: 3, name: 'Web Development', code: 'CS201', description: 'Frontend and backend basics', department: 'Computer Science', createdAt: now },
];

export const MOCK_CLASSES: Class[] = [
  {
    id: 1,
    name: 'CS101 - Fall 2026',
    subjectId: 1,
    teacherId: 'user-teacher-1',
    capacity: 30,
    description: 'Intro to programming for beginners.',
    status: 'active',
    inviteCode: 'ABC123',
    schedules: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
    ],
    students: [],
  },
  {
    id: 2,
    name: 'MATH101 - Fall 2026',
    subjectId: 2,
    teacherId: 'user-teacher-2',
    capacity: 25,
    description: 'Algebra I fundamentals.',
    status: 'active',
    inviteCode: 'MATH01',
    schedules: [
      { day: 'Tuesday', startTime: '11:00', endTime: '12:30' },
      { day: 'Thursday', startTime: '11:00', endTime: '12:30' },
    ],
    students: [],
  },
  {
    id: 3,
    name: 'Web Dev - Fall 2026',
    subjectId: 3,
    teacherId: 'user-teacher-1',
    capacity: 20,
    description: 'Build modern web applications.',
    status: 'active',
    inviteCode: 'WEB202',
    schedules: [
      { day: 'Friday', startTime: '14:00', endTime: '15:30' },
    ],
    students: [],
  },
];

export type EnrollmentRecord = {
  id: number;
  studentId: string;
  classId: number;
  enrolledAt: string;
};

export const MOCK_ENROLLMENTS: EnrollmentRecord[] = [
  { id: 1, studentId: 'user-student-1', classId: 1, enrolledAt: now },
  { id: 2, studentId: 'user-student-1', classId: 2, enrolledAt: now },
];

const STORAGE_KEYS = {
  users: 'mock_users',
  subjects: 'mock_subjects',
  classes: 'mock_classes',
  enrollments: 'mock_enrollments',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Mock data: failed to save to localStorage', e);
  }
}

export function getStoredUsers(): User[] {
  return loadFromStorage(STORAGE_KEYS.users, MOCK_USERS);
}

export function setStoredUsers(users: User[]) {
  saveToStorage(STORAGE_KEYS.users, users);
}

export function getStoredSubjects(): Subject[] {
  return loadFromStorage(STORAGE_KEYS.subjects, MOCK_SUBJECTS);
}

export function setStoredSubjects(subjects: Subject[]) {
  saveToStorage(STORAGE_KEYS.subjects, subjects);
}

export function getStoredClasses(): Class[] {
  return loadFromStorage(STORAGE_KEYS.classes, MOCK_CLASSES);
}

export function setStoredClasses(classes: Class[]) {
  saveToStorage(STORAGE_KEYS.classes, classes);
}

export function getStoredEnrollments(): EnrollmentRecord[] {
  return loadFromStorage(STORAGE_KEYS.enrollments, MOCK_ENROLLMENTS);
}

export function setStoredEnrollments(enrollments: EnrollmentRecord[]) {
  saveToStorage(STORAGE_KEYS.enrollments, enrollments);
}
