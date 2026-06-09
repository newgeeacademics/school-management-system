export async function parseApiErrorResponse(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.message === 'string') return record.message;
    if (record.details && typeof record.details === 'object') {
      const first = Object.values(record.details as Record<string, string>)[0];
      if (typeof first === 'string') return first;
    }
  }

  if (res.status === 404) {
    return `API introuvable (${res.status}). Vérifiez VITE_API_URL sur Vercel admin et le déploiement Render (/health).`;
  }
  if (res.status === 403) {
    return `Accès refusé (${res.status}). Ajoutez l’URL Vercel admin dans APP_CORS_ALLOWED_ORIGINS sur Render.`;
  }
  if (res.status === 401) {
    return 'Email ou mot de passe incorrect.';
  }
  return `${fallback} (HTTP ${res.status})`;
}

export function wrapFetchError(err: unknown, fallback: string): Error {
  if (err instanceof TypeError && /fetch|network|failed/i.test(err.message)) {
    return new Error(
      'Impossible de joindre le serveur API. Vérifiez VITE_API_URL et que Render est actif.'
    );
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

export function isAdminRole(role: unknown): boolean {
  return String(role ?? '').toUpperCase() === 'ADMIN';
}

export function isFinanceStaffRole(role: unknown): boolean {
  const r = String(role ?? '').toUpperCase();
  return r === 'ADMIN' || r === 'TEACHER' || r === 'STAFF';
}
