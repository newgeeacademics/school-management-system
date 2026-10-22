import { useSyncExternalStore } from 'react';

import { isPhoneAuthConfigured } from '@/lib/google-auth';
import { formatPhoneWithCountry, isValidLocalPhone } from '@/lib/location-data';

/**
 * Phone numbers proven by an SMS code during this visit (E.164, e.g. +2250700000000).
 * Creation forms only accept a phone number once it is in this list.
 */
const verified = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function normalize(e164: string): string {
  return e164.replace(/[^0-9+]/g, '');
}

export function markPhoneVerified(e164: string): void {
  verified.add(normalize(e164));
  version += 1;
  listeners.forEach((l) => l());
}

export function isPhoneVerified(e164: string): boolean {
  return verified.has(normalize(e164));
}

/** SMS verification is on whenever Firebase phone sign-in is configured. */
export function isPhoneVerificationEnabled(): boolean {
  return isPhoneAuthConfigured();
}

/** True when a filled, valid number still has to be confirmed by SMS (empty optional numbers pass). */
export function phoneNeedsVerification(countryName: string, localNumber: string): boolean {
  if (!isPhoneVerificationEnabled() || !localNumber.trim()) return false;
  if (!isValidLocalPhone(countryName, localNumber)) return false;
  return !isPhoneVerified(formatPhoneWithCountry(countryName, localNumber));
}

/** Re-render when a number gets verified (put the value in hook/callback deps). */
export function usePhoneVerificationVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
  );
}
