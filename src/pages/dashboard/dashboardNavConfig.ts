import type { LucideIcon } from 'lucide-react';
import {
  BarChart2,
  BookMarked,
  BookOpen,
  Building2,
  Calendar,
  Car,
  CheckSquare,
  ClipboardList,
  Cog,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Megaphone,
  Receipt,
  School,
  Settings2,
  Shield,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

import type { UserRole } from '@/lib/auth';
import type { SectionId } from './dashboardTypes';

export type NavItem = { id: SectionId; label: string; icon: LucideIcon; tooltip?: string };

export type NavGroup = { label: string; items: NavItem[] };

export const ADMIN_SECTION_IDS: SectionId[] = [
  'overview',
  'system_registry',
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
  'teachers',
  'sis',
  'students',
  'parents',
  'classes',
  'matieres',
  'courses',
  'schedule',
  'curriculum',
  'attendance',
  'exams',
  'payments',
  'fee_schedules',
  'announcements',
  'users',
  'permissions',
  'billing',
  'calendar',
  'rooms',
  'canteen',
  'transport',
  'reports',
];

const adminNav: NavGroup[] = [
  {
    label: 'Général',
    items: [
      { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'system_registry', label: 'Console système', icon: Layers },
      { id: 'teachers', label: 'Espace enseignants', icon: GraduationCap },
    ],
  },
  {
    label: 'SIS',
    items: [
      { id: 'sis', label: 'Vue d’ensemble SIS', icon: School },
      { id: 'students', label: 'Élèves', icon: Users },
      { id: 'parents', label: 'Parents', icon: Users },
      { id: 'classes', label: 'Classes', icon: School },
    ],
  },
  {
    label: 'Pédagogie',
    items: [
      { id: 'matieres', label: 'Matières', icon: BookMarked },
      { id: 'courses', label: 'Cours', icon: BookOpen },
      { id: 'schedule', label: 'Emploi du temps', icon: Calendar },
      { id: 'curriculum', label: 'Programmes', icon: ClipboardList },
    ],
  },
  {
    label: 'Exploitation',
    items: [
      { id: 'attendance', label: 'Présences', icon: CheckSquare },
      { id: 'exams', label: 'Examens', icon: BarChart2 },
      { id: 'payments', label: 'Finances', icon: Wallet },
      { id: 'fee_schedules', label: 'Échéanciers', icon: Receipt },
      { id: 'announcements', label: 'Annonces', icon: Megaphone },
    ],
  },
  {
    label: 'Accès',
    items: [
      { id: 'users', label: 'Utilisateurs', icon: Shield },
      { id: 'permissions', label: 'Droits', icon: ShieldCheck },
    ],
  },
  {
    label: 'Paramètres',
    items: [
      { id: 'settings_profile', label: 'Profil établissement', icon: Settings2 },
      { id: 'settings_branding', label: 'Image & apparence', icon: Cog },
      { id: 'settings_academics', label: 'Pédagogie', icon: BookOpen },
      { id: 'settings_attendance', label: 'Présences', icon: CheckSquare },
      { id: 'settings_examinations', label: 'Examens & notes', icon: BarChart2 },
      { id: 'settings_finance', label: 'Finances', icon: Wallet },
      { id: 'settings_communication', label: 'Communication', icon: Megaphone },
      { id: 'settings_security', label: 'Sécurité', icon: Shield },
      { id: 'settings_compliance', label: 'Conformité', icon: ShieldCheck },
      { id: 'settings_automation', label: 'Automatisation', icon: Cog },
      { id: 'billing', label: 'Facturation', icon: Receipt },
    ],
  },
  {
    label: 'Campus',
    items: [
      { id: 'calendar', label: 'Calendrier', icon: Calendar },
      { id: 'rooms', label: 'Salles', icon: Building2 },
      { id: 'canteen', label: 'Cantine', icon: Utensils },
      { id: 'transport', label: 'Transport', icon: Car },
      { id: 'reports', label: 'Rapports', icon: BarChart2 },
    ],
  },
];

const teacherNav: NavGroup[] = [
  {
    label: 'Général',
    items: [{ id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap }],
  },
  {
    label: 'Enseignement',
    items: [
      { id: 'classes', label: 'Mes classes', icon: School },
      { id: 'grades', label: 'Notes & bulletins', icon: BarChart2 },
      { id: 'attendance', label: 'Présences', icon: CheckSquare },
    ],
  },
  {
    label: 'Planning',
    items: [
      { id: 'schedule', label: 'Emploi du temps', icon: Calendar },
      { id: 'calendar', label: 'Calendrier', icon: Calendar },
    ],
  },
];

const parentNav: NavGroup[] = [
  {
    label: 'Général',
    items: [{ id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap }],
  },
  {
    label: 'Famille',
    items: [{ id: 'students', label: 'Suivi scolaire', icon: Users }],
  },
  {
    label: 'Vie scolaire',
    items: [
      { id: 'canteen', label: 'Cantine', icon: Utensils },
      { id: 'transport', label: 'Transport', icon: Car },
      { id: 'schedule', label: 'Emplois du temps', icon: Calendar },
      { id: 'calendar', label: 'Événements', icon: Calendar },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { id: 'payments', label: 'Paiements', icon: Wallet },
      { id: 'reports', label: 'Rapports', icon: BarChart2 },
    ],
  },
];

const studentNav: NavGroup[] = [
  {
    label: 'Général',
    items: [{ id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap }],
  },
  {
    label: 'Scolarité',
    items: [
      { id: 'schedule', label: 'Mon emploi du temps', icon: Calendar },
      { id: 'courses', label: 'Mes cours', icon: BookOpen },
    ],
  },
  {
    label: 'Campus',
    items: [
      { id: 'canteen', label: 'Cantine', icon: Utensils },
      { id: 'transport', label: 'Transport', icon: Car },
      { id: 'calendar', label: 'Calendrier', icon: Calendar },
    ],
  },
];

const staffNav: NavGroup[] = [
  {
    label: 'Général',
    items: [{ id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap }],
  },
  {
    label: 'Finances',
    items: [
      { id: 'payments', label: 'Paiements', icon: Wallet },
      { id: 'fee_schedules', label: 'Échéanciers', icon: Receipt },
      { id: 'reports', label: 'Rapports', icon: BarChart2 },
    ],
  },
];

export const dashboardNavByRole: Record<UserRole, NavGroup[]> = {
  admin: adminNav,
  teacher: teacherNav,
  parent: parentNav,
  student: studentNav,
  staff: staffNav,
};

export function getDashboardSectionIds(role: UserRole): SectionId[] {
  const ids: SectionId[] = [];
  for (const group of dashboardNavByRole[role] ?? []) {
    for (const item of group.items) {
      ids.push(item.id);
    }
  }
  return ids;
}
