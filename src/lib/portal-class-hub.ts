import { apiFetch } from '@/lib/api';

export type AttendanceStatusApi = 'PRESENT' | 'ABSENT' | 'RETARD';

export type PortalClassDetail = {
  id: string;
  name: string;
  level?: string;
  studentsCount?: number;
  canEdit: boolean;
  students: { id: string; name: string }[];
};

export type PortalRollCall = {
  classId: string;
  className: string;
  date: string;
  canEdit: boolean;
  students: {
    studentId: string;
    studentName: string;
    status: AttendanceStatusApi;
    recordId?: string;
  }[];
};

export type PortalHomeworkItem = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt?: string;
};

export type PortalHomeworkList = {
  classId: string;
  className: string;
  canEdit: boolean;
  items: PortalHomeworkItem[];
};

export type PortalTeacherContact = {
  classId: string;
  className: string;
  studentName?: string;
  teacherId: string;
  teacherName: string;
  subject?: string;
  phone?: string;
  email?: string;
};

export async function fetchPortalClassDetail(classId: string): Promise<PortalClassDetail> {
  return apiFetch<PortalClassDetail>(`/api/portal/classes/${classId}`);
}

export async function fetchPortalRollCall(classId: string, date: string): Promise<PortalRollCall> {
  const params = new URLSearchParams({ date });
  return apiFetch<PortalRollCall>(`/api/portal/classes/${classId}/roll-call?${params}`);
}

export async function savePortalRollCall(payload: {
  classId: string;
  date: string;
  entries: { studentId: string; status: AttendanceStatusApi }[];
}): Promise<PortalRollCall> {
  return apiFetch<PortalRollCall>('/api/portal/classes/roll-call', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchPortalHomework(classId: string): Promise<PortalHomeworkList> {
  return apiFetch<PortalHomeworkList>(`/api/portal/classes/${classId}/homework`);
}

export async function createPortalHomework(payload: {
  classId: string;
  title: string;
  description?: string;
  dueDate: string;
}): Promise<PortalHomeworkItem> {
  return apiFetch<PortalHomeworkItem>('/api/portal/homework', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deletePortalHomework(id: string): Promise<void> {
  await apiFetch(`/api/portal/homework/${id}`, { method: 'DELETE' });
}

export async function fetchPortalDirectory(): Promise<{ teachers: PortalTeacherContact[] }> {
  return apiFetch<{ teachers: PortalTeacherContact[] }>('/api/portal/directory');
}
