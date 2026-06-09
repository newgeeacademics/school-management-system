import { apiFetch } from '@/lib/api';

export type PortalNotificationType = 'ABSENCE' | 'LATE' | 'GRADE' | 'EVENT' | 'PAYMENT';

export type PortalNotification = {
  id: string;
  type: PortalNotificationType;
  title: string;
  body: string;
  date?: string;
  studentName?: string;
};

export type PortalNotificationsDetail = {
  notifications: PortalNotification[];
};

export async function fetchPortalNotifications(): Promise<PortalNotificationsDetail> {
  return apiFetch<PortalNotificationsDetail>('/api/portal/notifications');
}
