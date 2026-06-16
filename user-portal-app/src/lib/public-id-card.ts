import { BASE_URL } from '@/constants';

export type PublicStudentCard = {
  studentId: string;
  matricule?: string;
  idCardNumber?: string;
  firstName?: string;
  lastName?: string;
  studentName: string;
  className?: string;
  classLevel?: string;
  schoolName: string;
  schoolCity?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  headName?: string;
  academicYear?: string;
  homeroomTeacherName?: string;
  parentName?: string;
  parentPhone?: string;
};

export type PublicTeacherCard = {
  teacherId: string;
  staffId?: string;
  firstName?: string;
  lastName?: string;
  teacherName: string;
  subject?: string;
  schoolName: string;
  schoolCity?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  headName?: string;
  academicYear?: string;
};

async function readPublicCard<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    let message = 'Carte introuvable ou invalide.';
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchPublicStudentCard(studentId: string): Promise<PublicStudentCard> {
  return readPublicCard<PublicStudentCard>(`/api/public/id-card/students/${studentId}`);
}

export async function fetchPublicTeacherCard(teacherId: string): Promise<PublicTeacherCard> {
  return readPublicCard<PublicTeacherCard>(`/api/public/id-card/teachers/${teacherId}`);
}
