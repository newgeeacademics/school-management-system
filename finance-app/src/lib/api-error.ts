import { UserFacingError, messageForStatus, readServerMessage, toUserMessage } from '@/lib/user-errors';

/**
 * Message for a failed API response, safe to show: the status decides the message and the
 * server's text is kept only when it is a plain sentence about the person's input.
 */
export async function parseApiErrorResponse(res: Response, _fallback?: string): Promise<string> {
  const serverMessage = await readServerMessage(res);
  if (import.meta.env.DEV && serverMessage) console.warn(`[API ${res.status}]`, serverMessage);
  return messageForStatus(res.status, serverMessage, { login: /\/api\/auth\//.test(res.url) });
}

/** Any failure (network, unreadable response, API error) as an error whose message can be shown. */
export function wrapFetchError(err: unknown, fallback: string): Error {
  if (err instanceof UserFacingError) return err;
  if (import.meta.env.DEV) console.warn('[API]', err);
  return new UserFacingError(toUserMessage(err, fallback));
}

export function isAdminRole(role: unknown): boolean {
  return String(role ?? '').toUpperCase() === 'ADMIN';
}

export function isFinanceStaffRole(role: unknown): boolean {
  const r = String(role ?? '').toUpperCase();
  return r === 'ADMIN' || r === 'TEACHER' || r === 'STAFF';
}
