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

export async function registerSchoolWithAdmin(
  payload: SchoolRegistrationPayload
): Promise<{ token: string; schoolId: string; userId: string }> {
  const { credentials, school } = payload;
  const displayName = credentials.directorName || credentials.schoolName || credentials.email;

  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: displayName,
      email: credentials.email,
      password: credentials.password,
      role: 'ADMIN',
    }),
  });

  if (!registerRes.ok) {
    const errBody = await registerRes.json().catch(() => null);
    throw new Error(parseApiError(errBody, "Impossible de créer le compte administrateur."));
  }

  const auth = (await registerRes.json()) as {
    token: string;
    id: string;
  };

  const gps =
    school.gpsLat && school.gpsLng ? `${school.gpsLat},${school.gpsLng}` : undefined;

  const schoolRes = await fetch(`${BASE_URL}/api/schools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({
      name: school.schoolName,
      type: mapSchoolType(school.schoolType),
      system: school.system || undefined,
      country: school.country || undefined,
      city: school.city || undefined,
      district: school.commune || undefined,
      address: school.address || undefined,
      gps,
      mainPhone: school.phone || undefined,
      officialEmail: school.officialEmail || credentials.email,
      headName: school.directorName || undefined,
      headPhone: school.directorPhone || undefined,
      website: school.website || undefined,
      studentCount: school.studentCount ? Number(school.studentCount) : undefined,
      teacherCount: school.teacherCount ? Number(school.teacherCount) : undefined,
      series: school.series.length ? school.series.join(', ') : undefined,
      logoFileName: school.logoUrl || undefined,
    }),
  });

  if (!schoolRes.ok) {
    const errBody = await schoolRes.json().catch(() => null);
    throw new Error(parseApiError(errBody, "Compte créé, mais l'enregistrement de l'établissement a échoué."));
  }

  const created = (await schoolRes.json()) as { id: string };

  return {
    token: auth.token,
    schoolId: created.id,
    userId: auth.id,
  };
}
