import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';

export const SCHOOL_PROFILE_KEY = 'classroom_school_profile';
export const LOCAL_SCHOOLS_KEY = 'newgee_local_schools';

export type RegistrationSchoolType = 'primaire' | 'college' | 'lycee';
export type SchoolSystemCode = 'ivoirien' | 'francais' | 'anglais' | 'autre';
export type DashboardSchoolType = 'Primaire' | 'Collège' | 'Lycée';

export const DASHBOARD_SCHOOL_TYPES = ['Primaire', 'Collège', 'Lycée'] as const;

export type SchoolProfile = {
  id?: string;
  name: string;
  type: DashboardSchoolType;
  typeCode: RegistrationSchoolType;
  system: SchoolSystemCode;
  country?: string;
  city?: string;
};

const TYPE_CODE_TO_DASHBOARD: Record<RegistrationSchoolType, DashboardSchoolType> = {
  primaire: 'Primaire',
  college: 'Collège',
  lycee: 'Lycée',
};

const DASHBOARD_TO_TYPE_CODE: Record<DashboardSchoolType, RegistrationSchoolType> = {
  Primaire: 'primaire',
  Collège: 'college',
  Lycée: 'lycee',
};

const RAW_TYPE_TO_CODE: Record<string, RegistrationSchoolType> = {
  primaire: 'primaire',
  PRIMAIRE: 'primaire',
  Primaire: 'primaire',
  college: 'college',
  COLLEGE: 'college',
  Collège: 'college',
  lycee: 'lycee',
  LYCEE: 'lycee',
  Lycée: 'lycee',
};

const FRANCOPHONE_LEVELS: Record<RegistrationSchoolType, string[]> = {
  primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  college: ['6ème', '5ème', '4ème', '3ème'],
  lycee: ['2nde', '1ère', 'Terminale'],
};

const ENGLISH_LEVELS: Record<RegistrationSchoolType, string[]> = {
  primaire: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'],
  college: ['Year 7', 'Year 8', 'Year 9'],
  lycee: ['Year 10', 'Year 11', 'Year 12'],
};

export const SYSTEM_LABELS_FR: Record<SchoolSystemCode, string> = {
  ivoirien: 'Système ivoirien',
  francais: 'Système français',
  anglais: 'Système anglais',
  autre: 'Autre système',
};

export const SYSTEM_LABELS_EN: Record<SchoolSystemCode, string> = {
  ivoirien: 'Ivorian system',
  francais: 'French system',
  anglais: 'English system',
  autre: 'Other system',
};

export function normalizeTypeCode(raw: string): RegistrationSchoolType | null {
  if (!raw?.trim()) return null;
  return RAW_TYPE_TO_CODE[raw.trim()] ?? null;
}

export function normalizeSystem(raw?: string): SchoolSystemCode {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'ivoirien' || value === 'francais' || value === 'anglais' || value === 'autre') {
    return value;
  }
  return 'autre';
}

export function toDashboardType(code: RegistrationSchoolType): DashboardSchoolType {
  return TYPE_CODE_TO_DASHBOARD[code];
}

export function getLevelsForProfile(profile: SchoolProfile | null): string[] {
  if (!profile) return [];
  if (profile.system === 'anglais') {
    return ENGLISH_LEVELS[profile.typeCode] ?? [];
  }
  return FRANCOPHONE_LEVELS[profile.typeCode] ?? [];
}

export function getCourseLevelOptions(profile: SchoolProfile | null): string[] {
  if (!profile) return ['Primaire', 'Collège', 'Lycée'];
  return [profile.type];
}

export function getSystemLabel(system: SchoolSystemCode, locale: 'fr' | 'en' = 'fr'): string {
  return locale === 'en' ? SYSTEM_LABELS_EN[system] : SYSTEM_LABELS_FR[system];
}

export function getSystemBadgeClass(system: SchoolSystemCode): string {
  return `dashboard-header__school-system dashboard-header__school-system--${system}`;
}

