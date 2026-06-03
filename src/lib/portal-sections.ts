export type PortalSectionId =
  | 'overview'
  | 'classes'
  | 'students'
  | 'schools'
  | 'schedule'
  | 'grades'
  | 'canteen'
  | 'transport'
  | 'messages';

export const PORTAL_SECTIONS: {
  id: PortalSectionId;
  path: string;
  labelKey: string;
  descKey: string;
}[] = [
  { id: 'overview', path: '/accueil', labelKey: 'portalHome.navOverview', descKey: 'portalHome.descOverview' },
  { id: 'classes', path: '/accueil/classes', labelKey: 'portalHome.cardClasses', descKey: 'portalHome.descClasses' },
  { id: 'students', path: '/accueil/students', labelKey: 'portalHome.cardStudents', descKey: 'portalHome.descStudents' },
  { id: 'schools', path: '/accueil/schools', labelKey: 'portalHome.cardSchools', descKey: 'portalHome.descSchools' },
  { id: 'schedule', path: '/accueil/schedule', labelKey: 'portalHome.cardSchedule', descKey: 'portalHome.descSchedule' },
  { id: 'grades', path: '/accueil/grades', labelKey: 'portalHome.cardGrades', descKey: 'portalHome.descGrades' },
  { id: 'canteen', path: '/accueil/canteen', labelKey: 'portalHome.cardCanteen', descKey: 'portalHome.descCanteen' },
  { id: 'transport', path: '/accueil/transport', labelKey: 'portalHome.cardTransport', descKey: 'portalHome.descTransport' },
  { id: 'messages', path: '/accueil/messages', labelKey: 'portalHome.cardMessages', descKey: 'portalHome.descMessages' },
];

export const PORTAL_NAV_GROUPS: { labelKey: string; sectionIds: PortalSectionId[] }[] = [
  { labelKey: 'portalHome.navGroupSpace', sectionIds: ['overview', 'classes', 'students'] },
  { labelKey: 'portalHome.navGroupSchool', sectionIds: ['schedule', 'grades'] },
  { labelKey: 'portalHome.navGroupLife', sectionIds: ['canteen', 'transport', 'messages', 'schools'] },
];

export function sectionMeta(section: PortalSectionId) {
  return PORTAL_SECTIONS.find((s) => s.id === section) ?? PORTAL_SECTIONS[0];
}

export function sectionFromPath(pathname: string): PortalSectionId {
  const match = PORTAL_SECTIONS.find((s) => s.path === pathname);
  return match?.id ?? 'overview';
}

export function pathFromSection(section: string): string {
  const match = PORTAL_SECTIONS.find((s) => s.id === section);
  return match?.path ?? '/accueil';
}

/** Students see their class only; teachers/parents also get the students list. */
export function sectionsForRole(role: 'student' | 'parent' | 'teacher'): PortalSectionId[] {
  const ids = PORTAL_SECTIONS.map((s) => s.id);
  if (role === 'student') {
    return ids.filter((id) => id !== 'students');
  }
  return ids;
}
