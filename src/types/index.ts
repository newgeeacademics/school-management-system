import { classSchema, facultySchema, subjectSchema } from "@/lib/schema";
import * as z from 'zod';

export type SignUpPayload = {
  email: string;
  name: string;
  password: string;
  username?: string;
  image?: string;
  imageCldPubId?: string;
  role: UserRole;
};

export type School = {
  id: string;
  name: string;
  type: string;
  system: string;
  country: string;
  city: string;
  commune: string;
  address: string;
  gpsLat: number | null;
  gpsLng: number | null;
  phone: string;
  officialEmail: string;
  directorName: string;
  directorPhone: string;
  website: string;
  logoUrl: string;
  logoCldPubId: string;
  studentCount: number | null;
  teacherCount: number | null;
  series: string[];
  /** Optional extended profile captured at registration */
  legalName?: string;
  registrationNumber?: string;
  accreditationRef?: string;
  academicYearLabel?: string;
  languagesOffered?: string[];
  openingHours?: string;
  socialLinks?: string;
  billingContactName?: string;
  billingEmail?: string;
  billingPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SchoolRegistrationPayload = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  schoolName: string;
  schoolType: string;
  system: string;
  country: string;
  city: string;
  commune: string;
  address: string;
  gpsLat?: number | string;
  gpsLng?: number | string;
  phone: string;
  officialEmail: string;
  directorName: string;
  directorPhone: string;
  website: string;
  logoUrl?: string;
  logoCldPubId?: string;
  studentCount?: number | string;
  teacherCount?: number | string;
  series?: string[];
  legalName?: string;
  registrationNumber?: string;
  accreditationRef?: string;
  academicYearLabel?: string;
  languagesOffered?: string[];
  openingHours?: string;
  socialLinks?: string;
  billingContactName?: string;
  billingEmail?: string;
  billingPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  internalNotes?: string;
};

export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
  type?: 'profile' | 'banner';
  maxSizeText?: string;
  currentImageUrl?: string;
};

// ====== Resource types
export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  imageCldPubId?: string;
  department?: string;
  schoolId?: string | null;
};

export type Subject = {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  createdAt?: string;
};

export type ClassSchedule = {
  day: string;
  startTime: string;
  endTime: string;
};

/** Class group (e.g. 5ème A, 5ème B) – name + capacity, no subject/teacher */
export type ClassGroup = {
  id: number;
  name: string;
  capacity: number;
  term?: string;
};

export type Class = {
  id: number;
  name: string;
  subjectId: number;
  teacherId: string;
  classGroupId?: number;
  term?: string;
  capacity?: number;
  description?: string;
  status: 'active' | 'inactive';
  bannerUrl?: string;
  bannerCldPubId?: string;
  schedules?: ClassSchedule[];
  subject?: Subject;
  teacher?: User;
  classGroup?: ClassGroup;
  inviteCode?: string;
  students?: {
    id: string;
    name: string;
    email: string;
    enrolledAt: string;
    enrollmentId: string;
  }[];
};

// ====== Schema inferred types
export type FacultyFormValues = z.infer<typeof facultySchema>;

export type SubjectFormValues = z.infer<typeof subjectSchema>;

export type ClassFormValues = z.infer<typeof classSchema>;