export function buildSchoolProfile(input: {
  id?: string;
  name: string;
  type: string;
  system?: string;
  country?: string;
  city?: string;
}): SchoolProfile | null {
  const typeCode = normalizeTypeCode(input.type);
  if (!typeCode || !input.name?.trim()) return null;

  return {
    id: input.id,
    name: input.name.trim(),
    type: toDashboardType(typeCode),
    typeCode,
    system: normalizeSystem(input.system),
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
  };
}

export function saveSchoolProfile(profile: SchoolProfile): void {
  localStorage.setItem(SCHOOL_PROFILE_KEY, JSON.stringify(profile));
}

export function readStoredSchoolProfile(): SchoolProfile | null {
  try {
    const raw = localStorage.getItem(SCHOOL_PROFILE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SchoolProfile> & { type?: string; system?: string };
    if (!data.name) return null;

    const savedTypeCode = data.typeCode;
    const typeCode =
      savedTypeCode === 'primaire' || savedTypeCode === 'college' || savedTypeCode === 'lycee'
        ? savedTypeCode
        : normalizeTypeCode(String(data.type ?? ''));

    if (!typeCode) return null;

    return {
      id: data.id,
      name: data.name,
      type: toDashboardType(typeCode),
      typeCode,
      system: normalizeSystem(data.system),
      country: data.country,
      city: data.city,
    };
  } catch {
    return null;
  }
}

function readProfileFromLocalSchools(schoolId?: string): SchoolProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_SCHOOLS_KEY);
    if (!raw) return null;
    const schools = JSON.parse(raw) as Array<{
      id?: string;
      name?: string;
      type?: string;
      system?: string;
      country?: string;
      city?: string;
    }>;
    if (!schools.length) return null;

    const match = schoolId
      ? schools.find((s) => s.id === schoolId) ?? schools[schools.length - 1]
      : schools[schools.length - 1];

    if (!match) return null;
    return buildSchoolProfile({
      id: match.id,
      name: match.name ?? '',
      type: match.type ?? '',
      system: match.system,
      country: match.country,
      city: match.city,
    });
  } catch {
    return null;
  }
}

export function getSchoolProfile(): SchoolProfile | null {
  const stored = readStoredSchoolProfile();
  if (stored) return stored;

  try {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? (JSON.parse(userRaw) as { schoolId?: string }) : null;
    const fromSchools = readProfileFromLocalSchools(user?.schoolId);
    if (fromSchools) {
      saveSchoolProfile(fromSchools);
      return fromSchools;
    }
  } catch {
    // ignore
  }

  return null;
}

export function persistSchoolProfileFromRegistration(args: {
  schoolId?: string;
  schoolName: string;
  schoolType: string;
  system?: string;
  country?: string;
  city?: string;
}): SchoolProfile | null {
  const profile = buildSchoolProfile({
    id: args.schoolId,
    name: args.schoolName,
    type: args.schoolType,
    system: args.system,
    country: args.country,
    city: args.city,
  });
  if (profile) saveSchoolProfile(profile);
  return profile;
}

export async function fetchAndCacheSchoolProfile(schoolId: string): Promise<SchoolProfile | null> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token || !schoolId) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/schools/${schoolId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const row = (await res.json()) as Record<string, unknown>;
    const profile = buildSchoolProfile({
      id: String(row.id ?? schoolId),
      name: String(row.name ?? ''),
      type: String(row.type ?? ''),
      system: String(row.system ?? ''),
      country: String(row.country ?? ''),
      city: String(row.city ?? ''),
    });
    if (profile) saveSchoolProfile(profile);
    return profile;
  } catch {
    return null;
  }
}

export function schoolTypesFromProfile(profile: SchoolProfile | null): DashboardSchoolType[] {
  if (profile) return [profile.type];
  return [...DASHBOARD_SCHOOL_TYPES];
}

export { DASHBOARD_TO_TYPE_CODE };
