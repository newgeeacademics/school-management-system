/** Types d’établissement (école). Permet de filtrer les niveaux de classe. */
export const SCHOOL_TYPES = [
  'Maternelle',
  'Primaire',
  'Collège',
  'Lycée',
  'Université',
] as const;

export type SchoolType = (typeof SCHOOL_TYPES)[number];

/** Niveaux de classe par type d’établissement (format école). */
export const LEVELS_BY_SCHOOL_TYPE: Record<SchoolType, string[]> = {
  Maternelle: ['PS', 'MS', 'GS'],
  Primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  Collège: ['6ème', '5ème', '4ème', '3ème'],
  Lycée: ['2nde', '1ère', 'Terminale'],
  Université: ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'],
};

/** Liste plate de tous les niveaux (legacy / établissement “tous types”). */
export const CLASS_LEVEL_OPTIONS = [
  'Maternelle',
  'Primaire',
  ...LEVELS_BY_SCHOOL_TYPE.Maternelle.map((l) => `Maternelle - ${l}`),
  ...LEVELS_BY_SCHOOL_TYPE.Primaire.map((l) => `Primaire - ${l}`),
  ...LEVELS_BY_SCHOOL_TYPE.Collège.map((l) => `Collège - ${l}`),
  ...LEVELS_BY_SCHOOL_TYPE.Lycée.map((l) => `Lycée - ${l}`),
  ...LEVELS_BY_SCHOOL_TYPE.Université.map((l) => `Université - ${l}`),
];

export const COURSE_LEVEL_OPTIONS = ['Primaire', 'Collège', 'Lycée', 'Supérieur'];

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

