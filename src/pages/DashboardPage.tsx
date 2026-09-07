import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

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
  fetchGradeModificationRequests,
  submitGradeModificationRequestOnBackend,
  approveGradeModificationRequestOnBackend,
  rejectGradeModificationRequestOnBackend,
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
  createDriverOnBackend,
  createUserOnBackend,
  deleteAnnouncementOnBackend,
  fetchLatestSchoolFromBackend,
  fetchCommunicationStatusOnBackend,
  sendParentMessageOnBackend,
  deleteClassOnBackend,
  deleteFeeInstallmentOnBackend,
  deleteParentOnBackend,
  deleteStudentOnBackend,
  deleteTeacherOnBackend,
  deleteDriverOnBackend,
  deleteUserOnBackend,
  downloadStudentRosterDocx,
  fetchStudentIdCardOnBackend,
  fetchTeacherIdCardOnBackend,
  isBackendApiConfigured,
  BACKEND_REQUIRED_MESSAGE,
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
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { formatTimeRange } from '@/lib/schedule-time';
import { applySchoolBranding } from '@/lib/school-branding';
import { UserPortalSidebarLink } from '@/components/UserPortalSidebarLink';

import {
  fetchAndCacheSchoolProfile,
  getSchoolProfile,
  getSystemBadgeClass,
  getSystemLabel,
  saveSchoolProfile,
  buildSchoolProfile,
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
  type StudentIdCardData,
  type TeacherIdCardData,
  type NewEventFormState,
  type NewPaymentReceiptFormState,
  type NewPaymentReminderFormState,
  type NewTransportRouteFormState,
  type AppUserRole,
  type ParentContact,
  type PaymentReceipt,
  type PaymentReminder,
  type Room,
  type ScheduleItem,
  type SectionId,
  type Student,
  type StudentGrade,
  type GradeModificationRequest,
  type Teacher,
  type TransportRoute,
  type Driver,
} from './dashboard/dashboardTypes';
import { isCompleteEmail } from '@/components/refine-ui/form/email-with-at-separator';
import { CommunicationsSection } from './dashboard/CommunicationsSection';
import { DashboardSidebarNav } from './dashboard/DashboardSidebarNav';
import { getDashboardSectionIds } from './dashboard/dashboardNavConfig';
import { CalendarSection } from './dashboard/CalendarSection';
import { FeeSchedulesSection } from './dashboard/FeeSchedulesSection';
import { StudentIdCardModal } from './dashboard/StudentIdCardModal';
import { TeacherIdCardModal } from './dashboard/TeacherIdCardModal';
import { CanteenSection } from './dashboard/CanteenSection';
import { ClassesSection } from './dashboard/ClassesSection';
import { BillingSection } from './dashboard/BillingSection';
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
import type { TeacherCreatePayload } from './dashboard/TeacherCreateWizard';
import type { StudentCreatePayload } from './dashboard/StudentCreateWizard';
import type { ParentCreatePayload } from './dashboard/ParentCreateWizard';
import type { ClassCreatePayload } from './dashboard/ClassCreateWizard';
import type { DriverCreatePayload } from './dashboard/DriverCreateWizard';
import type { CourseCreatePayload } from './dashboard/CourseCreateWizard';
import type { UserCreatePayload } from './dashboard/UserCreateWizard';
import type { RoomCreatePayload } from './dashboard/RoomCreateWizard';
import type { MatiereCreatePayload } from './dashboard/MatiereCreateWizard';
import type { CanteenCreatePayload } from './dashboard/CanteenCreateWizard';
import type { ScheduleSlotCreatePayload } from './dashboard/ScheduleSlotCreateWizard';
import type { FeeInstallmentCreatePayload } from './dashboard/FeeInstallmentCreateWizard';
import { TransportSection } from './dashboard/TransportSection';
import { ReportsSection } from './dashboard/ReportsSection';
import { PermissionsSection } from './dashboard/PermissionsSection';
import { UsersSection } from './dashboard/UsersSection';
import { GradesSection } from './dashboard/GradesSection';
import { isSchoolSettingsSection, SchoolSettingsContent } from './dashboard/SchoolSettingsPanels';
import { SystemRegistrySection } from './dashboard/SystemRegistrySection';
import logoSrc from '@/assets/logo/newgee-logo.png';
import { LanguageSwitcher } from '@/components/refine-ui/layout/language-switcher';

