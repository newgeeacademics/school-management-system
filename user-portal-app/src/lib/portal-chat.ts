import { apiFetch } from '@/lib/api';

export type PortalChatMessage = {
  id: string;
  senderUserId: string;
  senderName: string;
  senderRole: string;
  body: string;
  sentAt?: string;
};

export async function fetchPortalChatMessages(): Promise<PortalChatMessage[]> {
  const data = await apiFetch<{ messages: PortalChatMessage[] }>('/api/portal/chat/messages');
  return data.messages ?? [];
}

export async function sendPortalChatMessage(body: string): Promise<PortalChatMessage> {
  return apiFetch<PortalChatMessage>('/api/portal/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

export function chatMessageFromWs(payload: Record<string, unknown>): PortalChatMessage | null {
  if (!payload.id || !payload.body) return null;
  return {
    id: String(payload.id),
    senderUserId: String(payload.senderUserId ?? ''),
    senderName: String(payload.senderName ?? ''),
    senderRole: String(payload.senderRole ?? ''),
    body: String(payload.body),
    sentAt: payload.sentAt ? String(payload.sentAt) : undefined,
  };
}
