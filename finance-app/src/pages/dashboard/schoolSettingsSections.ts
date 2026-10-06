import type { SectionId } from './dashboardTypes';

export const SCHOOL_SETTINGS_IDS = [
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
] as const satisfies readonly SectionId[];

export function isSchoolSettingsSection(id: SectionId): id is (typeof SCHOOL_SETTINGS_IDS)[number] {
  return (SCHOOL_SETTINGS_IDS as readonly string[]).includes(id);
}
