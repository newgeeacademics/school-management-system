import { toast } from 'sonner';

import { toUserMessage } from '@/lib/user-errors';

/**
 * Last safety net: an error toast never shows server or browser internals
 * (stack fragments, JSON errors, status codes, config hints). Plain sentences pass unchanged.
 */
export function installSafeErrorToasts(): void {
  const showError = toast.error;
  toast.error = ((message: unknown, data?: unknown) => {
    const safe = typeof message === 'string' || message instanceof Error ? toUserMessage(message) : message;
    if (import.meta.env.DEV && safe !== message) console.warn('[toast]', message);
    return showError(safe as Parameters<typeof showError>[0], data as Parameters<typeof showError>[1]);
  }) as typeof toast.error;
}
