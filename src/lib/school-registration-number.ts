import { getCountryCodeByName } from '@/lib/location-data';

export type RegistrationNumberValidation = {
  valid: boolean;
  normalized: string;
  messageKey?: string;
};

/** OHADA / RCCM-style: CI-ABJ-2010-A-12345 */
const CI_RCCM_STRICT =
  /^CI-[A-Z]{3}-\d{4}-[A-Z0-9]{1,3}-\d{3,}$/i;

export function normalizeRegistrationNumber(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function validateRegistrationNumber(
  countryName: string,
  raw: string
): RegistrationNumberValidation {
  const normalized = normalizeRegistrationNumber(raw);
  if (!normalized) {
    return { valid: true, normalized: '' };
  }

  const code = getCountryCodeByName(countryName);

  if (code === 'CI') {
    const compact = normalized.replace(/\s/g, '');
    if (CI_RCCM_STRICT.test(compact)) {
      return { valid: true, normalized: compact };
    }
    if (/^[A-Z0-9][A-Z0-9\-/]{7,34}$/i.test(compact)) {
      return { valid: true, normalized: compact };
    }
    return { valid: false, normalized: compact, messageKey: 'school.registrationNumberInvalidCi' };
  }

  if (code === 'FR') {
    const digits = normalized.replace(/\D/g, '');
    if (digits.length === 14 || digits.length === 9) {
      return { valid: true, normalized: digits };
    }
    return { valid: false, normalized, messageKey: 'school.registrationNumberInvalidFr' };
  }

  if (normalized.length >= 6 && normalized.length <= 40) {
    return { valid: true, normalized };
  }

  return { valid: false, normalized, messageKey: 'school.registrationNumberInvalid' };
}
