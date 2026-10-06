import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';

export const SCHOOL_PROFILE_KEY = 'classroom_school_profile';
export const LOCAL_SCHOOLS_KEY = 'newgee_local_schools';

/** One teaching cycle. */
export type CycleCode = 'primaire' | 'college' | 'lycee';
/** Establishment type: a single cycle or several cycles on one campus (e.g. collège + lycée). */
export type RegistrationSchoolType =
  | CycleCode
  | 'primaire_college'
  | 'college_lycee'
  | 'primaire_college_lycee';
export type SchoolSystemCode = 'ivoirien' | 'francais' | 'anglais' | 'autre';
export type DashboardSchoolType = 'Primaire' | 'Collège' | 'Lycée';

export const DASHBOARD_SCHOOL_TYPES = ['Primaire', 'Collège', 'Lycée'] as const;

export type SchoolProfile = {
  id?: string;
  name: string;
  /** Display label, e.g. "Collège" or "Collège & Lycée". */
  type: string;
  typeCode: RegistrationSchoolType;
  /** Cycles taught, in school order. */
  cycles: CycleCode[];
  system: SchoolSystemCode;
  country?: string;
  city?: string;
  studentCount?: number | null;
  teacherCount?: number | null;
  series?: string[];
};

const CYCLE_ORDER: CycleCode[] = ['primaire', 'college', 'lycee'];

const TYPE_CODE_TO_DASHBOARD: Record<CycleCode, DashboardSchoolType> = {
  primaire: 'Primaire',
  college: 'Collège',
  lycee: 'Lycée',
};

const DASHBOARD_TO_TYPE_CODE: Record<DashboardSchoolType, CycleCode> = {
  Primaire: 'primaire',
  Collège: 'college',
  Lycée: 'lycee',
};

/** Backend SchoolType enum value for each establishment type. */
export const SCHOOL_TYPE_API_VALUES: Record<RegistrationSchoolType, string> = {
  primaire: 'PRIMAIRE',
  college: 'COLLEGE',
  lycee: 'LYCEE',
  primaire_college: 'PRIMAIRE_COLLEGE',
  college_lycee: 'COLLEGE_LYCEE',
  primaire_college_lycee: 'PRIMAIRE_COLLEGE_LYCEE',
};

const REGISTRATION_TYPE_CODES = Object.keys(SCHOOL_TYPE_API_VALUES) as RegistrationSchoolType[];

export function cyclesForTypeCode(code: RegistrationSchoolType): CycleCode[] {
  return CYCLE_ORDER.filter((cycle) => code.split('_').includes(cycle));
}

export function typeCodeIncludes(code: string, cycle: CycleCode): boolean {
  return code.split('_').includes(cycle);
}

const FRANCOPHONE_LEVELS: Record<CycleCode, string[]> = {
  primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  college: ['6ème', '5ème', '4ème', '3ème'],
  lycee: ['2nde', '1ère', 'Terminale'],
};

const ENGLISH_LEVELS: Record<CycleCode, string[]> = {
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
  const value = raw
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return REGISTRATION_TYPE_CODES.includes(value as RegistrationSchoolType)
    ? (value as RegistrationSchoolType)
    : null;
}

export function normalizeSystem(raw?: string): SchoolSystemCode {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'ivoirien' || value === 'francais' || value === 'anglais' || value === 'autre') {
    return value;
  }
  return 'autre';
}

export function toDashboardType(code: CycleCode): DashboardSchoolType {
  return TYPE_CODE_TO_DASHBOARD[code];
}

/** "Collège", or "Collège & Lycée" for a multi-cycle establishment. */
export function schoolTypeLabel(code: RegistrationSchoolType): string {
  return cyclesForTypeCode(code).map(toDashboardType).join(' & ');
}

function levelsForCycle(system: SchoolSystemCode, cycle: CycleCode): string[] {
  return (system === 'anglais' ? ENGLISH_LEVELS : FRANCOPHONE_LEVELS)[cycle] ?? [];
}

/** All class levels of the establishment, every cycle included, in school order. */
export function getLevelsForProfile(profile: SchoolProfile | null): string[] {
  if (!profile) return [];
  return profile.cycles.flatMap((cycle) => levelsForCycle(profile.system, cycle));
}

/** Cycle a level belongs to (e.g. "2nde" → "Lycée"), for multi-cycle schools. */
export function cycleForLevel(profile: SchoolProfile | null, level: string): DashboardSchoolType | null {
  if (!profile || !level) return null;
  const cycle = profile.cycles.find((c) => levelsForCycle(profile.system, c).includes(level));
  return cycle ? toDashboardType(cycle) : null;
}

export function getCourseLevelOptions(profile: SchoolProfile | null): string[] {
  if (!profile) return ['Primaire', 'Collège', 'Lycée'];
  return profile.cycles.map(toDashboardType);
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
  studentCount?: number | null;
  teacherCount?: number | null;
  series?: string[];
}): SchoolProfile | null {
  const typeCode = normalizeTypeCode(input.type);
  if (!typeCode || !input.name?.trim()) return null;

  return {
    id: input.id,
    name: input.name.trim(),
    type: schoolTypeLabel(typeCode),
    typeCode,
    cycles: cyclesForTypeCode(typeCode),
    system: normalizeSystem(input.system),
    country: input.country?.trim() || undefined,
    city: input.city?.trim() || undefined,
    studentCount: input.studentCount ?? null,
    teacherCount: input.teacherCount ?? null,
    series: input.series?.length ? input.series : undefined,
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

    const typeCode =
      normalizeTypeCode(String(data.typeCode ?? '')) ?? normalizeTypeCode(String(data.type ?? ''));

    if (!typeCode) return null;

    return {
      id: data.id,
      name: data.name,
      type: schoolTypeLabel(typeCode),
      typeCode,
      cycles: cyclesForTypeCode(typeCode),
      system: normalizeSystem(data.system),
      country: data.country,
      city: data.city,
      studentCount: typeof data.studentCount === 'number' ? data.studentCount : null,
      teacherCount: typeof data.teacherCount === 'number' ? data.teacherCount : null,
      series: Array.isArray(data.series) ? data.series : undefined,
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
  studentCount?: number | null;
  teacherCount?: number | null;
  series?: string[];
}): SchoolProfile | null {
  const profile = buildSchoolProfile({
    id: args.schoolId,
    name: args.schoolName,
    type: args.schoolType,
    system: args.system,
    country: args.country,
    city: args.city,
    studentCount: args.studentCount ?? null,
    teacherCount: args.teacherCount ?? null,
    series: args.series,
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
    const seriesRaw = row.series;
    const series =
      typeof seriesRaw === 'string' && seriesRaw.trim()
        ? seriesRaw.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
        : undefined;

    const profile = buildSchoolProfile({
      id: String(row.id ?? schoolId),
      name: String(row.name ?? ''),
      type: String(row.type ?? ''),
      system: String(row.system ?? ''),
      country: String(row.country ?? ''),
      city: String(row.city ?? ''),
      studentCount: row.studentCount != null ? Number(row.studentCount) : null,
      teacherCount: row.teacherCount != null ? Number(row.teacherCount) : null,
      series,
    });
    if (profile) saveSchoolProfile(profile);
    return profile;
  } catch {
    return null;
  }
}

export function schoolTypesFromProfile(profile: SchoolProfile | null): DashboardSchoolType[] {
  if (profile) return profile.cycles.map(toDashboardType);
  return [...DASHBOARD_SCHOOL_TYPES];
}

export { DASHBOARD_TO_TYPE_CODE };
