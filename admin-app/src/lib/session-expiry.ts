import { clearAuthSession } from '@/lib/auth';

export const SESSION_EXPIRED_MESSAGE = 'Votre session a expiré. Reconnectez-vous.';

let handled = false;

/** Token rejected by the API: drop the session once and send the user back to /login. */
export function handleExpiredSession(): void {
  if (handled || typeof window === 'undefined') return;
  clearAuthSession();
  if (window.location.pathname !== '/login') {
    handled = true;
    window.location.assign('/login?expired=1');
  }
}

/** Reads a JSON body; some endpoints answer 200 with an empty body. */
export async function readJsonBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
