import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  BookMarked,
  BookOpen,
  Calendar,
  Car,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  Cog,
  GraduationCap,
  LayoutDashboard,
  Layers,
  MoreHorizontal,
  Receipt,
  School,
  Shield,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

import { ACCESS_TOKEN_KEY } from '@/constants';
import {
  clearAuthSession,
  getStoredRole,
  getStoredUser,
  getStoredStudentId,
  setStoredStudentId,
  type UserRole,
} from '@/lib/auth';
import {
  createAttendanceOnBackend,
  createCourseOnBackend,
  createCanteenOnBackend,
  createClassOnBackend,
  createEvaluationOnBackend,
  createEventOnBackend,
  createMatiereOnBackend,
  createOrUpdateGradeOnBackend,
  createParentOnBackend,
  createAnnouncementOnBackend,
  createFeeInstallmentOnBackend,
  createPaymentReceiptOnBackend,
  createPaymentReminderOnBackend,
  createRoomOnBackend,
  createScheduleOnBackend,
  createStudentOnBackend,
  createTeacherOnBackend,
  createTransportOnBackend,
  createUserOnBackend,
  deleteAnnouncementOnBackend,
  fetchCommunicationStatusOnBackend,
  sendParentMessageOnBackend,
  deleteClassOnBackend,
  deleteFeeInstallmentOnBackend,
  deleteParentOnBackend,
  deleteStudentOnBackend,
  deleteTeacherOnBackend,
  deleteUserOnBackend,
  fetchStudentIdCardOnBackend,
  isBackendApiConfigured,
  loadDashboardFromBackend,
  refreshUsersFromBackend,
  updateAnnouncementOnBackend,
  updateFeeInstallmentOnBackend,
  updateAttendanceOnBackend,
  updateClassOnBackend,
  updateParentOnBackend,
  updateStudentOnBackend,
  updateTeacherOnBackend,
  updateTransportStudentsOnBackend,
  updateUserOnBackend,
} from '@/lib/dashboard-backend';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { UserPortalSidebarLink } from '@/components/UserPortalSidebarLink';

import {
  fetchAndCacheSchoolProfile,
  getSchoolProfile,
  getSystemBadgeClass,
  getSystemLabel,
  schoolTypesFromProfile,
  type SchoolProfile,
} from '@/lib/school-profile';

import {
  courseLevelOptionsForProfile,
  DAY_OPTIONS,
  EVENT_LOCATION_PRESETS,
  EVENT_TIME_PRESETS,
  levelOptionsForProfile,
  ROOM_TYPE_OPTIONS,
  SUBJECT_OPTIONS,
  TIME_SLOT_OPTIONS,
  type SchoolType,
} from './dashboard/dashboardConstants';
import {
  type AppUser,
  type AttendanceRecord,
  type CalendarEvent,
  type CanteenMenuItem,
  type ClassItem,
  type Course,
  type Matiere,
  type Evaluation,
  type Announcement,
  type FeeInstallment,
  type NewAnnouncementFormState,
  type NewParentMessageFormState,
  type NewEvaluationFormState,
  type NewFeeInstallmentFormState,
  type NewCanteenItemFormState,
  type StudentIdCardData,
  type NewClassFormState,
  type NewCourseFormState,
  type NewMatiereFormState,
  type NewEventFormState,
  type NewParentFormState,
  type NewPaymentReceiptFormState,
  type NewPaymentReminderFormState,
  type NewRoomFormState,
  type NewSlotFormState,
  type NewStudentFormState,
  type NewTeacherFormState,
  type NewTransportRouteFormState,
  type NewUserFormState,
  type AppUserRole,
  type ParentContact,
  type PaymentReceipt,
  type PaymentReminder,
  type Room,
  type ScheduleItem,
  type SectionId,
  type Student,
  type StudentGrade,
  type Teacher,
  type TransportRoute,
} from './dashboard/dashboardTypes';
import { CommunicationsSection } from './dashboard/CommunicationsSection';
import { CalendarSection } from './dashboard/CalendarSection';
import { FeeSchedulesSection } from './dashboard/FeeSchedulesSection';
import { StudentIdCardModal } from './dashboard/StudentIdCardModal';
import { CanteenSection } from './dashboard/CanteenSection';
import { ClassesSection } from './dashboard/ClassesSection';
import { CoursesSection } from './dashboard/CoursesSection';
import { MatieresSection } from './dashboard/MatieresSection';
import { OverviewSection } from './dashboard/OverviewSection';
import { ParentsSection } from './dashboard/ParentsSection';
import { PaymentsSection } from './dashboard/PaymentsSection';
import { AttendanceSection } from './dashboard/AttendanceSection';
import { RoomsSection } from './dashboard/RoomsSection';
import { ScheduleSection } from './dashboard/ScheduleSection';
import { StudentsSection } from './dashboard/StudentsSection';
import { TeachersSection } from './dashboard/TeachersSection';
import { TransportSection } from './dashboard/TransportSection';
import { ReportsSection } from './dashboard/ReportsSection';
import { PermissionsSection } from './dashboard/PermissionsSection';
import { UsersSection } from './dashboard/UsersSection';
import { GradesSection } from './dashboard/GradesSection';
import { isSchoolSettingsSection, SchoolSettingsContent } from './dashboard/SchoolSettingsPanels';
import { SystemRegistrySection } from './dashboard/SystemRegistrySection';
import { AppLogo } from '@/components/AppLogo';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';

import './dashboard-shell.css';

/** Every section an admin account can open (used for active-tab validation). */
const ADMIN_SECTION_IDS: SectionId[] = [
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

const roleNavItems: Record<UserRole, { id: SectionId; label: string; icon: React.ComponentType<any> }[]> = {
  admin: ADMIN_SECTION_IDS.map((id) => ({ id, label: '', icon: GraduationCap })),
  teacher: [
    { id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap },
    { id: 'classes', label: 'Mes classes', icon: Users },
    { id: 'grades', label: 'Notes & bulletins', icon: BarChart2 },
    { id: 'attendance', label: 'Présences', icon: CheckSquare },
    { id: 'schedule', label: 'Emploi du temps', icon: ClipboardList },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
  ],
  parent: [
    { id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap },
    { id: 'students', label: 'Mes enfants', icon: Users },
    { id: 'canteen', label: 'Cantine', icon: Utensils },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'payments', label: 'Paiements', icon: Wallet },
    { id: 'schedule', label: 'Emplois du temps', icon: ClipboardList },
    { id: 'calendar', label: 'Événements', icon: Calendar },
    { id: 'reports', label: 'Rapports', icon: BarChart2 },
  ],
  student: [
    { id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap },
    { id: 'schedule', label: 'Mon emploi du temps', icon: ClipboardList },
    { id: 'courses', label: 'Mes cours', icon: BookOpen },
    { id: 'canteen', label: 'Cantine', icon: Utensils },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
  ],
  staff: [
    { id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap },
    { id: 'payments', label: 'Paiements', icon: Wallet },
    { id: 'fee_schedules', label: 'Échéanciers', icon: Calendar },
    { id: 'reports', label: 'Rapports', icon: BarChart2 },
  ],
};

const roleTitles: Record<UserRole, string> = {
  admin: 'Tableau de bord',
  teacher: 'Espace enseignant',
  parent: 'Espace parent',
  student: 'Espace élève',
  staff: 'Espace personnel',
};

const sectionConfig: Record<
  SectionId,
  { kicker: string; title: string; description: string; cta: string }
