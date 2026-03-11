import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  BookOpen,
  Calendar,
  Car,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

import { getStoredRole, clearStoredRole, getStoredStudentId, setStoredStudentId, type UserRole } from '@/lib/auth';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import {
  COURSE_LEVEL_OPTIONS,
  DAY_OPTIONS,
  EVENT_LOCATION_PRESETS,
  EVENT_TIME_PRESETS,
  LEVELS_BY_SCHOOL_TYPE,
  ROOM_TYPE_OPTIONS,
  SCHOOL_TYPES,
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
  type NewEvaluationFormState,
  type NewCanteenItemFormState,
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
import { CalendarSection } from './dashboard/CalendarSection';
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
import { UsersSection } from './dashboard/UsersSection';
import { GradesSection } from './dashboard/GradesSection';

const navItems: { id: SectionId; label: string; icon: React.ComponentType<any> }[] =
  [
    { id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'teachers', label: 'Enseignants', icon: BookOpen },
    { id: 'students', label: 'Élèves', icon: Users },
    { id: 'parents', label: 'Parents', icon: Users },
    { id: 'courses', label: 'Cours', icon: BookOpen },
    { id: 'matieres', label: 'Matières', icon: BookOpen },
    { id: 'rooms', label: 'Salles', icon: MapPin },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'schedule', label: 'Emploi du temps', icon: ClipboardList },
    { id: 'grades', label: 'Notes & bulletins', icon: BarChart2 },
    { id: 'attendance', label: 'Présences', icon: CheckSquare },
    { id: 'payments', label: 'Paiements', icon: Wallet },
    { id: 'canteen', label: 'Cantine', icon: Utensils },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'reports', label: 'Rapports', icon: BarChart2 },
    { id: 'users', label: 'Administration', icon: ShieldCheck },
  ];

const roleNavItems: Record<UserRole, { id: SectionId; label: string; icon: React.ComponentType<any> }[]> = {
  admin: navItems,
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
};

