import { apiFetch } from '@/lib/api';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD';

export type PortalAttendanceRecord = {
  id: string;
  date: string;
  status: AttendanceStatus;
  className?: string;
  studentName?: string;
};

export type PortalAttendanceStats = {
  studentId: string;
  studentName: string;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
};

export type PortalAttendanceDetail = {
  studentId?: string;
  studentName?: string;
  students: { id: string; name: string; className?: string }[];
  stats: PortalAttendanceStats | null;
  records: PortalAttendanceRecord[];
};

export async function fetchPortalAttendance(params?: {
  studentId?: string;
  status?: AttendanceStatus;
}): Promise<PortalAttendanceDetail> {
  const search = new URLSearchParams();
  if (params?.studentId) search.set('studentId', params.studentId);
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();
  return apiFetch<PortalAttendanceDetail>(`/api/portal/attendance${qs ? `?${qs}` : ''}`);
}