> = {
  overview: {
    kicker: 'Vue d’ensemble',
    title: 'Tableau de bord établissement',
    description:
      "Surveillez rapidement l’activité de votre établissement : classes, enseignants et élèves.",
    cta: '',
  },
  system_registry: {
    kicker: 'Supervision',
    title: 'Console système',
    description:
      'Répertoire complet : accédez à chaque module, paramètre et jeu de données pour les consulter ou les modifier.',
    cta: '',
  },
  classes: {
    kicker: 'Pilotage des classes',
    title: 'Organisation des classes',
    description:
      'Visualisez vos niveaux, les effectifs et les professeurs principaux pour chaque classe.',
    cta: '',
  },
  teachers: {
    kicker: 'Équipe pédagogique',
    title: 'Enseignants et responsabilités',
    description:
      "Gardez une vue claire sur l’équipe pédagogique, leurs matières et leurs classes.",
    cta: 'Inviter un enseignant',
  },
  students: {
    kicker: 'Suivi des élèves',
    title: 'Liste des élèves',
    description:
      'Centralisez les élèves par classe pour préparer la suite (notes, absences, etc.).',
    cta: 'Ajouter un élève',
  },
  parents: {
    kicker: 'Responsables légaux',
    title: 'Parents / tuteurs',
    description:
      'Référencez les parents ou tuteurs légaux associés aux élèves de votre établissement.',
    cta: 'Ajouter un parent',
  },
  courses: {
    kicker: 'Structure pédagogique',
    title: 'Cours et matières',
    description:
      'Définissez les cours qui seront utilisés dans l’emploi du temps et les bulletins.',
    cta: 'Créer un cours',
  },
  matieres: {
    kicker: 'Enseignement',
    title: 'Matières',
    description:
      'Créez et gérez les matières enseignées (mathématiques, français, etc.).',
    cta: 'Créer une matière',
  },
  rooms: {
    kicker: 'Salles et espaces',
    title: 'Salles de classe et de réunion',
    description:
      'Référencez les salles de votre établissement pour les emplois du temps et les évènements.',
    cta: 'Ajouter une salle',
  },
  calendar: {
    kicker: 'Calendrier scolaire',
    title: 'Évènements et promotions',
    description:
      'Suivez les conseils de classe, promotions de niveau, réunions et autres événements clés.',
    cta: 'Ajouter un évènement',
  },
  schedule: {
    kicker: 'Organisation hebdomadaire',
    title: 'Emploi du temps des classes',
    description:
      'Préparez un premier aperçu de l’emploi du temps par classe et par cours.',
    cta: 'Ajouter un créneau',
  },
  attendance: {
    kicker: 'Suivi des présences',
    title: 'Feuilles d’appel',
    description:
      'Marquez rapidement présents, absents et retards pour chaque classe.',
    cta: '',
  },
  users: {
    kicker: 'Administration',
    title: 'Utilisateurs et rôles',
    description:
      'Créez des comptes utilisateur et assignez les rôles (admin, enseignant, parent, élève).',
    cta: 'Créer un utilisateur',
  },
  payments: {
    kicker: 'Frais scolaires',
    title: 'Paiements',
    description:
      'Consultez le montant total à payer, ce qui a été réglé et le restant dû.',
    cta: '',
  },
  fee_schedules: {
    kicker: 'Échéanciers',
    title: 'Tarifs et tranches',
    description:
      'Configurez les montants de scolarité, cantine et transport avec des dates d’échéance précises.',
    cta: 'Ajouter une tranche',
  },
  announcements: {
    kicker: 'Communication',
    title: 'Annonces officielles',
    description:
      'Publiez les réunions de parents, événements et informations institutionnelles pour les familles.',
    cta: 'Publier une annonce',
  },
  grades: {
    kicker: 'Gestion des notes',
    title: 'Notes & bulletins',
    description:
      'Créez des évaluations, saisissez les notes et préparez le conseil de classe.',
    cta: '',
  },
  canteen: {
    kicker: 'Cantine scolaire',
    title: 'Menus de la semaine',
    description:
      'Consultez et préparez les plats du jour pour chaque jour de la semaine.',
    cta: 'Ajouter un plat',
  },
  transport: {
    kicker: 'Transport des élèves',
    title: 'Trajets et cars',
    description:
      'Suivez les lignes de ramassage scolaire : conducteur, horaires et remarques.',
    cta: 'Ajouter un trajet',
  },
  reports: {
    kicker: 'Rapports et synthèses',
    title: 'Rapports & statistiques',
    description:
      'Obtenez une vue globale sur les présences et les paiements.',
    cta: '',
  },
  sis: {
    kicker: 'SIS',
    title: 'Dossier scolaire (SIS)',
    description:
      'Accès rapide aux élèves, familles et classes : données centrales du système d’information scolaire.',
    cta: '',
  },
  curriculum: {
    kicker: 'Pédagogie',
    title: 'Programmes & curriculum',
    description:
      'Définissez les objectifs, progressions et référentiels pédagogiques alignés sur votre établissement.',
    cta: '',
  },
  exams: {
    kicker: 'Évaluations',
    title: 'Examens & notes',
    description:
      'Planifiez les évaluations, saisissez les notes et préparez les bulletins.',
    cta: '',
  },
  permissions: {
    kicker: 'Sécurité',
    title: 'Rôles & permissions',
    description:
      'Définissez les accès par rôle : console admin, portail familles et finance (direction, enseignants, personnel).',
    cta: '',
  },
  settings_profile: {
    kicker: 'Établissement',
    title: 'Profil de l’établissement',
    description:
      'Identité administrative, coordonnées et référents : socle de toutes les données de l’école.',
    cta: '',
  },
  settings_branding: {
    kicker: 'Image',
    title: 'Image & apparence',
    description:
      'Logo, couleurs et expérience visuelle du portail pour les familles et le personnel.',
    cta: '',
  },
  settings_academics: {
    kicker: 'Pédagogie',
    title: 'Paramètres pédagogiques',
    description:
      'Cycles, périodes, pondérations et paramètres liés aux programmes et au calendrier pédagogique.',
    cta: '',
  },
  settings_attendance: {
    kicker: 'Présences',
    title: 'Paramètres des présences',
    description:
      'Règles d’appel, justificatifs, seuils d’alerte et paramètres des feuilles de présence.',
    cta: '',
  },
  settings_examinations: {
    kicker: 'Évaluations',
    title: 'Examens & notation',
    description:
      'Barèmes, périodes de contrôle, coefficients et modèles de bulletins.',
    cta: '',
  },
  settings_finance: {
    kicker: 'Finances',
    title: 'Finances',
    description:
      'Barèmes de frais, échéanciers, modes de paiement et politique de relance.',
    cta: '',
  },
  settings_communication: {
    kicker: 'Communication',
    title: 'Communication',
    description:
      'Canaux, modèles de messages et annonces officielles vers parents et équipe.',
    cta: '',
  },
  settings_security: {
    kicker: 'Sécurité',
    title: 'Sécurité & confidentialité',
    description:
      'Authentification, permissions, journalisation et protection des données personnelles.',
    cta: '',
  },
  settings_compliance: {
    kicker: 'Conformité',
    title: 'Documents & conformité',
    description:
      'Conservation documentaire, preuves de scolarité et obligations légales.',
    cta: '',
  },
  settings_automation: {
    kicker: 'Automatisation',
    title: 'Automatisation du système',
    description:
      'Tâches planifiées, intégrations et scénarios pour réduire la saisie manuelle.',
    cta: '',
  },
  billing: {
    kicker: 'Facturation',
    title: 'Facturation & abonnement',
    description:
      'Abonnement plateforme, factures et moyens de paiement (hors frais de scolarité).',
    cta: '',
  },
};

