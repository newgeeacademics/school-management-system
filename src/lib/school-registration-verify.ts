import { BASE_URL } from '@/constants';
import { isBackendApiConfigured } from '@/lib/dashboard-backend';
import { normalizeRegistrationNumber } from '@/lib/school-registration-number';

export type RegistrationNumberAvailability = {
  available: boolean;
  message?: string;
};

export async function verifyRegistrationNumberAvailability(
  number: string
): Promise<RegistrationNumberAvailability> {
  if (!isBackendApiConfigured()) {
    return { available: true };
  }

  const normalized = normalizeRegistrationNumber(number);
  if (!normalized) {
    return { available: true };
  }

  const params = new URLSearchParams({ number: normalized });
  const res = await fetch(`${BASE_URL}/api/auth/verify-registration-number?${params}`);
  if (!res.ok) {
    return { available: false, message: 'Vérification impossible pour le moment.' };
  }

  const data = (await res.json()) as { available?: boolean; message?: string };
  return {
    available: data.available !== false,
    message: data.message,
  };
}
