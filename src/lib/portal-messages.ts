import { apiFetch } from '@/lib/api';

export type PortalMessage = {
  id: string;
  subject: string;
  body: string;
  senderName: string;
  sentAt?: string;
  className?: string;
};

export async function fetchPortalMessages() {
  const data = await apiFetch<{ messages: PortalMessage[] }>('/api/portal/messages');
  return data.messages ?? [];
}

export async function sendTeacherClassMessage(item: {
  classId: string;
  subject: string;
  body: string;
}) {
  return apiFetch<{
    recipientsCount: number;
    emailsSent: number;
    message?: string;
  }>('/api/portal/messages/parents', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}