import './dashboard-shell.css';

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

  React.useEffect(() => {
    applySchoolBranding();
  }, []);

  const currentNavSectionIds = React.useMemo(
    () => (role ? getDashboardSectionIds(role) : []),
    [role],
  );
  const [activeSection, setActiveSection] = React.useState<SectionId>('overview');
  const [currentStudentId, setCurrentStudentId] = React.useState<string | null>(() => getStoredStudentId());

  React.useEffect(() => {
    if (role && currentNavSectionIds.length > 0 && !currentNavSectionIds.includes(activeSection)) {
      setActiveSection(currentNavSectionIds[0]);
    }
  }, [role, currentNavSectionIds, activeSection]);

  const backendSync = isBackendApiConfigured();

  const requireBackend = (): boolean => {
    if (backendSync) return true;
    toast.error(BACKEND_REQUIRED_MESSAGE, { richColors: true });
    return false;
  };

  const teacherCreateFormRef = React.useRef<HTMLDivElement>(null);
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
  const [licensedStudentCount, setLicensedStudentCount] = React.useState<number | null>(() => {
    const profile = getSchoolProfile();
    return profile?.studentCount ?? null;
  });
  const [licensedTeacherCount, setLicensedTeacherCount] = React.useState<number | null>(() => {
    const profile = getSchoolProfile();
    return profile?.teacherCount ?? null;
  });
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
      if (existing && !cancelled) {
        setSchoolProfile(existing);
        if (existing.studentCount != null) setLicensedStudentCount(existing.studentCount);
        if (existing.teacherCount != null) setLicensedTeacherCount(existing.teacherCount);
      }

      try {
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? (JSON.parse(userRaw) as { schoolId?: string }) : null;
        if (user?.schoolId) {
          const fetched = await fetchAndCacheSchoolProfile(user.schoolId);
          if (!cancelled && fetched) {
            setSchoolProfile(fetched);
            if (fetched.studentCount != null) setLicensedStudentCount(fetched.studentCount);
            if (fetched.teacherCount != null) setLicensedTeacherCount(fetched.teacherCount);
          }
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

  React.useEffect(() => {
    if (!backendSync || role !== 'admin') return;
    let cancelled = false;
    void fetchLatestSchoolFromBackend()
      .then((school) => {
        if (cancelled || !school) return;
        setLicensedStudentCount(school.studentCount ?? null);
        setLicensedTeacherCount(school.teacherCount ?? null);

        const profile = buildSchoolProfile({
          id: school.id,
          name: school.name ?? '',
          type: school.type ?? '',
          system: school.system,
          country: school.country,
          city: school.city,
          studentCount: school.studentCount ?? null,
          teacherCount: school.teacherCount ?? null,
          series: Array.isArray(school.series) ? school.series : undefined,
        });
        if (profile) {
          saveSchoolProfile(profile);
          setSchoolProfile(profile);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLicensedStudentCount(null);
          setLicensedTeacherCount(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [backendSync, role]);
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

  const [users, setUsers] = React.useState<AppUser[]>([]);

  const defaultAcademicYear = React.useMemo(() => {
    const y = new Date().getFullYear();
    return `${y}-${y + 1}`;
  }, []);

  const [feeInstallments, setFeeInstallments] = React.useState<FeeInstallment[]>([]);

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
  const [teacherIdCardOpen, setTeacherIdCardOpen] = React.useState(false);
  const [teacherIdCardLoading, setTeacherIdCardLoading] = React.useState(false);
  const [teacherIdCardData, setTeacherIdCardData] = React.useState<TeacherIdCardData | null>(null);

  const [paymentReminders, setPaymentReminders] = React.useState<PaymentReminder[]>([]);
  const [paymentReceipts, setPaymentReceipts] = React.useState<PaymentReceipt[]>([]);
  const [selectedParentContactId, setSelectedParentContactId] = React.useState('');

  const linkedParentContacts = React.useMemo(() => {
    if (role !== 'parent' || !sessionUser) return [];
    const email = sessionUser.email?.trim().toLowerCase();
    const name = sessionUser.name?.trim().toLowerCase();
    return parents.filter((parent) => {
      const parentEmail = parent.email?.trim().toLowerCase();
      const parentName = parent.name?.trim().toLowerCase();
      return (email && parentEmail && parentEmail === email) || (name && parentName && parentName === name);
    });
  }, [role, sessionUser, parents]);

  const activeParentContact = React.useMemo(() => {
    if (linkedParentContacts.length === 0) return null;
    return (
      linkedParentContacts.find((parent) => parent.id === selectedParentContactId) ??
      linkedParentContacts[0]
    );
  }, [linkedParentContacts, selectedParentContactId]);

  React.useEffect(() => {
    if (linkedParentContacts.length === 0) {
      setSelectedParentContactId('');
      return;
    }
    if (!linkedParentContacts.some((parent) => parent.id === selectedParentContactId)) {
      setSelectedParentContactId(linkedParentContacts[0].id);
    }
  }, [linkedParentContacts, selectedParentContactId]);

  const paymentRecordsForViewer = React.useMemo(() => {
    if (role !== 'parent' || !activeParentContact) {
      return { reminders: paymentReminders, receipts: paymentReceipts };
    }
    const childName = students.find((student) => student.id === activeParentContact.studentId)?.name;
    const parentName = activeParentContact.name.trim().toLowerCase();
    const matchesFamily = (parentNameValue: string, studentNameValue?: string) => {
      if (parentNameValue.trim().toLowerCase() !== parentName) return false;
      if (!childName || !studentNameValue) return true;
      return studentNameValue.trim() === childName;
    };
    return {
      reminders: paymentReminders.filter((reminder) =>
        matchesFamily(reminder.parentName, reminder.studentName)
      ),
      receipts: paymentReceipts.filter((receipt) =>
        matchesFamily(receipt.parentName, receipt.studentName)
      ),
    };
  }, [role, activeParentContact, paymentReminders, paymentReceipts, students]);

  const parentFeesTotal = React.useMemo(
    () => paymentRecordsForViewer.reminders.reduce((sum, r) => sum + (r.amount || 0), 0),
    [paymentRecordsForViewer.reminders],
  );
  const parentFeesPaid = React.useMemo(
    () => paymentRecordsForViewer.receipts.reduce((sum, r) => sum + (r.amount || 0), 0),
    [paymentRecordsForViewer.receipts],
  );
  const [newReminder, setNewReminder] = React.useState<NewPaymentReminderFormState>({
    parentContactId: '',
    parentName: '',
    studentName: '',
    amount: '',
    dueDate: '',
    note: '',
  });
  const [newReceipt, setNewReceipt] = React.useState<NewPaymentReceiptFormState>({
    parentContactId: '',
    parentName: '',
    studentName: '',
    amount: '',
    date: '',
    reference: '',
  });

  const [canteenMenuItems, setCanteenMenuItems] = React.useState<CanteenMenuItem[]>([]);

  const [transportRoutes, setTransportRoutes] = React.useState<TransportRoute[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [newTransportRoute, setNewTransportRoute] =
    React.useState<NewTransportRouteFormState>({
      name: '',
      driverId: '',
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
  const [gradeModificationRequests, setGradeModificationRequests] = React.useState<
    GradeModificationRequest[]
  >([]);
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
      setDrivers,
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

  const reloadGradeModificationRequests = React.useCallback(async () => {
    if (!backendSync || (role !== 'admin' && role !== 'teacher')) return;
    try {
      const rows = await fetchGradeModificationRequests();
      setGradeModificationRequests(rows);
    } catch (err) {
      console.error('Failed to load grade modification requests', err);
    }
  }, [backendSync, role]);

  React.useEffect(() => {
    void reloadGradeModificationRequests();
  }, [reloadGradeModificationRequests, activeSection]);

  const getTeacherName = (id?: string) =>
    id ? teachers.find((t) => t.id === id)?.name ?? '—' : '—';

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? 'Classe inconnue';

  const scrollToTeacherForm = () => {
    teacherCreateFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const handleCreateParent = async (payload: ParentCreatePayload) => {
    if (!payload.firstName.trim() || !payload.lastName.trim()) {
      return;
    }
    if (!payload.email?.trim() && !payload.phone?.trim()) {
      toast.error("L'e-mail ou le téléphone de contact est requis.");
      return;
    }
    const body = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      studentId: payload.studentId || undefined,
    };
    try {
      if (!requireBackend()) return;
      const created = await createParentOnBackend(body);
      setParents((prev) => [...prev, created]);
      await syncPortalUsers();
      toast.success('Parent et compte portail créés');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleUpdateParent = async (
    id: string,
    data: {
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      studentId?: string;
      password?: string;
    }
  ) => {
    try {
      if (!requireBackend()) return;
      const updated = await updateParentOnBackend(id, data);
      setParents((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await syncPortalUsers();
      toast.success('Parent mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteParent = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteParentOnBackend(id);
      await syncPortalUsers();
      setParents((prev) => prev.filter((p) => p.id !== id));
      toast.success('Parent supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateUser = async (payload: UserCreatePayload) => {
    if (!payload.name.trim() || (!payload.email?.trim() && !payload.phone?.trim())) return;
    const body = {
      name: payload.name.trim(),
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      role: payload.role,
      password: payload.password?.trim() || undefined,
    };
    try {
      if (!requireBackend()) return;
      const created = await createUserOnBackend(body);
      setUsers((prev) => [...prev, created]);
      toast.success('Utilisateur créé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleUpdateUser = async (
    id: string,
    data: { name: string; email?: string; phone?: string; role: AppUserRole; password?: string }
  ) => {
    try {
      if (!requireBackend()) return;
      const updated = await updateUserOnBackend(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('Utilisateur mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteUserOnBackend(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Utilisateur supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedParent = newReminder.parentContactId
      ? parents.find((parent) => parent.id === newReminder.parentContactId)
      : undefined;
    const parentName = (newReminder.parentName || selectedParent?.name || '').trim();
    const studentName =
      newReminder.studentName.trim() ||
      (selectedParent?.studentId
        ? students.find((student) => student.id === selectedParent.studentId)?.name
        : undefined);
    if (!parentName || !newReminder.amount.trim()) return;
    if (!requireBackend()) return;
    const reminder = {
      id: `rem-${Date.now()}`,
      parentName,
      studentName: studentName || undefined,
      amount: Number(newReminder.amount || 0),
      dueDate: newReminder.dueDate,
      status: 'Envoyé' as const,
    };
    try {
      await createPaymentReminderOnBackend({
        parentName: reminder.parentName,
        studentName: reminder.studentName,
        amount: reminder.amount,
        dueDate: reminder.dueDate || new Date().toISOString().slice(0, 10),
      });
      setPaymentReminders((prev) => [...prev, reminder]);
      setNewReminder({
        parentContactId: '',
        parentName: '',
        studentName: '',
        amount: '',
        dueDate: '',
        note: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedParent = newReceipt.parentContactId
      ? parents.find((parent) => parent.id === newReceipt.parentContactId)
      : undefined;
    const parentName = (newReceipt.parentName || selectedParent?.name || '').trim();
    const studentName =
      newReceipt.studentName.trim() ||
      (selectedParent?.studentId
        ? students.find((student) => student.id === selectedParent.studentId)?.name
        : undefined);
    if (!parentName || !newReceipt.amount.trim()) return;
    if (!requireBackend()) return;
    const reference =
      newReceipt.reference.trim() || `RECU-${new Date().getFullYear()}-${Date.now()}`;
    const receipt = {
      id: `rec-${Date.now()}`,
      parentName,
      studentName: studentName || undefined,
      amount: Number(newReceipt.amount || 0),
      date: newReceipt.date || new Date().toISOString().slice(0, 10),
      reference,
    };
    try {
      await createPaymentReceiptOnBackend(receipt);
      setPaymentReceipts((prev) => [...prev, receipt]);
      setNewReceipt({
        parentContactId: '',
        parentName: '',
        studentName: '',
        amount: '',
        date: '',
        reference: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateCanteenItem = async (payload: CanteenCreatePayload) => {
    if (!payload.dish.trim() || !payload.day) return;
    if (!requireBackend()) return;
    try {
      const created = await createCanteenOnBackend({
        day: payload.day,
        mealType: payload.mealType,
        dish: payload.dish.trim(),
        note: payload.note?.trim() || undefined,
      });
      setCanteenMenuItems((prev) => [...prev, created]);
      toast.success('Plat ajouté au menu');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleCreateTransportRoute = async (
    e: React.FormEvent,
    payload?: { waypoints?: { lat: number; lng: number; name: string }[]; routePolyline?: [number, number][] },
  ) => {
    e.preventDefault();
    const hasDriver = newTransportRoute.driverId.trim() || newTransportRoute.driverName.trim();
    if (!newTransportRoute.name.trim() || !hasDriver || !newTransportRoute.departureTime.trim()) return;
    if (!requireBackend()) return;
    try {
      const created = await createTransportOnBackend({
        name: newTransportRoute.name.trim(),
        driverId: newTransportRoute.driverId.trim() || undefined,
        driverName: newTransportRoute.driverName.trim() || undefined,
        departureTime: newTransportRoute.departureTime.trim(),
        returnTime: newTransportRoute.returnTime.trim() || undefined,
        note: newTransportRoute.note.trim() || undefined,
        waypoints: payload?.waypoints,
        routePolyline: payload?.routePolyline,
      });
      setTransportRoutes((prev) => [...prev, created]);
      setNewTransportRoute({
        name: '',
        driverId: '',
        driverName: '',
        departureTime: '',
        returnTime: '',
        note: '',
      });
      toast.success('Trajet enregistré');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateRouteStudents = async (routeId: string, studentIds: string[]) => {
    if (!requireBackend()) return;
    if (!routeId || routeId.startsWith('tr-')) {
      toast.error('Ce trajet doit être recréé : identifiant local invalide.');
      return;
    }
    try {
      const updated = await updateTransportStudentsOnBackend(routeId, studentIds);
      setTransportRoutes((prev) =>
        prev.map((r) => (r.id === routeId ? updated : r)),
      );
      toast.success('Élèves mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateDriver = async (payload: DriverCreatePayload) => {
    if (!payload.firstName.trim() || !payload.lastName.trim()) return;
    if (!payload.email?.trim() && !payload.phone?.trim()) {
      toast.error('E-mail ou téléphone requis pour le compte tracker.');
      return;
    }
    if (!requireBackend()) return;
    try {
      const created = await createDriverOnBackend({
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        staffId: payload.staffId?.trim() || undefined,
        licenseNumber: payload.licenseNumber?.trim() || undefined,
        email: payload.email?.trim() || undefined,
        password: payload.password?.trim() || undefined,
        phone: payload.phone?.trim() || undefined,
      });
      setDrivers((prev) => [...prev, created]);
      toast.success('Chauffeur créé — il peut se connecter au tracker');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!requireBackend()) return;
    try {
      await deleteDriverOnBackend(id);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      toast.success('Chauffeur supprimé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
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

  const handleCreateClass = async (payload: ClassCreatePayload) => {
    if (!payload.name.trim()) return;
    const typeForLevel = schoolTypes.length === 1 ? schoolTypes[0] : '';
    let levelLabel = payload.level.trim() || 'Niveau non défini';
    if (typeForLevel && payload.level.trim()) {
      levelLabel = `${typeForLevel} - ${payload.level.trim()}`;
    } else if (typeForLevel && levelOptions.length) {
      levelLabel = `${typeForLevel} - ${levelOptions[0]}`;
    }
    const body = {
      name: payload.name.trim(),
      level: levelLabel,
      studentsCount: payload.studentsCount,
      homeroomTeacherId: payload.homeroomTeacherId || undefined,
    };
    try {
      if (!requireBackend()) return;
      const created = await createClassOnBackend(body);
      setClasses((prev) => [...prev, created]);
      toast.success('Classe créée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleUpdateClass = async (
    id: string,
    data: { name: string; level: string; studentsCount: number; homeroomTeacherId?: string }
  ) => {
    try {
      if (!requireBackend()) return;
      const updated = await updateClassOnBackend(id, data);
      setClasses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success('Classe mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteClassOnBackend(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setStudents((prev) =>
        prev.map((s) => (s.classId === id ? { ...s, classId: undefined } : s))
      );
      toast.success('Classe supprimée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateTeacher = async (payload: TeacherCreatePayload) => {
    if (!payload.firstName.trim() || !payload.lastName.trim()) return;
    if (!isCompleteEmail(payload.email)) {
      toast.error('E-mail invalide ou incomplet.');
      return;
    }
    if (!payload.phone.trim()) {
      toast.error('Le téléphone mobile est obligatoire.');
      return;
    }
    const body = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      subject: payload.subject.trim() || 'Matière à définir',
      staffId: payload.staffId?.trim() || undefined,
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      homeroomClassIds: payload.homeroomClassIds,
      assignedClassIds: payload.assignedClassIds,
    };
    try {
      if (!requireBackend()) return;
      const created = await createTeacherOnBackend(body);
      setTeachers((prev) => [...prev, created]);
      applyHomeroomClasses(created.id, body.homeroomClassIds ?? []);
      await syncPortalUsers();
      toast.success('Enseignant créé avec compte portail');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const applyHomeroomClasses = (teacherId: string, homeroomClassIds: string[]) => {
    const idSet = new Set(homeroomClassIds);
    setClasses((prev) =>
      prev.map((c) => {
        if (idSet.has(c.id)) return { ...c, homeroomTeacherId: teacherId };
        if (c.homeroomTeacherId === teacherId) return { ...c, homeroomTeacherId: undefined };
        return c;
      })
    );
  };

  const handleUpdateTeacher = async (
    id: string,
    data: {
      firstName: string;
      lastName: string;
      subject: string;
      staffId?: string;
      email?: string;
      password?: string;
      phone?: string;
      homeroomClassIds?: string[];
      assignedClassIds?: string[];
    }
  ) => {
    try {
      if (!requireBackend()) return;
      const updated = await updateTeacherOnBackend(id, data);
      setTeachers((prev) => prev.map((t) => (t.id === id ? updated : t)));
      applyHomeroomClasses(id, data.homeroomClassIds ?? []);
      await syncPortalUsers();
      toast.success('Enseignant mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteTeacherOnBackend(id);
      await syncPortalUsers();
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

  const handleCreateStudent = async (payload: StudentCreatePayload) => {
    if (!payload.firstName.trim() || !payload.lastName.trim()) {
      return;
    }
    if (!payload.email?.trim() && !payload.phone?.trim()) {
      toast.error("L'e-mail ou le téléphone de contact est requis.");
      return;
    }
    const body = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      idCardNumber: payload.idCardNumber?.trim() || undefined,
      classId: payload.classId || undefined,
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
    };
    try {
      if (!requireBackend()) return;
      const created = await createStudentOnBackend(body);
      setStudents((prev) => [...prev, created]);
      await syncPortalUsers();
      toast.success('Élève et compte portail créés');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleUpdateStudent = async (
    id: string,
    data: {
      firstName: string;
      lastName: string;
      idCardNumber?: string;
      classId?: string;
      email?: string;
      phone?: string;
      password?: string;
    }
  ) => {
    try {
      if (!requireBackend()) return;
      const updated = await updateStudentOnBackend(id, data);
      setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
      await syncPortalUsers();
      toast.success('Élève mis à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteStudentOnBackend(id);
      await syncPortalUsers();
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
      if (!requireBackend()) return;
      const card = await fetchStudentIdCardOnBackend(studentId);
      setIdCardData(card);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                matricule: card.matricule,
                idCardNumber: card.idCardNumber,
              }
            : s
        )
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur carte scolaire');
      setIdCardOpen(false);
    } finally {
      setIdCardLoading(false);
    }
  };

  const handlePrintTeacherIdCard = async (teacherId: string) => {
    setTeacherIdCardOpen(true);
    setTeacherIdCardLoading(true);
    setTeacherIdCardData(null);
    try {
      if (!requireBackend()) return;
      const card = await fetchTeacherIdCardOnBackend(teacherId);
      setTeacherIdCardData(card);
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, staffId: card.staffId || t.staffId } : t))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur carte enseignant');
      setTeacherIdCardOpen(false);
    } finally {
      setTeacherIdCardLoading(false);
    }
  };

  const handleExportStudentRoster = async (classId?: string) => {
    try {
      if (!requireBackend()) return;
      await downloadStudentRosterDocx(classId);
      toast.success('Liste élèves exportée (Word)');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur export');
    }
  };

  const handleCreateFeeInstallment = async (payload: FeeInstallmentCreatePayload) => {
    if (!payload.label.trim() || !Number.isFinite(payload.amount)) return;
    try {
      if (!requireBackend()) return;
      const created = await createFeeInstallmentOnBackend({
        category: payload.category,
        academicYear: payload.academicYear.trim() || defaultAcademicYear,
        label: payload.label.trim(),
        amount: payload.amount,
        periodStart: payload.periodStart,
        periodEnd: payload.periodEnd,
        description: payload.description,
        sortOrder: payload.sortOrder,
      });
      setFeeInstallments((prev) => [...prev, created]);
      toast.success('Tranche ajoutée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleUpdateFeeInstallment = async (
    id: string,
    data: Omit<FeeInstallment, 'id'>
  ) => {
    try {
      if (!requireBackend()) return;
      const updated = await updateFeeInstallmentOnBackend(id, data);
      setFeeInstallments((prev) => prev.map((f) => (f.id === id ? updated : f)));
      toast.success('Tranche mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteFeeInstallment = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteFeeInstallmentOnBackend(id);
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
      if (!requireBackend()) return;
      const created = await createAnnouncementOnBackend(payload);
      setAnnouncements((prev) => [...prev, created]);
      if (newAnnouncement.notifyByEmail) {
        toast.success('Annonce publiée — e-mails en cours d’envoi');
      } else {
        toast.success('Annonce publiée');
      }
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
      if (!requireBackend()) return;
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
      if (!requireBackend()) return;
      const updated = await updateAnnouncementOnBackend(id, data);
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success('Annonce mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      if (!requireBackend()) return;
      await deleteAnnouncementOnBackend(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success('Annonce supprimée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateCourse = async (payload: CourseCreatePayload) => {
    if (!payload.matiereId) return;
    if (!requireBackend()) return;
    try {
      const created = await createCourseOnBackend({
        name: payload.name,
        matiereId: payload.matiereId,
        level: payload.level.trim() || 'Niveau non défini',
      });
      setCourses((prev) => [...prev, created]);
      toast.success('Cours créé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleCreateMatiere = async (payload: MatiereCreatePayload) => {
    if (!payload.name.trim()) return;
    if (!requireBackend()) return;
    try {
      const created = await createMatiereOnBackend(payload.name.trim());
      setMatieres((prev) => [...prev, created]);
      toast.success('Matière créée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.label.trim()) return;
    if (!requireBackend()) return;
    try {
      const created = await createEventOnBackend({
        label: newEvent.label.trim(),
        date: newEvent.date.trim() || 'Date à définir',
        time: newEvent.time.trim() || undefined,
        location: newEvent.location.trim() || undefined,
        type: newEvent.type,
      });
      setEvents((prev) => [...prev, created]);
      setNewEvent({
        label: '',
        date: '',
        time: '',
        location: '',
        type: 'Promotion',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateSlot = async (payload: ScheduleSlotCreatePayload) => {
    if (!payload.classId || !payload.day || !payload.timeStart || !payload.timeEnd) return;
    const timeLabel = formatTimeRange(payload.timeStart, payload.timeEnd);
    if (!timeLabel) return;
    if (!requireBackend()) return;
    try {
      const created = await createScheduleOnBackend({
        classId: payload.classId,
        courseId: payload.courseId || undefined,
        day: payload.day,
        time: timeLabel,
        room: payload.room || undefined,
      });
      setSchedule((prev) => [...prev, created]);
      toast.success('Créneau ajouté');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleCreateRoom = async (payload: RoomCreatePayload) => {
    if (!payload.name.trim()) return;
    if (!requireBackend()) return;
    try {
      const created = await createRoomOnBackend({
        name: payload.name.trim(),
        type: payload.type || 'Salle de classe',
        capacity: payload.capacity || undefined,
      });
      setRooms((prev) => [...prev, created]);
      toast.success('Salle créée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
      throw err;
    }
  };

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvaluation.classId || !newEvaluation.courseId || !newEvaluation.label.trim()) return;
    if (!requireBackend()) return;
    const coef = Number(newEvaluation.coefficient || '1') || 1;
    const maxScore = Number(newEvaluation.maxScore || '20') || 20;
    try {
      const created = await createEvaluationOnBackend({
        classId: newEvaluation.classId,
        courseId: newEvaluation.courseId,
        label: newEvaluation.label.trim(),
        date: newEvaluation.date || new Date().toISOString().slice(0, 10),
        period: newEvaluation.period,
        type: newEvaluation.type,
        coefficient: coef,
        maxScore,
      });
      setEvaluations((prev) => [...prev, created]);
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleUpdateGrade = (evaluationId: string, studentId: string, score: number | '') => {
    if (!requireBackend()) return;
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
    if (score !== '' && !Number.isNaN(score) && evaluationId && !evaluationId.startsWith('ev-')) {
      void createOrUpdateGradeOnBackend({
        evaluationId,
        studentId,
        score: Number(score),
      }).catch((err) => toast.error(err instanceof Error ? err.message : 'Erreur'));
    }
  };

  const handleSubmitGradeModificationRequest = async (payload: {
    evaluationId: string;
    studentId: string;
    requestedScore: number;
    reason: string;
  }) => {
    if (!requireBackend()) return;
    try {
      await submitGradeModificationRequestOnBackend(payload);
      await reloadGradeModificationRequests();
      toast.success('Demande envoyée à l\'administration');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleApproveGradeModificationRequest = async (id: string, adminNote?: string) => {
    if (!requireBackend()) return;
    try {
      const approved = await approveGradeModificationRequestOnBackend(id, adminNote);
      setGrades((prev) => {
        const idx = prev.findIndex(
          (g) =>
            g.evaluationId === approved.evaluationId && g.studentId === approved.studentId,
        );
        if (idx === -1) {
          return [
            ...prev,
            {
              id: `gr-${approved.evaluationId}-${approved.studentId}`,
              evaluationId: approved.evaluationId,
              studentId: approved.studentId,
              score: approved.requestedScore,
            },
          ];
        }
        const clone = [...prev];
        clone[idx] = { ...clone[idx], score: approved.requestedScore };
        return clone;
      });
      await reloadGradeModificationRequests();
      toast.success('Modification approuvée et note mise à jour');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleRejectGradeModificationRequest = async (id: string, adminNote?: string) => {
    if (!requireBackend()) return;
    try {
      await rejectGradeModificationRequestOnBackend(id, adminNote);
      await reloadGradeModificationRequests();
      toast.success('Demande refusée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleAttendanceStatusChange = (record: AttendanceRecord, isUpdate: boolean) => {
    if (!requireBackend()) return;
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
        <SidebarHeader className='dashboard-sidebar-header'>
          <div className='dashboard-sidebar-header__inner'>
            <img src={logoSrc} alt='NewGee' className='dashboard-sidebar-logo' />
            <SidebarTrigger className='dashboard-sidebar-trigger hidden md:inline-flex' />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <DashboardSidebarNav
            role={role}
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className='dashboard-sidebar-footer'>
          <div className='dashboard-user-pill flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Avatar className='dashboard-sidebar-avatar h-8 w-8 shrink-0'>
                <AvatarFallback>
                  {role === 'admin' ? 'AD' : role === 'teacher' ? 'EN' : role === 'parent' ? 'PA' : 'EL'}
                </AvatarFallback>
              </Avatar>
              <div className='dashboard-sidebar-footer-text min-w-0'>
                <p className='truncate text-sm font-medium leading-tight'>
                  {sessionUser?.name ?? (role === 'admin' ? 'Admin établissement' : role === 'teacher' ? 'Enseignant' : role === 'parent' ? 'Parent' : 'Élève')}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  {sessionUser?.email ?? roleTitles[role]}
                </p>
              </div>
            </div>
            <div className='dashboard-sidebar-footer-actions'>
              <UserPortalSidebarLink />
              <Button
                variant='ghost'
                size='sm'
                className='dashboard-sidebar-logout w-full justify-start text-xs'
                onClick={handleLogout}
              >
                <LogOut className='size-3.5 shrink-0' aria-hidden />
                <span className='dashboard-sidebar-logout-label'>Se déconnecter</span>
              </Button>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className='dashboard-header'>
          <div className='dashboard-header__row'>
            <SidebarTrigger className='md:hidden' />
            <div className='dashboard-header__lead'>
              <p className='sr-only'>{current.kicker}</p>
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
              {activeSection === 'teachers' && current.cta ? (
                <Button size='sm' onClick={scrollToTeacherForm}>
                  {current.cta}
                </Button>
              ) : null}
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
              schoolProfile={schoolProfile}
              declaredStudentCount={licensedStudentCount}
              declaredTeacherCount={licensedTeacherCount}
              totalDue={parentFeesTotal}
              amountPaid={parentFeesPaid}
              remindersCount={paymentRecordsForViewer.reminders.length}
              receipts={paymentRecordsForViewer.receipts}
              transportRoutes={transportRoutes}
            />
          )}

          {activeSection === 'classes' && (
            <ClassesSection
              classes={classes}
              teachers={teachers}
              licensedStudentCount={licensedStudentCount}
              onGoToBilling={() => setActiveSection('billing')}
              onCreateClass={handleCreateClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              getTeacherName={getTeacherName}
              levelOptions={levelOptions}
            />
          )}

          {activeSection === 'teachers' && (
            <TeachersSection
              teachers={teachers}
              classes={classes}
              matieres={matieres}
              onCreateTeacher={handleCreateTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onPrintIdCard={role === 'admin' ? handlePrintTeacherIdCard : undefined}
              onOpenMatieres={() => setActiveSection('matieres')}
              defaultPhoneCountry={schoolProfile?.country}
              getClassName={getClassName}
              createFormRef={teacherCreateFormRef}
            />
          )}

          {activeSection === 'students' && (
            <StudentsSection
              students={students}
              classes={classes}
              defaultPhoneCountry={schoolProfile?.country}
              licensedStudentCount={licensedStudentCount}
              onGoToBilling={() => setActiveSection('billing')}
              onCreateStudent={handleCreateStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onPrintIdCard={role === 'admin' ? handlePrintStudentIdCard : undefined}
              onExportRoster={role === 'admin' ? handleExportStudentRoster : undefined}
              getClassName={getClassName}
              readOnly={role === 'parent' || role === 'student'}
            />
          )}

          {activeSection === 'parents' && (
            <ParentsSection
              parents={parents}
              students={students}
              defaultPhoneCountry={schoolProfile?.country}
              onCreateParent={handleCreateParent}
              onUpdateParent={handleUpdateParent}
              onDeleteParent={handleDeleteParent}
            />
          )}

          {activeSection === 'courses' && (
            <CoursesSection
              courses={courses}
              onCreateCourse={handleCreateCourse}
              courseLevelOptions={courseLevelOptions}
              matieres={matieres}
              getMatiereName={getMatiereName}
              readOnly={role === 'student'}
            />
          )}

          {activeSection === 'matieres' && (
            <MatieresSection matieres={matieres} onCreateMatiere={handleCreateMatiere} />
          )}

          {activeSection === 'rooms' && (
            <RoomsSection
              rooms={rooms}
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
              defaultPhoneCountry={schoolProfile?.country}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeSection === 'fee_schedules' && (
            <FeeSchedulesSection
              installments={feeInstallments}
              defaultAcademicYear={defaultAcademicYear}
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
              viewerRole={role ?? undefined}
              parents={parents}
              students={students}
              linkedParentContacts={linkedParentContacts}
              selectedParentContactId={selectedParentContactId}
              onParentContactChange={setSelectedParentContactId}
              reminders={paymentRecordsForViewer.reminders}
              receipts={paymentRecordsForViewer.receipts}
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
              onCreateSlot={handleCreateSlot}
              getClassName={getClassName}
              getCourseName={getCourseName}
              dayOptions={DAY_OPTIONS}
              timeSlotOptions={TIME_SLOT_OPTIONS}
              readOnly={role === 'parent' || role === 'student'}
            />
          )}

          {activeSection === 'canteen' && (
            <CanteenSection
              items={canteenMenuItems}
              onCreateItem={handleCreateCanteenItem}
              dayOptions={DAY_OPTIONS}
              readOnly={role === 'student'}
            />
          )}

          {activeSection === 'transport' && (
            <TransportSection
              routes={transportRoutesForView}
              drivers={drivers}
              newRoute={newTransportRoute}
              setNewRoute={setNewTransportRoute}
              onCreateRoute={handleCreateTransportRoute}
              onUpdateRouteStudents={handleUpdateRouteStudents}
              defaultPhoneCountry={schoolProfile?.country}
              onCreateDriver={handleCreateDriver}
              onDeleteDriver={handleDeleteDriver}
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
              gradeModificationRequests={gradeModificationRequests}
              isAdmin={role === 'admin'}
              newEvaluation={newEvaluation}
              setNewEvaluation={setNewEvaluation}
              onCreateEvaluation={handleCreateEvaluation}
              onUpdateGrade={handleUpdateGrade}
              onSubmitGradeModificationRequest={handleSubmitGradeModificationRequest}
              onApproveGradeModificationRequest={handleApproveGradeModificationRequest}
              onRejectGradeModificationRequest={handleRejectGradeModificationRequest}
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
            <BillingSection
              licensedStudentCount={licensedStudentCount}
              classes={classes}
              enrolledCount={students.length}
              onCapacityUpdated={setLicensedStudentCount}
            />
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
      <TeacherIdCardModal
        open={teacherIdCardOpen}
        onClose={() => setTeacherIdCardOpen(false)}
        card={teacherIdCardData}
        loading={teacherIdCardLoading}
      />
    </SidebarProvider>
  );
};

