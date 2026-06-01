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
}[] = [
  { id: 'overview', path: '/accueil', labelKey: 'portalHome.navOverview' },
  { id: 'classes', path: '/accueil/classes', labelKey: 'portalHome.cardClasses' },
  { id: 'students', path: '/accueil/students', labelKey: 'portalHome.cardStudents' },
  { id: 'schools', path: '/accueil/schools', labelKey: 'portalHome.cardSchools' },
  { id: 'schedule', path: '/accueil/schedule', labelKey: 'portalHome.cardSchedule' },
  { id: 'grades', path: '/accueil/grades', labelKey: 'portalHome.cardGrades' },
  { id: 'canteen', path: '/accueil/canteen', labelKey: 'portalHome.cardCanteen' },
  { id: 'transport', path: '/accueil/transport', labelKey: 'portalHome.cardTransport' },
  { id: 'messages', path: '/accueil/messages', labelKey: 'portalHome.cardMessages' },
];

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
