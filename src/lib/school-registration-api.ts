import { BASE_URL } from '@/constants';

export type SchoolRegistrationPayload = {
  credentials: {
    email: string;
    password: string;
    username: string;
    directorName: string;
    schoolName: string;
  };
  school: {
    schoolName: string;
    schoolType: string;
    system: string;
    country: string;
    city: string;
    commune: string;
    address: string;
    gpsLat: string;
    gpsLng: string;
    phone: string;
    officialEmail: string;
    directorName: string;
    directorPhone: string;
    website: string;
    studentCount: string;
    teacherCount: string;
    series: string[];
    logoUrl: string;
  };
};

export function isBackendApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

const SCHOOL_TYPE_MAP: Record<string, string> = {
  maternelle: 'MATERNELLE',
  primaire: 'PRIMAIRE',
  secondaire: 'LYCEE',
  universite: 'UNIVERSITE',
  centre_formation: 'COLLEGE',
};

function mapSchoolType(value: string): string | undefined {
  if (!value || value === 'autre') return undefined;
  return SCHOOL_TYPE_MAP[value];
}

function parseApiError(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.error === 'string') return record.error;
    if (record.details && typeof record.details === 'object') {
      const first = Object.values(record.details as Record<string, string>)[0];
      if (typeof first === 'string') return first;
    }
  }
  return fallback;
}

function buildSchoolBody(school: SchoolRegistrationPayload['school'], email: string) {
  const gps =
    school.gpsLat && school.gpsLng ? `${school.gpsLat},${school.gpsLng}` : undefined;

  return {
    name: school.schoolName,
    type: mapSchoolType(school.schoolType),
    system: school.system || undefined,
    country: school.country || undefined,
    city: school.city || undefined,
    district: school.commune || undefined,
    address: school.address || undefined,
    gps,
    mainPhone: school.phone || undefined,
    officialEmail: school.officialEmail || email,
    headName: school.directorName || undefined,
    headPhone: school.directorPhone || undefined,
    website: school.website || undefined,
    studentCount: school.studentCount ? Number(school.studentCount) : undefined,
    teacherCount: school.teacherCount ? Number(school.teacherCount) : undefined,
    series: school.series.length ? school.series.join(', ') : undefined,
    logoFileName: school.logoUrl || undefined,
  };
}

export async function registerSchoolWithAdmin(
  payload: SchoolRegistrationPayload
): Promise<{ token: string; schoolId: string; userId: string }> {
  const { credentials, school } = payload;
  const displayName = credentials.directorName || credentials.schoolName || credentials.email;

  const registerRes = await fetch(`${BASE_URL}/api/auth/register-school`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: displayName,
      email: credentials.email,
      password: credentials.password,
      school: buildSchoolBody(school, credentials.email),
    }),
  });

  if (!registerRes.ok) {
    const errBody = await registerRes.json().catch(() => null);
    const statusHint =
      registerRes.status === 403
        ? ' Accès refusé — vérifiez APP_CORS_ALLOWED_ORIGINS sur Render (URL Vercel du site principal).'
        : '';
    throw new Error(parseApiError(errBody, "Impossible d'enregistrer l'établissement.") + statusHint);
  }

  const auth = (await registerRes.json()) as {
    token: string;
    id: string;
    schoolId?: string;
  };

  if (!auth.schoolId) {
    throw new Error("Compte créé, mais l'identifiant de l'établissement est manquant.");
  }

  return {
    token: auth.token,
    schoolId: auth.schoolId,
    userId: auth.id,
  };
}
