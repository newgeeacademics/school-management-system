import { BASE_URL } from '@/constants';
import type { StudentIdCardData, TeacherIdCardData } from '@/pages/dashboard/dashboardTypes';

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

export async function fetchPublicStudentIdCard(studentId: string): Promise<StudentIdCardData> {
  const data = await readPublicCard<StudentIdCardData>(`/api/public/id-card/students/${studentId}`);
  return {
    studentId: data.studentId,
    matricule: data.matricule,
    idCardNumber: data.idCardNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    studentName: data.studentName,
    className: data.className,
    schoolName: data.schoolName,
    schoolCity: data.schoolCity,
    academicYear: data.academicYear,
    qrPayload: '',
  };
}

export async function fetchPublicTeacherIdCard(teacherId: string): Promise<TeacherIdCardData> {
  const data = await readPublicCard<TeacherIdCardData>(`/api/public/id-card/teachers/${teacherId}`);
  return {
    teacherId: data.teacherId,
    staffId: data.staffId,
    firstName: data.firstName,
    lastName: data.lastName,
    teacherName: data.teacherName,
    subject: data.subject,
    schoolName: data.schoolName,
    schoolCity: data.schoolCity,
    academicYear: data.academicYear,
    qrPayload: '',
  };
}
