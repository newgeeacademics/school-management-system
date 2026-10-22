import { useEffect, useState } from 'react';

import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';

export function useLoginIdPreview(firstName: string, lastName: string) {
  const [loginId, setLoginId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln || !BASE_URL) {
      setLoginId(null);
      return;
    }

    const token =
      typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (!token) {
      setLoginId(null);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ firstName: fn, lastName: ln });
    setLoading(true);

    void fetch(`${BASE_URL}/api/schools/login-id-preview?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('preview failed'))))
      .then((data: { loginId?: string }) => setLoginId(data.loginId ?? null))
      .catch(() => setLoginId(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [firstName, lastName]);

  return { loginId, loading };
}