const roleTitles: Record<UserRole, string> = {
  admin: 'Tableau de bord',
  teacher: 'Espace enseignant',
  parent: 'Espace parent',
  student: 'Espace élève',
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
    cta: 'Ajouter une classe',
  },
  classes: {
    kicker: 'Pilotage des classes',
    title: 'Organisation des classes',
    description:
      'Visualisez vos niveaux, les effectifs et les professeurs principaux pour chaque classe.',
    cta: 'Créer une classe',
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
  grades: {
    kicker: 'Gestion des notes',
    title: 'Notes & bulletins (démo)',
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
      'Obtenez une vue globale sur les présences et les paiements (mode démo, sans backend).',
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
    reports: { kicker: 'Rapports', title: 'Rapports famille', description: 'Vue simplifiée des présences et paiements (démo).', cta: '' },
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

const initialTeachers: Teacher[] = [
  { id: 't1', initials: 'JD', name: 'Jean Dupont', subject: 'Mathématiques' },
  { id: 't2', initials: 'ML', name: 'Marie Leroy', subject: 'Français' },
  { id: 't3', initials: 'SB', name: 'Sophie Bernard', subject: 'Histoire-Géographie' },
];

const initialClasses: ClassItem[] = [
  {
    id: 'c1',
    name: '6ème A',
    level: 'Collège - 6ème',
    studentsCount: 24,
    homeroomTeacherId: 't1',
  },
  {
    id: 'c2',
    name: '3ème C',
    level: 'Collège - 3ème',
    studentsCount: 22,
    homeroomTeacherId: 't2',
  },
];

const initialCourses: Course[] = [
  { id: 'co1', name: 'Mathématiques', level: 'Collège' },
  { id: 'co2', name: 'Français', level: 'Collège' },
  { id: 'co3', name: 'Histoire-Géographie', level: 'Collège / Lycée' },
];

const initialRooms: Room[] = [
  { id: 'r1', name: 'Salle 101', type: 'Salle de classe', capacity: 30 },
  { id: 'r2', name: 'Salle 102', type: 'Salle de classe', capacity: 28 },
  { id: 'r3', name: 'Salle polyvalente', type: 'Salle de réunion', capacity: 80 },
  { id: 'r4', name: 'Salle des professeurs', type: 'Salle de réunion', capacity: 20 },
];

const initialEvents: CalendarEvent[] = [
  {
    id: 'e1',
    label: 'Promotion des 3ème vers le lycée',
    date: '15 juin 2025',
    time: '18h00',
    location: 'Salle polyvalente',
    type: 'Promotion',
  },
  {
    id: 'e2',
    label: 'Conseils de classe du 2ème trimestre',
    date: 'Du 2 au 6 avril',
    location: 'Salle des professeurs',
    type: 'Réunion',
  },
];

const initialSchedule: ScheduleItem[] = [
  {
    id: 's1',
    classId: 'c1',
    courseId: 'co1',
    day: 'Lundi',
    time: '8h00 – 9h00',
    room: 'Salle 101',
  },
  {
    id: 's2',
    classId: 'c1',
    courseId: 'co2',
    day: 'Lundi',
    time: '9h00 – 10h00',
    room: 'Salle 101',
  },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const role = getStoredRole();

  React.useEffect(() => {
    if (!role) navigate('/login', { replace: true });
  }, [role, navigate]);

  const currentNavItems = role ? roleNavItems[role] : [];
  const [activeSection, setActiveSection] = React.useState<SectionId>('overview');
  const [currentStudentId, setCurrentStudentId] = React.useState<string | null>(() => getStoredStudentId());

  React.useEffect(() => {
    if (role && currentNavItems.length > 0 && !currentNavItems.some((i) => i.id === activeSection)) {
      setActiveSection(currentNavItems[0].id);
    }
  }, [role, currentNavItems, activeSection]);

  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers);
  const [classes, setClasses] = React.useState<ClassItem[]>(initialClasses);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [parents, setParents] = React.useState<ParentContact[]>([]);
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [matieres, setMatieres] = React.useState<Matiere[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>(initialRooms);
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);
  const [schedule, setSchedule] =
    React.useState<ScheduleItem[]>(initialSchedule);

  const [schoolTypes] = React.useState<SchoolType[]>(() => {
    // En réel: viendra du backend. Ici, on relit le type choisi à l'inscription.
    try {
      const raw = window.localStorage.getItem('classroom_school_profile');
      if (raw) {
        const data = JSON.parse(raw) as { type?: string } | null;
        if (data?.type && SCHOOL_TYPES.includes(data.type as SchoolType)) {
          return [data.type as SchoolType];
        }
      }
    } catch {
      // ignore parse errors
    }
    return [...SCHOOL_TYPES];
  });
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
  });
  const [teacherSubjectPreset, setTeacherSubjectPreset] = React.useState('');

  const [newStudent, setNewStudent] =
    React.useState<NewStudentFormState>({
      name: '',
      classId: '',
    });

  const [newParent, setNewParent] = React.useState<NewParentFormState>({
    name: '',
    phone: '',
    email: '',
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
    role: 'teacher',
  });

  const [parentFeesTotal] = React.useState(350000);
  const [parentFeesPaid] = React.useState(150000);

  const [paymentReminders, setPaymentReminders] = React.useState<PaymentReminder[]>([]);
  const [paymentReceipts, setPaymentReceipts] = React.useState<PaymentReceipt[]>([]);
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

  const getTeacherName = (id?: string) =>
    id ? teachers.find((t) => t.id === id)?.name ?? '—' : '—';

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? 'Classe inconnue';

  const getCourseName = (id?: string) =>
    id ? courses.find((c) => c.id === id)?.name ?? '—' : '—';

  const getMatiereName = (id?: string) =>
    id ? matieres.find((m) => m.id === id)?.name ?? '—' : '—';

  const handleCreateParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParent.name.trim()) return;
    const id = `p-${Date.now()}`;
    setParents((prev) => [
      ...prev,
      {
        id,
        name: newParent.name.trim(),
        phone: newParent.phone.trim() || undefined,
        email: newParent.email.trim() || undefined,
        studentId: newParent.studentId || undefined,
      },
    ]);
    setNewParent({
      name: '',
      phone: '',
      email: '',
      studentId: '',
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const id = `u-${Date.now()}`;
    setUsers((prev) => [
      ...prev,
      {
        id,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
      },
    ]);
    setNewUser({ name: '', email: '', role: 'teacher' });
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.parentName.trim() || !newReminder.amount.trim()) return;
    const id = `rem-${Date.now()}`;
    setPaymentReminders((prev) => [
      ...prev,
      {
        id,
        parentName: newReminder.parentName.trim(),
        studentName: newReminder.studentName.trim() || undefined,
        amount: Number(newReminder.amount || 0),
        dueDate: newReminder.dueDate,
        status: 'Envoyé',
      },
    ]);
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
    setPaymentReceipts((prev) => [
      ...prev,
      {
        id,
        parentName: newReceipt.parentName.trim(),
        studentName: newReceipt.studentName.trim() || undefined,
        amount: Number(newReceipt.amount || 0),
        date: newReceipt.date || new Date().toISOString().slice(0, 10),
        reference,
      },
    ]);
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
    setCanteenMenuItems((prev) => [
      ...prev,
      {
        id,
        day: newCanteenItem.day,
        mealType: newCanteenItem.mealType,
        dish: newCanteenItem.dish.trim(),
        note: newCanteenItem.note.trim() || undefined,
      },
    ]);
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

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;
    const id = `c-${Date.now()}`;
    const typeForLevel =
      newClass.schoolType || (schoolTypes.length === 1 ? schoolTypes[0] : '');
    let levelLabel = newClass.level.trim() || 'Niveau non défini';
    if (typeForLevel && newClass.level.trim()) {
      levelLabel = `${typeForLevel} - ${newClass.level.trim()}`;
    } else if (typeForLevel && LEVELS_BY_SCHOOL_TYPE[typeForLevel as SchoolType]?.length) {
      levelLabel = `${typeForLevel} - ${LEVELS_BY_SCHOOL_TYPE[typeForLevel as SchoolType][0]}`;
    }
    setClasses((prev) => [
      ...prev,
      {
        id,
        name: newClass.name.trim(),
        level: levelLabel,
        studentsCount: Number(newClass.studentsCount || 0),
        homeroomTeacherId: newClass.homeroomTeacherId || undefined,
      },
    ]);
    setNewClass({
      name: '',
      schoolType: '',
      level: '',
      studentsCount: '',
      homeroomTeacherId: '',
    });
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name.trim()) return;
    const id = `t-${Date.now()}`;
    const initials = newTeacher.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
    setTeachers((prev) => [
      ...prev,
      {
        id,
        initials: initials || 'ED',
        name: newTeacher.name.trim(),
        subject: newTeacher.subject.trim() || 'Matière à définir',
      },
    ]);
    setNewTeacher({ name: '', subject: '' });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;
    const id = `st-${Date.now()}`;
    setStudents((prev) => [
      ...prev,
      {
        id,
        name: newStudent.name.trim(),
        classId: newStudent.classId || undefined,
      },
    ]);
    setNewStudent({ name: '', classId: '' });
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
    setEvaluations((prev) => [
      ...prev,
      {
        id,
        classId: newEvaluation.classId,
        courseId: newEvaluation.courseId,
        label: newEvaluation.label.trim(),
        date: newEvaluation.date || new Date().toISOString().slice(0, 10),
        period: newEvaluation.period,
        type: newEvaluation.type,
        coefficient: coef,
        maxScore,
      },
    ]);
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
  };

  const handleChangeRole = () => {
    clearStoredRole();
    navigate('/login');
  };

  if (!role) return null;

  return (
    <SidebarProvider>
      <Sidebar collapsible='icon' variant='inset'>
        <SidebarHeader>
          <div className='flex items-center gap-2 px-2'>
            <div className='size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold'>
              CL
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-semibold leading-tight'>
                Classroom
              </span>
              <span className='text-[11px] text-muted-foreground'>
                {roleTitles[role]}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
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
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className='flex flex-col gap-2 px-2 py-1.5'>
            <div className='flex items-center gap-2'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback>
                  {role === 'admin' ? 'AD' : role === 'teacher' ? 'EN' : role === 'parent' ? 'PA' : 'EL'}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium leading-tight'>
                  {role === 'admin' ? 'Admin établissement' : role === 'teacher' ? 'Enseignant' : role === 'parent' ? 'Parent' : 'Élève'}
                </p>
                <p className='truncate text-xs text-muted-foreground'>
                  Mode test
                </p>
              </div>
            </div>
            <Button variant='ghost' size='sm' className='w-full justify-start text-xs' onClick={handleChangeRole}>
              Changer de rôle
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className='border-b px-4 md:px-6 py-3 md:py-4'>
          {/* Ligne 1 : bouton d’extension du menu, toujours en haut à gauche */}
          <div className='flex items-center justify-between md:justify-start mb-3'>
            <SidebarTrigger />
          </div>

          {/* Ligne 2 : titre + actions, avec layout colonne sur mobile et rangée sur desktop */}
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                {current.kicker}
              </p>
              <h1 className='text-xl font-semibold leading-tight'>
                {current.title}
              </h1>
              <p className='text-xs text-muted-foreground'>
                {current.description}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-xs px-3 py-1'>
                Année scolaire 2024–2025
              </Badge>
              {current.cta ? <Button size='sm'>{current.cta}</Button> : null}
            </div>
          </div>
        </header>

        <main className='flex-1 px-6 py-6 space-y-6'>
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
              getTeacherName={getTeacherName}
              schoolTypes={schoolTypes}
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
            />
          )}

          {activeSection === 'courses' && (
            <CoursesSection
              courses={courses}
              newCourse={newCourse}
              setNewCourse={setNewCourse}
              onCreateCourse={handleCreateCourse}
              courseLevelOptions={COURSE_LEVEL_OPTIONS}
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
            />
          )}

          {activeSection === 'grades' && (
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
    </SidebarProvider>
  );
};

