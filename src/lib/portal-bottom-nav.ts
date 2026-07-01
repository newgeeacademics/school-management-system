import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Bus,
  Calendar,
  CalendarDays,
  GraduationCap,
  Home,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Phone,
  School,
  UserCircle2,
  Utensils,
  Wallet,
  CheckCircle2,
  XCircle,
  Layers,
  Grid2x2,
} from 'lucide-react';
import type { PortalRole } from '@/lib/auth';
import {
  sectionLabelKey,
  sectionsForRole,
  type PortalSectionId,
} from '@/lib/portal-sections';

export type BottomNavItem = {
  labelKey: string;
  icon: LucideIcon;
  activeIcon: LucideIcon;
  section?: PortalSectionId;
};

const PARENT_BOTTOM: BottomNavItem[] = [
  { labelKey: 'portalHome.navOverview', icon: Home, activeIcon: Home, section: 'overview' },
  { labelKey: 'portalHome.cardGrades', icon: GraduationCap, activeIcon: GraduationCap, section: 'grades' },
  { labelKey: 'portalHome.cardMessages', icon: MessageCircle, activeIcon: MessageCircle, section: 'messages' },
  { labelKey: 'portalHome.navNotifications', icon: Bell, activeIcon: Bell, section: 'notifications' },
  { labelKey: 'portalHome.navMore', icon: Grid2x2, activeIcon: Grid2x2 },
];

const TEACHER_BOTTOM: BottomNavItem[] = [
  { labelKey: 'portalHome.navOverview', icon: Home, activeIcon: Home, section: 'overview' },
  { labelKey: 'portalHome.cardClasses', icon: Layers, activeIcon: Layers, section: 'classes' },
  { labelKey: 'portalHome.cardGrades', icon: GraduationCap, activeIcon: GraduationCap, section: 'grades' },
  { labelKey: 'portalHome.cardMessages', icon: MessageCircle, activeIcon: MessageCircle, section: 'messages' },
  { labelKey: 'portalHome.navMore', icon: Grid2x2, activeIcon: Grid2x2 },
];

const STUDENT_BOTTOM: BottomNavItem[] = [
  { labelKey: 'portalHome.navOverview', icon: Home, activeIcon: Home, section: 'overview' },
  { labelKey: 'portalHome.cardSchedule', icon: CalendarDays, activeIcon: CalendarDays, section: 'schedule' },
  { labelKey: 'portalHome.cardGrades', icon: GraduationCap, activeIcon: GraduationCap, section: 'grades' },
  { labelKey: 'portalHome.cardMessages', icon: MessageCircle, activeIcon: MessageCircle, section: 'messages' },
  { labelKey: 'portalHome.navMore', icon: Grid2x2, activeIcon: Grid2x2 },
];

export function bottomNavForRole(role: PortalRole): BottomNavItem[] {
  if (role === 'parent') return PARENT_BOTTOM;
  if (role === 'teacher') return TEACHER_BOTTOM;
  return STUDENT_BOTTOM;
}

export function bottomNavIndexForSection(section: PortalSectionId, role: PortalRole): number {
  const items = bottomNavForRole(role);
  const idx = items.findIndex((item) => item.section === section);
  return idx >= 0 ? idx : items.length - 1;
}

export function moreSectionsForRole(role: PortalRole): PortalSectionId[] {
  const primary = new Set(
    bottomNavForRole(role)
      .map((item) => item.section)
      .filter((s): s is PortalSectionId => s != null),
  );
  return sectionsForRole(role).filter((id) => !primary.has(id));
}

export const SECTION_ICONS: Record<PortalSectionId, LucideIcon> = {
  overview: LayoutGrid,
  classes: Layers,
  students: UserCircle2,
  schools: School,
  schedule: CalendarDays,
  calendar: Calendar,
  grades: GraduationCap,
  presence: CheckCircle2,
  absences: XCircle,
  notifications: Bell,
  canteen: Utensils,
  transport: Bus,
  messages: MessageCircle,
  directory: Phone,
  announcements: Megaphone,
  fees: Wallet,
};

export function sectionNavLabel(section: PortalSectionId, role: PortalRole): string {
  return sectionLabelKey(section, role);
}

export function roleHasNotifications(role: PortalRole): boolean {
  return role === 'parent';
}