const roleSectionOverrides: Partial<Record<UserRole, Partial<Record<SectionId, { kicker: string; title: string; description: string; cta: string }>>>> = {
  teacher: {
    overview: { kicker: 'Vue d’ensemble', title: 'Tableau de bord enseignant', description: 'Vos classes et prochains événements.', cta: '' },
    classes: { kicker: 'Mes classes', title: 'Classes dont vous êtes responsable', description: 'Liste des classes que vous enseignez.', cta: '' },
    attendance: { kicker: 'Présences', title: 'Feuilles d’appel', description: 'Présences, absences et retards pour vos classes.', cta: '' },
    schedule: { kicker: 'Emploi du temps', title: 'Mon emploi du temps', description: 'Vos créneaux par jour et par classe.', cta: '' },
    calendar: { kicker: 'Calendrier', title: 'Événements et dates clés', description: 'Réunions, conseils de classe, examens.', cta: '' },
  },
  parent: {
    overview: { kicker: 'Vue d’ensemble', title: 'Espace parent', description: 'Résumé des emplois du temps et prochains événements.', cta: '' },
    students: { kicker: 'Mes enfants', title: 'Mes enfants', description: 'Vos enfants et leurs classes.', cta: '' },
    canteen: { kicker: 'Cantine', title: 'Menus de la cantine', description: 'Plats prévus pour vos enfants cette semaine.', cta: '' },
    transport: { kicker: 'Transport', title: 'Ramassage scolaire', description: 'Horaires et trajets de ramassage scolaire.', cta: '' },
    payments: { kicker: 'Frais scolaires', title: 'Paiements', description: 'Total à payer, montant réglé et restant dû.', cta: '' },
    reports: { kicker: 'Rapports', title: 'Rapports famille', description: 'Vue simplifiée des présences et paiements.', cta: '' },
    schedule: { kicker: 'Emplois du temps', title: 'Emplois du temps des enfants', description: 'Consultez les emplois du temps par enfant.', cta: '' },
    calendar: { kicker: 'Événements', title: 'Événements à venir', description: 'Sorties, réunions, conseils de classe.', cta: '' },
  },
  student: {
    overview: { kicker: 'Vue d’ensemble', title: 'Mon espace', description: 'Mon emploi du temps et mes prochains cours.', cta: '' },
    schedule: { kicker: 'Emploi du temps', title: 'Mon emploi du temps', description: 'Vos créneaux de la semaine.', cta: '' },
    courses: { kicker: 'Mes cours', title: 'Mes cours', description: 'Les matières et cours de votre classe.', cta: '' },
    canteen: { kicker: 'Cantine', title: 'Menus de la cantine', description: 'Plats prévus à la cantine cette semaine.', cta: '' },
    transport: { kicker: 'Transport', title: 'Ramassage scolaire', description: 'Trajets et horaires de transport.', cta: '' },
    calendar: { kicker: 'Calendrier', title: 'Calendrier', description: 'Événements et dates importantes.', cta: '' },
  },
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const role = getStoredRole();
  const sessionUser = getStoredUser();

  React.useEffect(() => {
    if (!role) {
      navigate('/login', { replace: true });
      return;
    }
    if (isBackendApiConfigured() && !localStorage.getItem(ACCESS_TOKEN_KEY)) {
      navigate('/login', { replace: true });
    }
  }, [role, navigate]);

  const currentNavItems = role ? roleNavItems[role] : [];
  const [activeSection, setActiveSection] = React.useState<SectionId>('overview');
  const [currentStudentId, setCurrentStudentId] = React.useState<string | null>(() => getStoredStudentId());

  const [adminNavOpen, setAdminNavOpen] = React.useState({
    schoolSettings: true,
    sis: true,
    academics: true,
    users: true,
    more: false,
  });

  React.useEffect(() => {
    if (role && currentNavItems.length > 0 && !currentNavItems.some((i) => i.id === activeSection)) {
      setActiveSection(currentNavItems[0].id);
    }
  }, [role, currentNavItems, activeSection]);

  const backendSync = isBackendApiConfigured();

  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [parents, setParents] = React.useState<ParentContact[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [matieres, setMatieres] = React.useState<Matiere[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>([]);

  const [schoolProfile, setSchoolProfile] = React.useState<SchoolProfile | null>(() =>
    getSchoolProfile()
  );
  const schoolTypes = React.useMemo(
    () => schoolTypesFromProfile(schoolProfile) as SchoolType[],
    [schoolProfile]
  );
  const levelOptions = React.useMemo(
    () => levelOptionsForProfile(schoolProfile),
    [schoolProfile]
  );
  const courseLevelOptions = React.useMemo(
    () => courseLevelOptionsForProfile(schoolProfile),
    [schoolProfile]
  );

  React.useEffect(() => {
    let cancelled = false;

    const hydrateProfile = async () => {
      const existing = getSchoolProfile();
      if (existing) {
        if (!cancelled) setSchoolProfile(existing);
        return;
      }

      try {
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? (JSON.parse(userRaw) as { schoolId?: string }) : null;
        if (user?.schoolId) {
          const fetched = await fetchAndCacheSchoolProfile(user.schoolId);
          if (!cancelled && fetched) setSchoolProfile(fetched);
        }
      } catch {
        // ignore
      }
    };

    void hydrateProfile();
    return () => {
      cancelled = true;
    };
  }, []);
  const [newClass, setNewClass] = React.useState<NewClassFormState>({
    name: '',
    schoolType: '',
    level: '',
    studentsCount: '',
    homeroomTeacherId: '',
  });

  const [newTeacher, setNewTeacher] =
    React.useState<NewTeacherFormState>({
    name: '',
    subject: '',
    email: '',
    password: '',
    phone: '',
  });
  const [teacherSubjectPreset, setTeacherSubjectPreset] = React.useState('');

  const [newStudent, setNewStudent] =
    React.useState<NewStudentFormState>({
      name: '',
      classId: '',
      email: '',
      phone: '',
      password: '',
    });

  const [newParent, setNewParent] = React.useState<NewParentFormState>({
    name: '',
    phone: '',
    email: '',
    password: '',
    studentId: '',
  });

  const [newCourse, setNewCourse] =
    React.useState<NewCourseFormState>({
      name: '',
      matiereId: '',
      level: '',
    });

  const [newMatiere, setNewMatiere] =
    React.useState<NewMatiereFormState>({ name: '' });

  const [newEvent, setNewEvent] =
    React.useState<NewEventFormState>({
    label: '',
    date: '',
    time: '',
    location: '',
    type: 'Promotion' as CalendarEvent['type'],
  });
  const [eventTimePreset, setEventTimePreset] = React.useState('');
  const [eventLocationPreset, setEventLocationPreset] = React.useState('');

  const [newSlot, setNewSlot] = React.useState<NewSlotFormState>({
    classId: '',
    courseId: '',
    day: '',
    time: '',
    room: '',
  });

  const [newRoom, setNewRoom] = React.useState<NewRoomFormState>({
    name: '',
    type: '',
    capacity: '',
  });

  const [users, setUsers] = React.useState<AppUser[]>([]);
  const [newUser, setNewUser] = React.useState<NewUserFormState>({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    password: '',
  });

  const defaultAcademicYear = React.useMemo(() => {
    const y = new Date().getFullYear();
    return `${y}-${y + 1}`;
  }, []);

  const [feeInstallments, setFeeInstallments] = React.useState<FeeInstallment[]>([]);
  const [newFeeInstallment, setNewFeeInstallment] = React.useState<NewFeeInstallmentFormState>({
    category: 'Scolarité',
    academicYear: defaultAcademicYear,
    label: '',
    amount: '',
    periodStart: '',
    periodEnd: '',
    description: '',
    sortOrder: '1',
  });

  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = React.useState<NewAnnouncementFormState>({
    title: '',
    body: '',
    eventDate: '',
    location: '',
    published: true,
    notifyByEmail: false,
  });
  const [newParentMessage, setNewParentMessage] = React.useState<NewParentMessageFormState>({
    subject: '',
    body: '',
    audience: 'PARENTS',
    classId: '',
    sendEmail: true,
    publishOnPortal: true,
  });
  const [emailConfigured, setEmailConfigured] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!backendSync || activeSection !== 'announcements') return;
    void fetchCommunicationStatusOnBackend()
      .then((status) => setEmailConfigured(status.configured))
      .catch(() => setEmailConfigured(null));
  }, [backendSync, activeSection]);

  const [idCardOpen, setIdCardOpen] = React.useState(false);
  const [idCardLoading, setIdCardLoading] = React.useState(false);
  const [idCardData, setIdCardData] = React.useState<StudentIdCardData | null>(null);

  const [paymentReminders, setPaymentReminders] = React.useState<PaymentReminder[]>([]);
  const [paymentReceipts, setPaymentReceipts] = React.useState<PaymentReceipt[]>([]);

  const parentFeesTotal = React.useMemo(
    () => paymentReminders.reduce((sum, r) => sum + (r.amount || 0), 0),
    [paymentReminders],
  );
  const parentFeesPaid = React.useMemo(
    () => paymentReceipts.reduce((sum, r) => sum + (r.amount || 0), 0),
    [paymentReceipts],
  );
  const [newReminder, setNewReminder] = React.useState<NewPaymentReminderFormState>({
    parentName: '',
    studentName: '',
    amount: '',
    dueDate: '',
    note: '',
  });
  const [newReceipt, setNewReceipt] = React.useState<NewPaymentReceiptFormState>({
    parentName: '',
    studentName: '',
    amount: '',
    date: '',
    reference: '',
  });

  const [canteenMenuItems, setCanteenMenuItems] = React.useState<CanteenMenuItem[]>([]);
  const [newCanteenItem, setNewCanteenItem] =
    React.useState<NewCanteenItemFormState>({
      day: '',
      mealType: 'Déjeuner',
      dish: '',
      note: '',
    });

  const [transportRoutes, setTransportRoutes] = React.useState<TransportRoute[]>([]);
  const [newTransportRoute, setNewTransportRoute] =
    React.useState<NewTransportRouteFormState>({
      name: '',
      driverName: '',
      departureTime: '',
      returnTime: '',
      note: '',
    });

  const current =
    (role && roleSectionOverrides[role]?.[activeSection]) ?? sectionConfig[activeSection];

  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([]);

  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [grades, setGrades] = React.useState<StudentGrade[]>([]);
  const [newEvaluation, setNewEvaluation] = React.useState<NewEvaluationFormState>({
    classId: '',
    courseId: '',
    label: '',
    date: '',
    period: 'Trimestre 1',
    type: 'Devoir',
    coefficient: '1',
    maxScore: '20',
  });

  React.useEffect(() => {
    if (!backendSync || role !== 'admin') return;
    void loadDashboardFromBackend({
      setTeachers,
      setClasses,
      setStudents,
      setCourses,
      setMatieres,
      setRooms,
      setEvents,
      setSchedule,
      setCanteenMenuItems,
      setTransportRoutes,
      setParents,
      setUsers,
      setAttendanceRecords,
      setEvaluations,
      setGrades,
      setPaymentReminders,
      setPaymentReceipts,
      setFeeInstallments,
      setAnnouncements,
    }).catch((err) => console.error('Failed to load dashboard from API', err));
  }, [backendSync, role]);

  const getTeacherName = (id?: string) =>
    id ? teachers.find((t) => t.id === id)?.name ?? '—' : '—';

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? 'Classe inconnue';

  const getCourseName = (id?: string) =>
    id ? courses.find((c) => c.id === id)?.name ?? '—' : '—';

  const getMatiereName = (id?: string) =>
    id ? matieres.find((m) => m.id === id)?.name ?? '—' : '—';

  const syncPortalUsers = async () => {
    if (!backendSync) return;
    try {
      setUsers(await refreshUsersFromBackend());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParent.name.trim() || (!newParent.email.trim() && !newParent.phone.trim())) return;
    const payload = {
      name: newParent.name.trim(),
      phone: newParent.phone.trim() || undefined,
      email: newParent.email.trim() || undefined,
      password: newParent.password.trim() || undefined,
      studentId: newParent.studentId || undefined,
    };
    try {
      if (backendSync) {
        const created = await createParentOnBackend(payload);
        setParents((prev) => [...prev, created]);
        await syncPortalUsers();
      } else {
        setParents((prev) => [...prev, { id: `p-${Date.now()}`, ...payload }]);
      }
      toast.success('Parent et compte portail créés');
      setNewParent({ name: '', phone: '', email: '', password: '', studentId: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateParent = async (
    id: string,
    data: { name: string; phone?: string; email?: string; studentId?: string; password?: string }
  ) => {
    try {
      if (backendSync) {
        const updated = await updateParentOnBackend(id, data);
        setParents((prev) => prev.map((p) => (p.id === id ? updated : p)));
        await syncPortalUsers();
      } else {
        setParents((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      }
      toast.success('Parent mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteParent = async (id: string) => {
    try {
      if (backendSync) {
        await deleteParentOnBackend(id);
        await syncPortalUsers();
      }
      setParents((prev) => prev.filter((p) => p.id !== id));
      toast.success('Parent supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || (!newUser.email.trim() && !newUser.phone.trim())) return;
    const payload = {
      name: newUser.name.trim(),
      email: newUser.email.trim() || undefined,
      phone: newUser.phone.trim() || undefined,
      role: newUser.role,
      password: newUser.password?.trim() || undefined,
    };
    try {
      if (backendSync) {
        const created = await createUserOnBackend(payload);
        setUsers((prev) => [...prev, created]);
      } else {
        setUsers((prev) => [
          ...prev,
          {
            id: `u-${Date.now()}`,
            name: payload.name,
            email: payload.email ?? '',
            phone: payload.phone,
            role: payload.role,
          },
        ]);
      }
      toast.success('Utilisateur créé');
      setNewUser({ name: '', email: '', phone: '', role: 'teacher', password: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateUser = async (
    id: string,
    data: { name: string; email?: string; phone?: string; role: AppUserRole; password?: string }
  ) => {
    try {
      if (backendSync) {
        const updated = await updateUserOnBackend(id, data);
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      } else {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
      }
      toast.success('Utilisateur mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      if (backendSync) await deleteUserOnBackend(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Utilisateur supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.parentName.trim() || !newReminder.amount.trim()) return;
    const id = `rem-${Date.now()}`;
    const reminder = {
      id,
      parentName: newReminder.parentName.trim(),
      studentName: newReminder.studentName.trim() || undefined,
      amount: Number(newReminder.amount || 0),
      dueDate: newReminder.dueDate,
      status: 'Envoyé' as const,
    };
    setPaymentReminders((prev) => [...prev, reminder]);
    if (backendSync) {
      void createPaymentReminderOnBackend({
        parentName: reminder.parentName,
        studentName: reminder.studentName,
        amount: reminder.amount,
        dueDate: reminder.dueDate || new Date().toISOString().slice(0, 10),
      }).catch((err) => console.error(err));
    }
    setNewReminder({
      parentName: '',
      studentName: '',
      amount: '',
      dueDate: '',
      note: '',
    });
  };

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceipt.parentName.trim() || !newReceipt.amount.trim()) return;
    const id = `rec-${Date.now()}`;
    const reference =
      newReceipt.reference.trim() || `RECU-${new Date().getFullYear()}-${Date.now()}`;
    const receipt = {
      id,
      parentName: newReceipt.parentName.trim(),
      studentName: newReceipt.studentName.trim() || undefined,
      amount: Number(newReceipt.amount || 0),
      date: newReceipt.date || new Date().toISOString().slice(0, 10),
      reference,
    };
    setPaymentReceipts((prev) => [...prev, receipt]);
    if (backendSync) {
      void createPaymentReceiptOnBackend(receipt).catch((err) => console.error(err));
    }
    setNewReceipt({
      parentName: '',
      studentName: '',
      amount: '',
      date: '',
      reference: '',
    });
  };

  const handleCreateCanteenItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCanteenItem.dish.trim() || !newCanteenItem.day) return;
    const id = `cant-${Date.now()}`;
    const item = {
      id,
      day: newCanteenItem.day,
      mealType: newCanteenItem.mealType,
      dish: newCanteenItem.dish.trim(),
      note: newCanteenItem.note.trim() || undefined,
    };
    setCanteenMenuItems((prev) => [...prev, item]);
    if (backendSync) {
      void createCanteenOnBackend(item).catch((err) => console.error(err));
    }
    setNewCanteenItem({
      day: '',
      mealType: 'Déjeuner',
      dish: '',
      note: '',
    });
  };

  const handleCreateTransportRoute = (
    e: React.FormEvent,
    payload?: { waypoints?: { lat: number; lng: number; name: string }[]; routePolyline?: [number, number][] },
  ) => {
    e.preventDefault();
    if (!newTransportRoute.name.trim() || !newTransportRoute.driverName.trim() || !newTransportRoute.departureTime.trim()) return;
    const id = `tr-${Date.now()}`;
    setTransportRoutes((prev) => [
      ...prev,
      {
        id,
        name: newTransportRoute.name.trim(),
        driverName: newTransportRoute.driverName.trim(),
        departureTime: newTransportRoute.departureTime.trim(),
        returnTime: newTransportRoute.returnTime.trim() || undefined,
        note: newTransportRoute.note.trim() || undefined,
        waypoints: payload?.waypoints,
        routePolyline: payload?.routePolyline,
        studentIds: [],
      },
    ]);
    if (backendSync) {
      void createTransportOnBackend({
        name: newTransportRoute.name.trim(),
        driverName: newTransportRoute.driverName.trim(),
        departureTime: newTransportRoute.departureTime.trim(),
        returnTime: newTransportRoute.returnTime.trim() || undefined,
        note: newTransportRoute.note.trim() || undefined,
      }).catch((err) => console.error(err));
    }
    setNewTransportRoute({
      name: '',
      driverName: '',
      departureTime: '',
      returnTime: '',
      note: '',
    });
  };

  const handleUpdateRouteStudents = (routeId: string, studentIds: string[]) => {
    setTransportRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, studentIds } : r)),
    );
    if (backendSync && routeId && !routeId.startsWith('tr-')) {
      void updateTransportStudentsOnBackend(routeId, studentIds).catch((err) => console.error(err));
    }
  };

  const handleStudentIdChange = (id: string) => {
    setStoredStudentId(id);
    setCurrentStudentId(id);
  };

  const transportRoutesForView =
    role === 'student'
      ? transportRoutes.filter((r) =>
          (r.studentIds ?? []).includes(currentStudentId ?? ''),
        )
      : transportRoutes;

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;
    const typeForLevel =
      newClass.schoolType || (schoolTypes.length === 1 ? schoolTypes[0] : '');
    let levelLabel = newClass.level.trim() || 'Niveau non défini';
    if (typeForLevel && newClass.level.trim()) {
      levelLabel = `${typeForLevel} - ${newClass.level.trim()}`;
    } else if (typeForLevel && levelOptions.length) {
      levelLabel = `${typeForLevel} - ${levelOptions[0]}`;
    }
    const payload = {
      name: newClass.name.trim(),
      level: levelLabel,
      studentsCount: Number(newClass.studentsCount || 0),
      homeroomTeacherId: newClass.homeroomTeacherId || undefined,
    };
    try {
      if (backendSync) {
        const created = await createClassOnBackend(payload);
        setClasses((prev) => [...prev, created]);
      } else {
        setClasses((prev) => [...prev, { id: `c-${Date.now()}`, ...payload }]);
      }
      toast.success('Classe créée');
      setNewClass({ name: '', schoolType: '', level: '', studentsCount: '', homeroomTeacherId: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateClass = async (
    id: string,
    data: { name: string; level: string; studentsCount: number; homeroomTeacherId?: string }
  ) => {
    try {
      if (backendSync) {
        const updated = await updateClassOnBackend(id, data);
        setClasses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } else {
        setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      }
      toast.success('Classe mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      if (backendSync) await deleteClassOnBackend(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setStudents((prev) =>
        prev.map((s) => (s.classId === id ? { ...s, classId: undefined } : s))
      );
      toast.success('Classe supprimée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name.trim() || !newTeacher.email.trim()) return;
    const payload = {
      name: newTeacher.name.trim(),
      subject: newTeacher.subject.trim() || 'Matière à définir',
      email: newTeacher.email.trim(),
      password: newTeacher.password.trim() || undefined,
      phone: newTeacher.phone.trim() || undefined,
    };
    try {
      if (backendSync) {
        const created = await createTeacherOnBackend(payload);
        setTeachers((prev) => [...prev, created]);
        await syncPortalUsers();
      } else {
        const initials = payload.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() ?? '')
          .join('');
        setTeachers((prev) => [
          ...prev,
          { id: `t-${Date.now()}`, initials: initials || 'ED', ...payload },
        ]);
      }
      toast.success('Enseignant et compte portail créés');
      setNewTeacher({ name: '', subject: '', email: '', password: '', phone: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateTeacher = async (
    id: string,
    data: { name: string; subject: string; email?: string; password?: string; phone?: string }
  ) => {
    try {
      if (backendSync) {
        const updated = await updateTeacherOnBackend(id, data);
        setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)));
        await syncPortalUsers();
      } else {
        setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      }
      toast.success('Enseignant mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      if (backendSync) {
        await deleteTeacherOnBackend(id);
        await syncPortalUsers();
      }
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setClasses((prev) =>
        prev.map((c) =>
          c.homeroomTeacherId === id ? { ...c, homeroomTeacherId: undefined } : c
        )
      );
      toast.success('Enseignant supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || (!newStudent.email.trim() && !newStudent.phone.trim())) return;
    const payload = {
      name: newStudent.name.trim(),
      classId: newStudent.classId || undefined,
      email: newStudent.email.trim() || undefined,
      phone: newStudent.phone.trim() || undefined,
      password: newStudent.password.trim() || undefined,
    };
    try {
      if (backendSync) {
        const created = await createStudentOnBackend(payload);
        setStudents((prev) => [...prev, created]);
        await syncPortalUsers();
      } else {
        setStudents((prev) => [...prev, { id: `st-${Date.now()}`, ...payload }]);
      }
      toast.success('Élève et compte portail créés');
      setNewStudent({ name: '', classId: '', email: '', phone: '', password: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateStudent = async (
    id: string,
    data: { name: string; classId?: string; email?: string; phone?: string; password?: string }
  ) => {
    try {
      if (backendSync) {
        const updated = await updateStudentOnBackend(id, data);
        setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
        await syncPortalUsers();
      } else {
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      }
      toast.success('Élève mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      if (backendSync) {
        await deleteStudentOnBackend(id);
        await syncPortalUsers();
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setParents((prev) =>
        prev.map((p) => (p.studentId === id ? { ...p, studentId: undefined } : p))
      );
      toast.success('Élève supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handlePrintStudentIdCard = async (studentId: string) => {
    setIdCardOpen(true);
    setIdCardLoading(true);
    setIdCardData(null);
    try {
      if (backendSync) {
        const card = await fetchStudentIdCardOnBackend(studentId);
        setIdCardData(card);
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, matricule: card.matricule } : s))
        );
      } else {
        const student = students.find((s) => s.id === studentId);
        setIdCardData({
          studentId,
          matricule: student?.matricule ?? `DEMO-${studentId.slice(-4)}`,
          studentName: student?.name ?? 'Élève',
          className: student?.classId ? getClassName(student.classId) : '',
          schoolName: schoolProfile?.name ?? 'Établissement',
          qrPayload: JSON.stringify({ studentId, name: student?.name }),
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur carte scolaire');
      setIdCardOpen(false);
    } finally {
      setIdCardLoading(false);
    }
  };

  const handleCreateFeeInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeInstallment.label.trim() || !newFeeInstallment.amount.trim()) return;
    const payload = {
      category: newFeeInstallment.category,
      academicYear: newFeeInstallment.academicYear.trim() || defaultAcademicYear,
      label: newFeeInstallment.label.trim(),
      amount: Number(newFeeInstallment.amount),
      periodStart: newFeeInstallment.periodStart,
      periodEnd: newFeeInstallment.periodEnd,
      description: newFeeInstallment.description.trim() || undefined,
      sortOrder: Number(newFeeInstallment.sortOrder || 1),
    };
    try {
      if (backendSync) {
        const created = await createFeeInstallmentOnBackend(payload);
        setFeeInstallments((prev) => [...prev, created]);
      } else {
        setFeeInstallments((prev) => [...prev, { id: `fee-${Date.now()}`, ...payload }]);
      }
      toast.success('Tranche ajoutée');
      setNewFeeInstallment((f) => ({
        ...f,
        label: '',
        amount: '',
        periodStart: '',
        periodEnd: '',
        description: '',
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateFeeInstallment = async (
    id: string,
    data: Omit<FeeInstallment, 'id'>
  ) => {
    try {
      if (backendSync) {
        const updated = await updateFeeInstallmentOnBackend(id, data);
        setFeeInstallments((prev) => prev.map((f) => (f.id === id ? updated : f)));
      } else {
        setFeeInstallments((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
      }
      toast.success('Tranche mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteFeeInstallment = async (id: string) => {
    try {
      if (backendSync) await deleteFeeInstallmentOnBackend(id);
      setFeeInstallments((prev) => prev.filter((f) => f.id !== id));
      toast.success('Tranche supprimée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.body.trim()) return;
    const payload = {
      title: newAnnouncement.title.trim(),
      body: newAnnouncement.body.trim(),
      eventDate: newAnnouncement.eventDate.trim() || undefined,
      location: newAnnouncement.location.trim() || undefined,
      published: newAnnouncement.published,
      notifyByEmail: newAnnouncement.notifyByEmail,
    };
    try {
      if (backendSync) {
        const created = await createAnnouncementOnBackend(payload);
        setAnnouncements((prev) => [...prev, created]);
        if (newAnnouncement.notifyByEmail) {
          toast.success('Annonce publiée — e-mails en cours d’envoi');
        }
      } else {
        setAnnouncements((prev) => [
          ...prev,
          {
            id: `ann-${Date.now()}`,
            ...payload,
            publishedAt: new Date().toISOString(),
          },
        ]);
      }
      toast.success('Annonce publiée');
      setNewAnnouncement({
        title: '',
        body: '',
        eventDate: '',
        location: '',
        published: true,
        notifyByEmail: false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleSendParentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentMessage.subject.trim() || !newParentMessage.body.trim()) return;
    if (newParentMessage.audience === 'CLASS_PARENTS' && !newParentMessage.classId) {
      toast.error('Choisissez une classe');
      return;
    }
    try {
      if (backendSync) {
        const result = await sendParentMessageOnBackend({
          subject: newParentMessage.subject.trim(),
          body: newParentMessage.body.trim(),
          audience: newParentMessage.audience,
          classId:
            newParentMessage.audience === 'CLASS_PARENTS'
              ? newParentMessage.classId
              : undefined,
          sendEmail: newParentMessage.sendEmail,
          publishOnPortal: newParentMessage.publishOnPortal,
        });
        toast.success(result.message ?? 'Message envoyé');
      } else {
        toast.success('Message enregistré (mode démo)');
      }
      setNewParentMessage({
        subject: '',
        body: '',
        audience: 'PARENTS',
        classId: '',
        sendEmail: true,
        publishOnPortal: true,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateAnnouncement = async (
    id: string,
    data: Omit<Announcement, 'id' | 'publishedAt'>
  ) => {
    try {
      if (backendSync) {
        const updated = await updateAnnouncementOnBackend(id, data);
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? updated : a)));
      } else {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...data } : a))
        );
      }
      toast.success('Annonce mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      if (backendSync) await deleteAnnouncementOnBackend(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success('Annonce supprimée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.matiereId) return;
    const matiereName = getMatiereName(newCourse.matiereId);
    const name =
      newCourse.name.trim() || (matiereName !== '—' ? matiereName : 'Cours sans nom');
    const id = `co-${Date.now()}`;
    setCourses((prev) => [
      ...prev,
      {
        id,
        name,
        matiereId: newCourse.matiereId,
        level: newCourse.level.trim() || 'Niveau non défini',
      },
    ]);
    if (backendSync) {
      void createCourseOnBackend({
        name,
        matiereId: newCourse.matiereId,
        level: newCourse.level.trim() || 'Niveau non défini',
      }).catch((err) => console.error(err));
    }
    setNewCourse({ name: '', matiereId: '', level: '' });
  };

  const handleCreateMatiere = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatiere.name.trim()) return;
    const id = `mat-${Date.now()}`;
    setMatieres((prev) => [
      ...prev,
      { id, name: newMatiere.name.trim() },
    ]);
    if (backendSync) {
      void createMatiereOnBackend(newMatiere.name.trim()).catch((err) => console.error(err));
    }
    setNewMatiere({ name: '' });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.label.trim()) return;
    const id = `ev-${Date.now()}`;
    setEvents((prev) => [
      ...prev,
      {
        id,
        label: newEvent.label.trim(),
        date: newEvent.date.trim() || 'Date à définir',
        time: newEvent.time.trim() || undefined,
        location: newEvent.location.trim() || undefined,
        type: newEvent.type,
      },
    ]);
    if (backendSync) {
      void createEventOnBackend({
        label: newEvent.label.trim(),
        date: newEvent.date.trim() || 'Date à définir',
        time: newEvent.time.trim() || undefined,
        location: newEvent.location.trim() || undefined,
        type: newEvent.type,
      }).catch((err) => console.error(err));
    }
    setNewEvent({
      label: '',
      date: '',
      time: '',
      location: '',
      type: 'Promotion',
    });
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.classId || !newSlot.day || !newSlot.time) return;
    const id = `sl-${Date.now()}`;
    setSchedule((prev) => [
      ...prev,
      {
        id,
        classId: newSlot.classId,
        courseId: newSlot.courseId || undefined,
        day: newSlot.day,
        time: newSlot.time,
        room: newSlot.room || undefined,
      },
    ]);
    if (backendSync) {
      void createScheduleOnBackend({
        classId: newSlot.classId,
        courseId: newSlot.courseId || undefined,
        day: newSlot.day,
        time: newSlot.time,
        room: newSlot.room || undefined,
      }).catch((err) => console.error(err));
    }
    setNewSlot({
      classId: '',
      courseId: '',
      day: '',
      time: '',
      room: '',
    });
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    const id = `r-${Date.now()}`;
    setRooms((prev) => [
      ...prev,
      {
        id,
        name: newRoom.name.trim(),
        type: newRoom.type || 'Salle de classe',
        capacity: newRoom.capacity ? Number(newRoom.capacity) : undefined,
      },
    ]);
    if (backendSync) {
      void createRoomOnBackend({
        name: newRoom.name.trim(),
        type: newRoom.type || 'Salle de classe',
        capacity: newRoom.capacity ? Number(newRoom.capacity) : undefined,
      }).catch((err) => console.error(err));
    }
    setNewRoom({
      name: '',
      type: '',
      capacity: '',
    });
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvaluation.classId || !newEvaluation.courseId || !newEvaluation.label.trim()) return;
    const coef = Number(newEvaluation.coefficient || '1') || 1;
    const maxScore = Number(newEvaluation.maxScore || '20') || 20;
    const id = `ev-${Date.now()}`;
    const evaluation = {
      id,
      classId: newEvaluation.classId,
      courseId: newEvaluation.courseId,
      label: newEvaluation.label.trim(),
      date: newEvaluation.date || new Date().toISOString().slice(0, 10),
      period: newEvaluation.period,
      type: newEvaluation.type,
      coefficient: coef,
      maxScore,
    };
    setEvaluations((prev) => [...prev, evaluation]);
    if (backendSync) {
      void createEvaluationOnBackend(evaluation).catch((err) => console.error(err));
    }
    setNewEvaluation({
      classId: '',
      courseId: '',
      label: '',
      date: '',
      period: newEvaluation.period,
      type: newEvaluation.type,
      coefficient: '1',
      maxScore: '20',
    });
  };

  const handleUpdateGrade = (evaluationId: string, studentId: string, score: number | '') => {
    setGrades((prev) => {
      const existingIndex = prev.findIndex(
        (g) => g.evaluationId === evaluationId && g.studentId === studentId,
      );
      if (score === '' || Number.isNaN(score)) {
        if (existingIndex === -1) return prev;
        const clone = [...prev];
        clone.splice(existingIndex, 1);
        return clone;
      }
      const value = Number(score);
      if (existingIndex === -1) {
        return [
          ...prev,
          {
            id: `gr-${Date.now()}-${studentId}`,
            evaluationId,
            studentId,
            score: value,
          },
        ];
      }
      const clone = [...prev];
      clone[existingIndex] = {
        ...clone[existingIndex],
        score: value,
      };
      return clone;
    });
    if (backendSync && score !== '' && !Number.isNaN(score) && evaluationId && !evaluationId.startsWith('ev-')) {
      void createOrUpdateGradeOnBackend({
        evaluationId,
        studentId,
        score: Number(score),
      }).catch((err) => console.error(err));
    }
  };

  const handleAttendanceStatusChange = (record: AttendanceRecord, isUpdate: boolean) => {
    if (!backendSync) return;
    const payload = {
      date: record.date,
      classId: record.classId,
      studentId: record.studentId,
      status: record.status,
    };
    const isBackendId = record.id && !record.id.startsWith('att-');
    if (isUpdate && isBackendId) {
      void updateAttendanceOnBackend(record.id, payload).catch((err) => console.error(err));
      return;
    }
    void createAttendanceOnBackend(payload)
      .then((created) => {
        const savedId = String((created as { id: unknown }).id);
        setAttendanceRecords((prev) =>
          prev.map((r) =>
            r.studentId === record.studentId &&
            r.date === record.date &&
            r.classId === record.classId
              ? { ...r, id: savedId }
              : r,
          ),
        );
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <SidebarProvider className='dashboard-shell min-h-svh w-full max-w-full'>
      <Sidebar collapsible='icon' variant='inset'>
        <SidebarHeader>
          <div className='dashboard-sidebar-brand flex flex-col gap-1 px-2'>
            <AppLogo name='NewGee Admin' />
            <span className='text-[11px] font-medium text-muted-foreground'>
              {roleTitles[role]}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {role === 'admin' ? (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Général</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Tableau de bord'
                        isActive={activeSection === 'overview'}
                        onClick={() => setActiveSection('overview')}
                      >
                        <LayoutDashboard className='mr-1.5' />
                        <span>Tableau de bord</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Tous les modules et réglages'
                        isActive={activeSection === 'system_registry'}
                        onClick={() => setActiveSection('system_registry')}
                      >
                        <Layers className='mr-1.5' />
                        <span>Console système</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Espace enseignants'
                        isActive={activeSection === 'teachers'}
                        onClick={() => setActiveSection('teachers')}
                      >
                        <GraduationCap className='mr-1.5' />
                        <span>Espace enseignants</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>SIS</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type='button'
                        className='font-medium'
                        onClick={() =>
                          setAdminNavOpen((p) => ({
                            ...p,
                            sis: !p.sis,
                          }))
                        }
                      >
                        <ChevronDown
                          className={cn('mr-1 transition-transform', adminNavOpen.sis && 'rotate-180')}
                        />
                        <School className='mr-1.5' />
                        <span>Dossiers & classes</span>
                      </SidebarMenuButton>
                      {adminNavOpen.sis ? (
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'sis'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('sis')}
                              >
                                Vue d’ensemble SIS
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'students'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('students')}
                              >
                                Élèves
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'parents'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('parents')}
                              >
                                Parents
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'classes'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('classes')}
                              >
                                Classes
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Pédagogie</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type='button'
                        className='font-medium'
                        onClick={() =>
                          setAdminNavOpen((p) => ({
                            ...p,
                            academics: !p.academics,
                          }))
                        }
                      >
                        <ChevronDown
                          className={cn('mr-1 transition-transform', adminNavOpen.academics && 'rotate-180')}
                        />
                        <BookMarked className='mr-1.5' />
                        <span>Matières & cours</span>
                      </SidebarMenuButton>
                      {adminNavOpen.academics ? (
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'matieres'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('matieres')}
                              >
                                Matières
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'courses'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('courses')}
                              >
                                Cours
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'schedule'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('schedule')}
                              >
                                Emploi du temps
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'curriculum'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('curriculum')}
                              >
                                Programmes
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Exploitation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Présences'
                        isActive={activeSection === 'attendance'}
                        onClick={() => setActiveSection('attendance')}
                      >
                        <CheckSquare className='mr-1.5' />
                        <span>Présences</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Examens'
                        isActive={activeSection === 'exams'}
                        onClick={() => setActiveSection('exams')}
                      >
                        <BarChart2 className='mr-1.5' />
                        <span>Examens</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Finances'
                        isActive={activeSection === 'payments'}
                        onClick={() => setActiveSection('payments')}
                      >
                        <Wallet className='mr-1.5' />
                        <span>Finances</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Échéanciers'
                        isActive={activeSection === 'fee_schedules'}
                        onClick={() => setActiveSection('fee_schedules')}
                      >
                        <Receipt className='mr-1.5' />
                        <span>Échéanciers</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Annonces'
                        isActive={activeSection === 'announcements'}
                        onClick={() => setActiveSection('announcements')}
                      >
                        <BookMarked className='mr-1.5' />
                        <span>Annonces</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Gestion des accès</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type='button'
                        className='font-medium'
                        onClick={() =>
                          setAdminNavOpen((p) => ({
                            ...p,
                            users: !p.users,
                          }))
                        }
                      >
                        <ChevronDown
                          className={cn('mr-1 transition-transform', adminNavOpen.users && 'rotate-180')}
                        />
                        <Shield className='mr-1.5' />
                        <span>Utilisateurs & droits</span>
                      </SidebarMenuButton>
                      {adminNavOpen.users ? (
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'users'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('users')}
                              >
                                Utilisateurs
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'permissions'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('permissions')}
                              >
                                Droits
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type='button'
                        className='font-medium'
                        tooltip='Paramètres'
                        isActive={isSchoolSettingsSection(activeSection)}
                        onClick={() =>
                          setAdminNavOpen((p) => ({
                            ...p,
                            schoolSettings: !p.schoolSettings,
                          }))
                        }
                      >
                        <ChevronDown
                          className={cn(
                            'mr-1 transition-transform',
                            adminNavOpen.schoolSettings && 'rotate-180',
                          )}
                        />
                        <Cog className='mr-1.5' />
                        <span>Paramètres</span>
                      </SidebarMenuButton>
                      {adminNavOpen.schoolSettings ? (
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_profile'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_profile')}
                              >
                                Profil de l’établissement
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_branding'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_branding')}
                              >
                                Image & apparence
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_academics'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_academics')}
                              >
                                Paramètres pédagogiques
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_attendance'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_attendance')}
                              >
                                Présences (réglages)
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_examinations'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_examinations')}
                              >
                                Examens & notation
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_finance'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_finance')}
                              >
                                Finances
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_communication'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_communication')}
                              >
                                Communication
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_security'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_security')}
                              >
                                Sécurité & confidentialité
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_compliance'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_compliance')}
                              >
                                Documents & conformité
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'settings_automation'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('settings_automation')}
                              >
                                Automatisation
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip='Facturation'
                        isActive={activeSection === 'billing'}
                        onClick={() => setActiveSection('billing')}
                      >
                        <Receipt className='mr-1.5' />
                        <span>Facturation</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Plus</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        type='button'
                        className='font-medium'
                        onClick={() =>
                          setAdminNavOpen((p) => ({
                            ...p,
                            more: !p.more,
                          }))
                        }
                      >
                        <ChevronDown
                          className={cn('mr-1 transition-transform', adminNavOpen.more && 'rotate-180')}
                        />
                        <MoreHorizontal className='mr-1.5' />
                        <span>Campus & services</span>
                      </SidebarMenuButton>
                      {adminNavOpen.more ? (
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'calendar'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('calendar')}
                              >
                                Calendrier
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'rooms'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('rooms')}
                              >
                                Salles
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'canteen'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('canteen')}
                              >
                                Cantine
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'transport'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('transport')}
                              >
                                Transport
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeSection === 'reports'}
                            >
                              <button
                                type='button'
                                onClick={() => setActiveSection('reports')}
                              >
                                Rapports
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {currentNavItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <item.icon className='mr-1.5' />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className='dashboard-user-pill flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback>
                  {role === 'admin' ? 'AD' : role === 'teacher' ? 'EN' : role === 'parent' ? 'PA' : 'EL'}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium leading-tight'>
                  {sessionUser?.name ?? (role === 'admin' ? 'Admin établissement' : role === 'teacher' ? 'Enseignant' : role === 'parent' ? 'Parent' : 'Élève')}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  {sessionUser?.email ?? roleTitles[role]}
                </p>
              </div>
            </div>
            <UserPortalSidebarLink />
            <Button variant='ghost' size='sm' className='w-full justify-start text-xs' onClick={handleLogout}>
              Se déconnecter
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className='dashboard-header'>
          <div className='dashboard-header__row'>
            <SidebarTrigger />
            <div className='dashboard-header__lead'>
              <p className='dashboard-header__eyebrow'>{current.kicker}</p>
              <h1 className='dashboard-header__title'>{current.title}</h1>
              <p className='dashboard-header__desc'>{current.description}</p>
            </div>
            <div className='dashboard-header__actions'>
              <LanguageSwitcher compact showLabel />
              {schoolProfile ? (
                <>
                  <Badge
                    variant='outline'
                    className='dashboard-header__school-type text-xs px-3 py-1'
                    title={schoolProfile.name}
                  >
                    {schoolProfile.type}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={`${getSystemBadgeClass(schoolProfile.system)} text-xs px-3 py-1`}
                  >
                    {getSystemLabel(schoolProfile.system)}
                  </Badge>
                </>
              ) : null}
              {current.cta ? <Button size='sm'>{current.cta}</Button> : null}
            </div>
          </div>
        </header>

        <main className='dashboard-content flex-1 space-y-6'>
          {activeSection === 'system_registry' && (
            <SystemRegistrySection
              sectionConfig={sectionConfig}
              onOpenSection={setActiveSection}
              counts={{
                teachers: teachers.length,
                students: students.length,
                parents: parents.length,
                classes: classes.length,
                matieres: matieres.length,
                courses: courses.length,
                schedule: schedule.length,
                rooms: rooms.length,
                calendar: events.length,
                attendance: attendanceRecords.length,
                exams: evaluations.length,
                payments: paymentReminders.length + paymentReceipts.length,
                users: users.length,
                canteen: canteenMenuItems.length,
                transport: transportRoutes.length,
                sis: students.length + parents.length,
                reports:
                  attendanceRecords.length + paymentReminders.length + paymentReceipts.length > 0
                    ? attendanceRecords.length + paymentReminders.length + paymentReceipts.length
                    : undefined,
              }}
            />
          )}

          {activeSection === 'overview' && (
            <OverviewSection
              classes={classes}
              teachers={teachers}
              students={students}
              events={events}
              onNavigate={setActiveSection}
              totalDue={parentFeesTotal}
              amountPaid={parentFeesPaid}
              remindersCount={paymentReminders.length}
              receipts={paymentReceipts}
              transportRoutes={transportRoutes}
            />
          )}

          {activeSection === 'classes' && (
            <ClassesSection
              classes={classes}
              teachers={teachers}
              newClass={newClass}
              setNewClass={setNewClass}
              onCreateClass={handleCreateClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              getTeacherName={getTeacherName}
              schoolTypes={schoolTypes}
              schoolProfile={schoolProfile}
              levelOptions={levelOptions}
            />
          )}

          {activeSection === 'teachers' && (
            <TeachersSection
              teachers={teachers}
              newTeacher={newTeacher}
              setNewTeacher={setNewTeacher}
              teacherSubjectPreset={teacherSubjectPreset}
              setTeacherSubjectPreset={setTeacherSubjectPreset}
              onCreateTeacher={handleCreateTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              subjectOptions={SUBJECT_OPTIONS}
            />
          )}

          {activeSection === 'students' && (
            <StudentsSection
              students={students}
              classes={classes}
              newStudent={newStudent}
              setNewStudent={setNewStudent}
              onCreateStudent={handleCreateStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onPrintIdCard={role === 'admin' ? handlePrintStudentIdCard : undefined}
              getClassName={getClassName}
              readOnly={role === 'parent' || role === 'student'}
            />
          )}

          {activeSection === 'parents' && (
            <ParentsSection
              parents={parents}
              students={students}
              newParent={newParent}
              setNewParent={setNewParent}
              onCreateParent={handleCreateParent}
              onUpdateParent={handleUpdateParent}
              onDeleteParent={handleDeleteParent}
            />
          )}

          {activeSection === 'courses' && (
            <CoursesSection
              courses={courses}
              newCourse={newCourse}
              setNewCourse={setNewCourse}
              onCreateCourse={handleCreateCourse}
              courseLevelOptions={courseLevelOptions}
              matieres={matieres}
              readOnly={role === 'student'}
            />
          )}

          {activeSection === 'matieres' && (
            <MatieresSection
              matieres={matieres}
              newMatiere={newMatiere}
              setNewMatiere={setNewMatiere}
              onCreateMatiere={handleCreateMatiere}
            />
          )}

          {activeSection === 'rooms' && (
            <RoomsSection
              rooms={rooms}
              newRoom={newRoom}
              setNewRoom={setNewRoom}
              onCreateRoom={handleCreateRoom}
              roomTypeOptions={ROOM_TYPE_OPTIONS}
            />
          )}

          {activeSection === 'calendar' && (
            <CalendarSection
              rooms={rooms}
              events={events}
              newEvent={newEvent}
              setNewEvent={setNewEvent}
              onCreateEvent={handleCreateEvent}
              eventTimePreset={eventTimePreset}
              setEventTimePreset={setEventTimePreset}
              eventLocationPreset={eventLocationPreset}
              setEventLocationPreset={setEventLocationPreset}
              eventTimePresets={EVENT_TIME_PRESETS}
              eventLocationPresets={EVENT_LOCATION_PRESETS}
              readOnly={role === 'parent' || role === 'student'}
            />
          )}

          {activeSection === 'users' && (
            <UsersSection
              users={users}
              newUser={newUser}
              setNewUser={setNewUser}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeSection === 'fee_schedules' && (
            <FeeSchedulesSection
              installments={feeInstallments}
              newInstallment={newFeeInstallment}
              setNewInstallment={setNewFeeInstallment}
              onCreate={handleCreateFeeInstallment}
              onUpdate={handleUpdateFeeInstallment}
              onDelete={handleDeleteFeeInstallment}
            />
          )}

          {activeSection === 'announcements' && (
            <CommunicationsSection
              announcements={announcements}
              newAnnouncement={newAnnouncement}
              setNewAnnouncement={setNewAnnouncement}
              onCreateAnnouncement={handleCreateAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              newParentMessage={newParentMessage}
              setNewParentMessage={setNewParentMessage}
              onSendParentMessage={handleSendParentMessage}
              classes={classes}
              emailConfigured={emailConfigured}
            />
          )}

          {activeSection === 'payments' && (
            <PaymentsSection
              totalDue={parentFeesTotal}
              amountPaid={parentFeesPaid}
              isAdmin={role === 'admin'}
              reminders={paymentReminders}
              receipts={paymentReceipts}
              newReminder={newReminder}
              setNewReminder={setNewReminder}
              onCreateReminder={handleCreateReminder}
              newReceipt={newReceipt}
              setNewReceipt={setNewReceipt}
              onCreateReceipt={handleCreateReceipt}
            />
          )}

          {activeSection === 'schedule' && (
            <ScheduleSection
              classes={classes}
              courses={courses}
              rooms={rooms}
              schedule={schedule}
              newSlot={newSlot}
              setNewSlot={setNewSlot}
              onCreateSlot={handleCreateSlot}
              getCourseName={getCourseName}
              dayOptions={DAY_OPTIONS}
              timeSlotOptions={TIME_SLOT_OPTIONS}
              readOnly={role === 'parent' || role === 'student'}
            />
          )}

          {activeSection === 'canteen' && (
            <CanteenSection
              items={canteenMenuItems}
              newItem={newCanteenItem}
              setNewItem={setNewCanteenItem}
              onCreateItem={handleCreateCanteenItem}
              dayOptions={DAY_OPTIONS}
              readOnly={role === 'student'}
            />
          )}

          {activeSection === 'transport' && (
            <TransportSection
              routes={transportRoutesForView}
              newRoute={newTransportRoute}
              setNewRoute={setNewTransportRoute}
              onCreateRoute={handleCreateTransportRoute}
              onUpdateRouteStudents={handleUpdateRouteStudents}
              readOnly={role === 'parent' || role === 'student'}
              students={students}
              currentStudentId={role === 'student' ? currentStudentId : undefined}
              onStudentIdChange={role === 'student' ? handleStudentIdChange : undefined}
            />
          )}

          {activeSection === 'attendance' && (
            <AttendanceSection
              classes={classes}
              students={students}
              records={attendanceRecords}
              setRecords={setAttendanceRecords}
              onStatusChange={handleAttendanceStatusChange}
            />
          )}

          {(activeSection === 'grades' || activeSection === 'exams') && (
            <GradesSection
              classes={classes}
              courses={courses}
              students={students}
              evaluations={evaluations}
              grades={grades}
              newEvaluation={newEvaluation}
              setNewEvaluation={setNewEvaluation}
              onCreateEvaluation={handleCreateEvaluation}
              onUpdateGrade={handleUpdateGrade}
            />
          )}

          {activeSection === 'sis' && (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => setActiveSection('students')}>
                <CardHeader>
                  <CardTitle className='text-base'>Élèves</CardTitle>
                  <CardDescription>Dossiers, affectations et listes par classe.</CardDescription>
                </CardHeader>
              </Card>
              <Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => setActiveSection('parents')}>
                <CardHeader>
                  <CardTitle className='text-base'>Parents & tuteurs</CardTitle>
                  <CardDescription>Contacts et rattachements aux élèves.</CardDescription>
                </CardHeader>
              </Card>
              <Card className='cursor-pointer transition-shadow hover:shadow-md' onClick={() => setActiveSection('classes')}>
                <CardHeader>
                  <CardTitle className='text-base'>Classes</CardTitle>
                  <CardDescription>Structure des niveaux et effectifs.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {activeSection === 'curriculum' && (
            <div className='space-y-4 max-w-2xl'>
              <p className='text-sm text-muted-foreground'>
                Reliez vos référentiels pédagogiques aux matières et cours de l’établissement. Utilisez les
                modules Matières et Cours pour structurer votre offre.
              </p>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' variant='secondary' onClick={() => setActiveSection('matieres')}>
                  Ouvrir les matières
                </Button>
                <Button type='button' variant='secondary' onClick={() => setActiveSection('courses')}>
                  Ouvrir les cours
                </Button>
                <Button type='button' variant='outline' onClick={() => setActiveSection('schedule')}>
                  Voir l’emploi du temps
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'permissions' && (
            <PermissionsSection onOpenUsers={() => setActiveSection('users')} />
          )}

          {isSchoolSettingsSection(activeSection) && (
            <SchoolSettingsContent section={activeSection} onNavigate={setActiveSection} />
          )}

          {activeSection === 'billing' && (
            <Card className='max-w-xl'>
              <CardHeader>
                <CardTitle className='text-base'>Facturation plateforme</CardTitle>
                <CardDescription>
                  Abonnement à l’application, factures et moyens de paiement — distinct des frais de scolarité gérés
                  dans Finances.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              classes={classes}
              students={students}
              attendance={attendanceRecords}
              reminders={paymentReminders}
              receipts={paymentReceipts}
            />
          )}
        </main>
      </SidebarInset>

      <StudentIdCardModal
        open={idCardOpen}
        onClose={() => setIdCardOpen(false)}
        card={idCardData}
        loading={idCardLoading}
      />
    </SidebarProvider>
  );
};

