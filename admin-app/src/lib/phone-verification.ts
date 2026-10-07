import { useSyncExternalStore } from 'react';

import { isPhoneAuthConfigured, toInternationalPhone } from '@/lib/google-auth';

/**
 * Phone numbers proven by an SMS code during this visit (E.164, e.g. +2250700000000).
 * Creation forms only accept a phone number once it is in this list.
 */
const verified = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

export function markPhoneVerified(e164: string): void {
  verified.add(toInternationalPhone(e164));
  version += 1;
  listeners.forEach((l) => l());
}

export function isPhoneVerified(phone: string): boolean {
  return verified.has(toInternationalPhone(phone));
}

/** True when a filled number still has to be confirmed by SMS (empty numbers pass). */
export function phoneNeedsVerification(phone: string): boolean {
  if (!isPhoneAuthConfigured() || phone.replace(/\D/g, '').length < 8) return false;
  return !isPhoneVerified(phone);
}

export function usePhoneVerificationVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
  );
}
