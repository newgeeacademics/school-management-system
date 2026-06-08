import {
  DASHBOARD_SCHOOL_TYPES,
  getCourseLevelOptions,
  getLevelsForProfile,
  type DashboardSchoolType,
  type SchoolProfile,
} from '@/lib/school-profile';

/** Types d’établissement alignés sur l’inscription (Primaire, Collège, Lycée). */
export const SCHOOL_TYPES = DASHBOARD_SCHOOL_TYPES;

export type SchoolType = DashboardSchoolType;

/** Niveaux francophones par type (ivoirien / français / autre). */
export const LEVELS_BY_SCHOOL_TYPE: Record<SchoolType, string[]> = {
  Primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  Collège: ['6ème', '5ème', '4ème', '3ème'],
  Lycée: ['2nde', '1ère', 'Terminale'],
};

/** Liste plate de tous les niveaux pour un profil donné. */
export function buildClassLevelOptions(profile: SchoolProfile | null): string[] {
  if (!profile) {
    return SCHOOL_TYPES.flatMap((type) =>
      LEVELS_BY_SCHOOL_TYPE[type].map((level) => `${type} - ${level}`)
    );
  }
  return getLevelsForProfile(profile).map((level) => `${profile.type} - ${level}`);
}

export const CLASS_LEVEL_OPTIONS = buildClassLevelOptions(null);

export const COURSE_LEVEL_OPTIONS = getCourseLevelOptions(null);

export function courseLevelOptionsForProfile(profile: SchoolProfile | null): string[] {
  return getCourseLevelOptions(profile);
}

export function levelOptionsForProfile(profile: SchoolProfile | null): string[] {
  return getLevelsForProfile(profile);
}

export const DAY_OPTIONS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const TIME_SLOT_OPTIONS = [
  '8h00 – 9h00',
  '9h00 – 10h00',
  '10h15 – 11h15',
  '11h15 – 12h15',
  '14h00 – 15h00',
  '15h00 – 16h00',
  '16h00 – 17h00',
];

export const SUBJECT_OPTIONS = [
  'Mathématiques',
  'Français',
  'Histoire-Géographie',
  'Sciences',
  'SVT',
  'Physique-Chimie',
  'Anglais',
  'EPS',
  'Informatique',
  'Autre',
];

export const EVENT_TIME_PRESETS = [
  ...TIME_SLOT_OPTIONS,
  'Matinée',
  'Après-midi',
  'Toute la journée',
  'Personnalisé',
];

export const EVENT_LOCATION_PRESETS = [
  'Salle polyvalente',
  'Salle des professeurs',
  'Bureau du directeur',
  'Cour de récréation',
  'Extérieur',
  'Autre (personnalisé)',
];

export const ROOM_TYPE_OPTIONS = [
  'Salle de classe',
  'Salle de réunion',
  'Salle spécialisée',
  'Autre',
];
