import type { SectionId } from './dashboardTypes';

/** Toutes les zones gérables par l’admin (hors vue d’ensemble et la console elle-même). */
export const SYSTEM_REGISTRY_SECTIONS: {
  category: string;
  categoryHint: string;
  sections: SectionId[];
}[] = [
  {
    category: 'Configuration',
    categoryHint: 'Identité, charte, règles et conformité',
    sections: [
      'settings_profile',
      'settings_branding',
      'settings_academics',
      'settings_attendance',
      'settings_examinations',
      'settings_finance',
      'settings_communication',
      'settings_security',
      'settings_compliance',
      'settings_automation',
      'permissions',
      'billing',
    ],
  },
  {
    category: 'SIS & population',
    categoryHint: 'Dossiers, familles, accès',
    sections: ['sis', 'students', 'parents', 'classes', 'users'],
  },
  {
    category: 'Pédagogie',
    categoryHint: 'Offre, emplois du temps, évaluations',
    sections: [
      'teachers',
      'matieres',
      'courses',
      'schedule',
      'curriculum',
      'calendar',
      'rooms',
      'attendance',
      'exams',
    ],
  },
  {
    category: 'Finances & services',
    categoryHint: 'Frais, cantine, transport',
    sections: ['payments', 'canteen', 'transport'],
  },
  {
    category: 'Données & rapports',
    categoryHint: 'Synthèses et exports',
    sections: ['reports'],
  },
];
