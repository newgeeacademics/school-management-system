import { apiFetch } from '@/lib/api';

export type PortalAnnouncement = {
  id: string;
  title: string;
  body: string;
  eventDate?: string;
  location?: string;
  published: boolean;
  publishedAt: string;
};

export async function fetchPortalAnnouncements(): Promise<PortalAnnouncement[]> {
  return apiFetch<PortalAnnouncement[]>('/api/portal/announcements');
}
