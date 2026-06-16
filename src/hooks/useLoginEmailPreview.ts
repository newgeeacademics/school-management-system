import { useEffect, useState } from 'react';

import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';

export type LoginEmailRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'STAFF';

export function useLoginEmailPreview(
  firstName: string,
  lastName: string,
  role: LoginEmailRole
) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln || !BASE_URL) {
      setEmail(null);
      return;
    }

    const token =
      typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (!token) {
      setEmail(null);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ firstName: fn, lastName: ln, role });
    setLoading(true);

    void fetch(`${BASE_URL}/api/schools/login-email-preview?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('preview failed'))))
      .then((data: { email?: string }) => setEmail(data.email ?? null))
      .catch(() => setEmail(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [firstName, lastName, role]);

  return { email, loading };
}
