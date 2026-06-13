import { BASE_URL } from '@/constants';
import { parseApiErrorResponse, wrapFetchError } from '@/lib/api-error';

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
    gradingScale?: string;
    evaluationTypes?: string[];
    registrationNumber?: string;
    languagesOffered?: string[];
    logoUrl: string;
  };
};

export function isBackendApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

const SCHOOL_TYPE_MAP: Record<string, string> = {
  primaire: 'PRIMAIRE',
  college: 'COLLEGE',
  lycee: 'LYCEE',
};

function mapSchoolType(value: string): string | undefined {
  if (!value) return undefined;
  return SCHOOL_TYPE_MAP[value];
}

function buildSchoolBody(school: SchoolRegistrationPayload['school'], email: string) {
  const gps =
    school.gpsLat && school.gpsLng ? `${school.gpsLat},${school.gpsLng}` : undefined;

  return {
    name: school.schoolName.trim(),
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
    gradingScale: school.gradingScale ? Number(school.gradingScale) : 20,
    evaluationTypes: school.evaluationTypes?.length
      ? school.evaluationTypes.join(', ')
      : 'Devoir,Interro,Examen',
    evaluationPeriods: 'Trimestre 1,Trimestre 2,Trimestre 3',
    registrationNumber: school.registrationNumber?.trim() || undefined,
    languagesOffered: school.languagesOffered?.length
      ? school.languagesOffered.join(', ')
      : undefined,
    logoFileName: school.logoUrl || undefined,
  };
}

export async function registerSchoolWithAdmin(
  payload: SchoolRegistrationPayload
): Promise<{ token: string; schoolId: string; userId: string }> {
  const { credentials, school } = payload;
  const displayName = credentials.directorName || credentials.schoolName || credentials.email;

  try {
    const registerRes = await fetch(`${BASE_URL}/api/auth/register-school`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: displayName,
        email: credentials.email.trim(),
        password: credentials.password,
        school: buildSchoolBody(school, credentials.email),
      }),
    });

    if (!registerRes.ok) {
      throw new Error(
        await parseApiErrorResponse(registerRes, "Impossible d'enregistrer l'établissement.")
      );
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
  } catch (err) {
    throw wrapFetchError(err, "Impossible d'enregistrer l'établissement.");
  }
}
