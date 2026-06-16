import type { PortalRole } from '@/lib/auth';

export type PortalSectionId =
  | 'overview'
  | 'classes'
  | 'students'
  | 'schools'
  | 'schedule'
  | 'calendar'
  | 'grades'
  | 'presence'
  | 'absences'
  | 'notifications'
  | 'canteen'
  | 'transport'
  | 'messages'
  | 'directory'
  | 'announcements'
  | 'fees';

export const PORTAL_SECTIONS: {
  id: PortalSectionId;
  path: string;
  labelKey: string;
  descKey: string;
}[] = [
  { id: 'overview', path: '/accueil', labelKey: 'portalHome.navOverview', descKey: 'portalHome.descOverview' },
  { id: 'students', path: '/accueil/students', labelKey: 'portalHome.cardStudents', descKey: 'portalHome.descStudents' },
  { id: 'presence', path: '/accueil/presence', labelKey: 'portalHome.navPresence', descKey: 'portalHome.descPresence' },
  { id: 'absences', path: '/accueil/absences', labelKey: 'portalHome.navAbsences', descKey: 'portalHome.descAbsences' },
  { id: 'classes', path: '/accueil/classes', labelKey: 'portalHome.cardClasses', descKey: 'portalHome.descClasses' },
  { id: 'schools', path: '/accueil/schools', labelKey: 'portalHome.cardSchools', descKey: 'portalHome.descSchools' },
  { id: 'schedule', path: '/accueil/schedule', labelKey: 'portalHome.cardSchedule', descKey: 'portalHome.descSchedule' },
  { id: 'calendar', path: '/accueil/calendar', labelKey: 'portalHome.cardCalendar', descKey: 'portalHome.descCalendar' },
  { id: 'grades', path: '/accueil/grades', labelKey: 'portalHome.cardGrades', descKey: 'portalHome.descGrades' },
  { id: 'notifications', path: '/accueil/notifications', labelKey: 'portalHome.navNotifications', descKey: 'portalHome.descNotifications' },
  { id: 'canteen', path: '/accueil/canteen', labelKey: 'portalHome.cardCanteen', descKey: 'portalHome.descCanteen' },
  { id: 'transport', path: '/accueil/transport', labelKey: 'portalHome.cardTransport', descKey: 'portalHome.descTransport' },
  { id: 'messages', path: '/accueil/messages', labelKey: 'portalHome.cardMessages', descKey: 'portalHome.descMessages' },
  { id: 'directory', path: '/accueil/directory', labelKey: 'portalHome.navDirectory', descKey: 'portalHome.descDirectory' },
  { id: 'announcements', path: '/accueil/announcements', labelKey: 'portalHome.navAnnouncements', descKey: 'portalHome.descAnnouncements' },
  { id: 'fees', path: '/accueil/fees', labelKey: 'portalHome.navFees', descKey: 'portalHome.descFees' },
];

export const TEACHER_NAV_GROUPS: { labelKey: string; sectionIds: PortalSectionId[] }[] = [
  { labelKey: 'portalHome.navGroupSpace', sectionIds: ['overview', 'classes', 'students'] },
  { labelKey: 'portalHome.navGroupSchool', sectionIds: ['schedule', 'calendar', 'grades'] },
  { labelKey: 'portalHome.navGroupLife', sectionIds: ['messages', 'canteen', 'transport', 'schools'] },
];

export const PORTAL_NAV_GROUPS: { labelKey: string; sectionIds: PortalSectionId[] }[] = [
  { labelKey: 'portalHome.navGroupSpace', sectionIds: ['overview', 'classes', 'students'] },
  { labelKey: 'portalHome.navGroupSchool', sectionIds: ['schedule', 'calendar', 'grades'] },
  {
    labelKey: 'portalHome.navGroupLife',
    sectionIds: ['announcements', 'directory', 'messages', 'canteen', 'transport', 'schools'],
  },
];

export const PARENT_NAV_GROUPS: { labelKey: string; sectionIds: PortalSectionId[] }[] = [
  { labelKey: 'portalHome.navGroupChild', sectionIds: ['overview', 'students'] },
  { labelKey: 'portalHome.navGroupAttendance', sectionIds: ['presence', 'absences'] },
  { labelKey: 'portalHome.navGroupSchool', sectionIds: ['schedule', 'calendar', 'grades'] },
  { labelKey: 'portalHome.navGroupLife', sectionIds: ['announcements', 'fees', 'directory', 'notifications', 'canteen', 'transport', 'messages'] },
];

export function sectionMeta(section: PortalSectionId) {
  return PORTAL_SECTIONS.find((s) => s.id === section) ?? PORTAL_SECTIONS[0];
}

export function sectionFromPath(pathname: string): PortalSectionId {
  if (pathname.startsWith('/accueil/classes')) return 'classes';
  const match = PORTAL_SECTIONS.find((s) => s.path === pathname);
  return match?.id ?? 'overview';
}

export function pathFromSection(section: string): string {
  const match = PORTAL_SECTIONS.find((s) => s.id === section);
  return match?.path ?? '/accueil';
}

export function navGroupsForRole(role: PortalRole) {
  if (role === 'parent') return PARENT_NAV_GROUPS;
  if (role === 'teacher') return TEACHER_NAV_GROUPS;
  return PORTAL_NAV_GROUPS;
}

const PARENT_SECTIONS: PortalSectionId[] = [
  'overview',
  'students',
  'presence',
  'absences',
  'schedule',
  'calendar',
  'grades',
  'notifications',
  'canteen',
  'transport',
  'messages',
  'directory',
  'announcements',
  'fees',
];

/** Parent: child, attendance, notifications. Student: no students list. Teacher: full admin-lite nav. */
export function sectionsForRole(role: PortalRole): PortalSectionId[] {
  if (role === 'parent') return PARENT_SECTIONS;
  const ids = PORTAL_SECTIONS.map((s) => s.id).filter(
    (id) => id !== 'presence' && id !== 'absences' && id !== 'notifications'
  );
  if (role === 'student') {
    return ids.filter((id) => id !== 'students' && id !== 'classes');
  }
  return ids;
}

/** Parent-facing label for the students section. */
export function sectionLabelKey(section: PortalSectionId, role: PortalRole): string {
  if (role === 'parent' && section === 'students') return 'portalHome.navMyChild';
  return sectionMeta(section).labelKey;
}
