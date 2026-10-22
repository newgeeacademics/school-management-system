/**
 * Errors shown to people. Server and browser errors are never displayed as-is:
 * they are mapped to one of these plain messages. A server message is kept only
 * when it is a short, human sentence about the person's own input (e.g.
 * "Cet e-mail est déjà utilisé.") and never for server failures.
 */
export const USER_ERRORS = {
  network: 'Impossible de joindre le serveur. Vérifiez votre connexion internet puis réessayez.',
  unavailable: 'Le service redémarre ou est momentanément indisponible. Réessayez dans une minute.',
  server: 'Une erreur est survenue de notre côté. Réessayez ; si cela continue, contactez le support.',
  badResponse: 'Réponse inattendue du serveur. Actualisez la page puis réessayez.',
  sessionExpired: 'Votre session a expiré. Reconnectez-vous.',
  badCredentials: 'Identifiant ou mot de passe incorrect.',
  forbidden: 'Vous n’avez pas les droits nécessaires pour cette action.',
  notFound: 'Élément introuvable : il a peut-être été supprimé.',
  conflict: 'Cet élément existe déjà ou vient d’être modifié. Actualisez puis réessayez.',
  invalid: 'Certaines informations sont invalides. Vérifiez le formulaire.',
  tooLarge: 'Fichier trop volumineux.',
  tooMany: 'Trop de tentatives. Patientez quelques instants puis réessayez.',
  newVersion: 'Une nouvelle version de l’application est disponible. Actualisez la page.',
  unknown: 'Une erreur inattendue est survenue. Réessayez.',
} as const;

/** An error whose message is safe to show as-is. */
export class UserFacingError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'UserFacingError';
    this.status = status;
  }
}

const TECHNICAL =
  /exception|error:|java\.|org\.|springframework|hibernate|jdbc|sql|constraint|column|table|syntax|stack|nested|null|undefined|NaN|json|unexpected token|unexpected end|is not valid|failed to|could not|cannot read|is not a function|fetch|network|cors|http|https?:|vite_|render|vercel|localhost|\bport\b|\bapi\b|\b[45]\d\d\b|[{}<>[\]\\]|\w+\.\w+\(|\w+Error\b/i;

/** Server defaults are in English ("Access denied", "Bad credentials"…); people get French. */
const ENGLISH = /\b(the|access|denied|invalid|insufficient|permissions?|required|must|already|bad|credentials|not found|unauthorized|forbidden|request|failed|error|internal|server|missing)\b/i;

/** True for a short, human sentence in French (no code, URL, status code or stack fragments). */
export function isHumanMessage(message: unknown): message is string {
  if (typeof message !== 'string') return false;
  const text = message.trim();
  return text.length >= 4 && text.length <= 200 && !TECHNICAL.test(text) && !ENGLISH.test(text);
}

/** Message for an HTTP error status; `serverMessage` is used only if it is a human sentence about the input. */
export function messageForStatus(status: number, serverMessage?: unknown, opts: { login?: boolean } = {}): string {
  const human = isHumanMessage(serverMessage) ? serverMessage.trim() : null;
  if (status === 401) return opts.login ? human ?? USER_ERRORS.badCredentials : USER_ERRORS.sessionExpired;
  if (status === 400 || status === 422) return human ?? USER_ERRORS.invalid;
  if (status === 403) return human ?? USER_ERRORS.forbidden;
  if (status === 404) return human ?? USER_ERRORS.notFound;
  if (status === 409) return human ?? USER_ERRORS.conflict;
  if (status === 413) return USER_ERRORS.tooLarge;
  if (status === 429) return USER_ERRORS.tooMany;
  if (status === 502 || status === 503 || status === 504) return USER_ERRORS.unavailable;
  if (status >= 500) return USER_ERRORS.server;
  return human ?? USER_ERRORS.unknown;
}

/** Reads the server's message field (if any) from an error response. */
export async function readServerMessage(res: Response): Promise<unknown> {
  const body = await res.json().catch(() => null);
  if (!body || typeof body !== 'object') return undefined;
  const record = body as Record<string, unknown>;
  if (typeof record.error === 'string') return record.error;
  if (typeof record.message === 'string') return record.message;
  if (record.details && typeof record.details === 'object') {
    return Object.values(record.details as Record<string, unknown>).find((v) => typeof v === 'string');
  }
  return undefined;
}

/** Turns any thrown value into a message a person can understand. */
export function toUserMessage(err: unknown, fallback: string = USER_ERRORS.unknown): string {
  if (err instanceof UserFacingError) return err.message;
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (/dynamically imported module|Loading chunk|Importing a module script failed/i.test(message)) {
    return USER_ERRORS.newVersion;
  }
  if (err instanceof TypeError && /fetch|network|load failed/i.test(message)) return USER_ERRORS.network;
  if (err instanceof SyntaxError || /JSON|Unexpected token|Unexpected end/i.test(message)) return USER_ERRORS.badResponse;
  if (/network|failed to fetch|load failed/i.test(message)) return USER_ERRORS.network;
  if (isHumanMessage(message)) return message.trim();
  return isHumanMessage(fallback) ? fallback : USER_ERRORS.unknown;
}
