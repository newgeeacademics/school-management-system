import React from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/sidebar';

type SectionId =
  | 'overview'
  | 'classes'
  | 'teachers'
  | 'students'
  | 'courses'
  | 'rooms'
  | 'calendar'
  | 'schedule';

type Teacher = {
  id: string;
  initials: string;
  name: string;
  subject: string;
};

type ClassItem = {
  id: string;
  name: string;
  level: string;
  studentsCount: number;
  homeroomTeacherId?: string;
};

type Student = {
  id: string;
  name: string;
  classId?: string;
};

type Course = {
  id: string;
  name: string;
  level: string;
};

type Room = {
  id: string;
  name: string;
  type: string;
  capacity?: number;
};

type CalendarEvent = {
  id: string;
  label: string;
  date: string;
  time?: string;
  location?: string;
  type: 'Promotion' | 'Réunion' | 'Examen' | 'Autre';
};

type ScheduleItem = {
  id: string;
  classId: string;
  courseId?: string;
  day: string;
  time: string;
  room?: string;
};

const CLASS_LEVEL_OPTIONS = [
  'Maternelle',
  'Primaire',
  'Collège - 6ème',
  'Collège - 5ème',
  'Collège - 4ème',
  'Collège - 3ème',
  'Lycée - 2nde',
  'Lycée - 1ère',
  'Lycée - Terminale',
];

const COURSE_LEVEL_OPTIONS = ['Primaire', 'Collège', 'Lycée', 'Supérieur'];

const DAY_OPTIONS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const TIME_SLOT_OPTIONS = [
  '8h00 – 9h00',
  '9h00 – 10h00',
  '10h15 – 11h15',
  '11h15 – 12h15',
  '14h00 – 15h00',
  '15h00 – 16h00',
  '16h00 – 17h00',
];

const SUBJECT_OPTIONS = [
  'Mathématiques',
  'Français',
  'Histoire-Géographie',
  'Sciences',
  'SVT',
  'Physique-Chimie',
  'Anglais',
  'EPS',
  'Informatique',
  'Autre',
];

const EVENT_TIME_PRESETS = [
  ...TIME_SLOT_OPTIONS,
  'Matinée',
  'Après-midi',
  'Toute la journée',
  'Personnalisé',
];

const EVENT_LOCATION_PRESETS = [
  'Salle polyvalente',
  'Salle des professeurs',
  'Bureau du directeur',
  'Cour de récréation',
  'Extérieur',
  'Autre (personnalisé)',
];

const ROOM_TYPE_OPTIONS = [
  'Salle de classe',
  'Salle de réunion',
  'Salle spécialisée',
  'Autre',
];

const navItems: { id: SectionId; label: string; icon: React.ComponentType<any> }[] =
  [
    { id: 'overview', label: 'Vue d’ensemble', icon: GraduationCap },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'teachers', label: 'Enseignants', icon: BookOpen },
    { id: 'students', label: 'Élèves', icon: Users },
    { id: 'courses', label: 'Cours', icon: BookOpen },
    { id: 'rooms', label: 'Salles', icon: MapPin },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'schedule', label: 'Emploi du temps', icon: ClipboardList },
  ];

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
  courses: {
    kicker: 'Structure pédagogique',
    title: 'Cours et matières',
    description:
      'Définissez les cours qui seront utilisés dans l’emploi du temps et les bulletins.',
    cta: 'Créer un cours',
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
  const [activeSection, setActiveSection] = React.useState<SectionId>('overview');

  const [teachers, setTeachers] = React.useState<Teacher[]>(initialTeachers);
  const [classes, setClasses] = React.useState<ClassItem[]>(initialClasses);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [rooms, setRooms] = React.useState<Room[]>(initialRooms);
  const [events, setEvents] = React.useState<CalendarEvent[]>(initialEvents);
  const [schedule, setSchedule] = React.useState<ScheduleItem[]>(initialSchedule);

  const [newClass, setNewClass] = React.useState({
    name: '',
    level: '',
    studentsCount: '',
    homeroomTeacherId: '',
  });

  const [newTeacher, setNewTeacher] = React.useState({
    name: '',
    subject: '',
  });
  const [teacherSubjectPreset, setTeacherSubjectPreset] = React.useState('');

  const [newStudent, setNewStudent] = React.useState({
    name: '',
    classId: '',
  });

  const [newCourse, setNewCourse] = React.useState({
    name: '',
    level: '',
  });

  const [newEvent, setNewEvent] = React.useState({
    label: '',
    date: '',
    time: '',
    location: '',
    type: 'Promotion' as CalendarEvent['type'],
  });
  const [eventTimePreset, setEventTimePreset] = React.useState('');
  const [eventLocationPreset, setEventLocationPreset] = React.useState('');

  const [newSlot, setNewSlot] = React.useState({
    classId: '',
    courseId: '',
    day: '',
    time: '',
    room: '',
  });

  const [newRoom, setNewRoom] = React.useState({
    name: '',
    type: '',
    capacity: '',
  });

  const current = sectionConfig[activeSection];

  const getTeacherName = (id?: string) =>
    id ? teachers.find((t) => t.id === id)?.name ?? '—' : '—';

  const getClassName = (id: string) =>
    classes.find((c) => c.id === id)?.name ?? 'Classe inconnue';

  const getCourseName = (id?: string) =>
    id ? courses.find((c) => c.id === id)?.name ?? '—' : '—';

  const getRoomName = (name?: string) =>
    name || 'Salle non définie';

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;
    const id = `c-${Date.now()}`;
    setClasses((prev) => [
      ...prev,
      {
        id,
        name: newClass.name.trim(),
        level: newClass.level.trim() || 'Niveau non défini',
        studentsCount: Number(newClass.studentsCount || 0),
        homeroomTeacherId: newClass.homeroomTeacherId || undefined,
      },
    ]);
    setNewClass({
      name: '',
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
    if (!newCourse.name.trim()) return;
    const id = `co-${Date.now()}`;
    setCourses((prev) => [
      ...prev,
      {
        id,
        name: newCourse.name.trim(),
        level: newCourse.level.trim() || 'Niveau non défini',
      },
    ]);
    setNewCourse({ name: '', level: '' });
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
                Tableau de bord
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
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
          <div className='flex items-center gap-2 px-2 py-1.5'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium leading-tight'>
                Admin établissement
              </p>
              <p className='truncate text-xs text-muted-foreground'>
                admin@ecole.fr
              </p>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className='flex items-center justify-between gap-4 border-b px-6 py-4'>
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
            <Button size='sm'>{current.cta}</Button>
          </div>
        </header>

        <main className='flex-1 px-6 py-6 space-y-6'>
          {activeSection === 'overview' && (
            <>
              <section className='grid gap-4 md:grid-cols-3'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <CardTitle className='text-xs font-medium text-muted-foreground'>
                      Classes actives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-2xl font-semibold'>
                      {classes.length.toString().padStart(2, '0')}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Réparties sur {new Set(classes.map((c) => c.level)).size} niveaux.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <CardTitle className='text-xs font-medium text-muted-foreground'>
                      Enseignants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-2xl font-semibold'>
                      {teachers.length.toString().padStart(2, '0')}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {teachers.filter((t) => t.subject).length} matières renseignées.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <CardTitle className='text-xs font-medium text-muted-foreground'>
                      Élèves référencés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-2xl font-semibold'>
                      {students.length.toString().padStart(2, '0')}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Premier niveau pour gérer les effectifs.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm font-medium'>
                      Prochaines échéances (exemple)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className='flex items-start justify-between gap-2'
                      >
                        <div>
                          <p className='font-medium'>{event.label}</p>
                          <p className='text-xs text-muted-foreground'>
                            {event.date}
                            {event.time ? ` • ${event.time}` : ''}
                          </p>
                        </div>
                        <Badge variant='outline' className='text-[11px]'>
                          {event.type}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm font-medium'>
                      Raccourcis rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => setActiveSection('classes')}
                    >
                      Gérer les classes
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => setActiveSection('teachers')}
                    >
                      Inviter des enseignants
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => setActiveSection('schedule')}
                    >
                      Créer un emploi du temps
                    </Button>
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {activeSection === 'classes' && (
            <section className='space-y-5'>
              <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm font-medium'>
                      Créer une classe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      className='space-y-3 text-xs'
                      onSubmit={handleCreateClass}
                    >
                      <div className='grid gap-2'>
                        <Label htmlFor='class-name'>Nom de la classe</Label>
                        <Input
                          id='class-name'
                          value={newClass.name}
                          onChange={(e) =>
                            setNewClass((c) => ({ ...c, name: e.target.value }))
                          }
                          placeholder='Ex : 6ème A'
                          required
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='class-level'>Niveau</Label>
                        <Select
                          value={newClass.level}
                          onValueChange={(value) =>
                            setNewClass((c) => ({ ...c, level: value }))
                          }
                        >
                          <SelectTrigger id='class-level'>
                            <SelectValue placeholder='Choisir un niveau' />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASS_LEVEL_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='class-students'>Nombre d’élèves</Label>
                        <Input
                          id='class-students'
                          type='number'
                          min={0}
                          value={newClass.studentsCount}
                          onChange={(e) =>
                            setNewClass((c) => ({
                              ...c,
                              studentsCount: e.target.value,
                            }))
                          }
                          placeholder='Ex : 24'
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label>Professeur principal</Label>
                        <Select
                          value={newClass.homeroomTeacherId}
                          onValueChange={(value) =>
                            setNewClass((c) => ({
                              ...c,
                              homeroomTeacherId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Sélectionner un enseignant (optionnel)' />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name} • {teacher.subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type='submit' size='sm' className='mt-1'>
                        Enregistrer la classe
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm font-medium'>
                      Résumé des classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 text-xs text-muted-foreground'>
                    <p>
                      Total classes :{' '}
                      <span className='font-medium text-foreground'>
                        {classes.length}
                      </span>
                    </p>
                    <p>
                      Niveaux couverts :{' '}
                      <span className='font-medium text-foreground'>
                        {Array.from(new Set(classes.map((c) => c.level))).join(
                          ', '
                        ) || 'Non défini'}
                      </span>
                    </p>
                    <p>
                      Professeurs principaux renseignés :{' '}
                      <span className='font-medium text-foreground'>
                        {
                          classes.filter((c) => c.homeroomTeacherId !== undefined)
                            .length
                        }
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {classes.map((classe) => (
                  <Card key={classe.id}>
                    <CardHeader className='pb-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <CardTitle className='text-sm font-semibold'>
                          {classe.name}
                        </CardTitle>
                        <Badge variant='outline' className='text-[10px]'>
                          {classe.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-1 text-xs text-muted-foreground'>
                      <p>
                        <span className='font-medium text-foreground'>
                          {classe.studentsCount}
                        </span>{' '}
                        élèves inscrits
                      </p>
                      <p>
                        Professeur principal :{' '}
                        <span className='text-foreground'>
                          {getTeacherName(classe.homeroomTeacherId)}
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'teachers' && (
            <section className='space-y-5'>
              <div className='grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,2fr)]'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm font-medium'>
                      Ajouter un enseignant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      className='space-y-3 text-xs'
                      onSubmit={handleCreateTeacher}
                    >
                      <div className='grid gap-2'>
                        <Label htmlFor='teacher-name'>Nom complet</Label>
                        <Input
                          id='teacher-name'
                          value={newTeacher.name}
                          onChange={(e) =>
                            setNewTeacher((t) => ({
                              ...t,
                              name: e.target.value,
                            }))
                          }
                          placeholder='Ex : Jean Dupont'
                          required
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label>Matière principale</Label>
                        <Select
                          value={teacherSubjectPreset}
                          onValueChange={(value) => {
                            setTeacherSubjectPreset(value);
                            if (value === 'Autre') {
                              setNewTeacher((t) => ({ ...t, subject: '' }));
                            } else {
                              setNewTeacher((t) => ({ ...t, subject: value }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Choisir une matière' />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECT_OPTIONS.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {teacherSubjectPreset === 'Autre' && (
                          <Input
                            id='teacher-subject'
                            value={newTeacher.subject}
                            onChange={(e) =>
                              setNewTeacher((t) => ({
                                ...t,
                                subject: e.target.value,
                              }))
                            }
                            placeholder='Précisez la matière'
                          />
                        )}
                      </div>
                      <Button type='submit' size='sm' className='mt-1'>
                        Enregistrer l’enseignant
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className='grid gap-3 md:grid-cols-2'>
                  {teachers.map((teacher) => (
                    <Card key={teacher.id}>
                      <CardContent className='flex items-center gap-3 py-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback>{teacher.initials}</AvatarFallback>
                        </Avatar>
                        <div className='space-y-0.5'>
                          <p className='text-sm font-medium leading-tight'>
                            {teacher.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {teacher.subject || 'Matière à définir'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'students' && (
            <section className='space-y-5'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Ajouter un élève
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_auto] items-end text-xs'
                    onSubmit={handleCreateStudent}
                  >
                    <div className='grid gap-2'>
                      <Label htmlFor='student-name'>Nom complet</Label>
                      <Input
                        id='student-name'
                        value={newStudent.name}
                        onChange={(e) =>
                          setNewStudent((s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder='Ex : Aïcha Konaté'
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label>Classe</Label>
                      <Select
                        value={newStudent.classId}
                        onValueChange={(value) =>
                          setNewStudent((s) => ({ ...s, classId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Associer à une classe (optionnel)' />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classe) => (
                            <SelectItem key={classe.id} value={classe.id}>
                              {classe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type='submit' size='sm'>
                      Ajouter
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Liste des élèves (simplifiée)
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-xs'>
                  {students.length === 0 ? (
                    <p className='text-muted-foreground'>
                      Aucun élève ajouté pour le moment.
                    </p>
                  ) : (
                    <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className='rounded-md border border-border/80 px-3 py-2'
                        >
                          <p className='text-sm font-medium text-foreground'>
                            {student.name}
                          </p>
                          <p className='text-[11px] text-muted-foreground'>
                            Classe : {student.classId ? getClassName(student.classId) : 'Non renseignée'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === 'courses' && (
            <section className='space-y-5'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Créer un cours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_auto] items-end text-xs'
                    onSubmit={handleCreateCourse}
                  >
                    <div className='grid gap-2'>
                      <Label htmlFor='course-name'>Nom du cours</Label>
                      <Input
                        id='course-name'
                        value={newCourse.name}
                        onChange={(e) =>
                          setNewCourse((c) => ({ ...c, name: e.target.value }))
                        }
                        placeholder='Ex : Physique-Chimie'
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='course-level'>Niveau concerné</Label>
                      <Select
                        value={newCourse.level}
                        onValueChange={(value) =>
                          setNewCourse((c) => ({ ...c, level: value }))
                        }
                      >
                        <SelectTrigger id='course-level'>
                          <SelectValue placeholder='Choisir un niveau' />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSE_LEVEL_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type='submit' size='sm'>
                      Ajouter
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Cours définis
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-xs'>
                  {courses.length === 0 ? (
                    <p className='text-muted-foreground'>
                      Aucun cours défini pour le moment.
                    </p>
                  ) : (
                    <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className='rounded-md border border-border/80 px-3 py-2'
                        >
                          <p className='text-sm font-medium text-foreground'>
                            {course.name}
                          </p>
                          <p className='text-[11px] text-muted-foreground'>
                            Niveau : {course.level}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === 'rooms' && (
            <section className='space-y-5'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Ajouter une salle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-end text-xs'
                    onSubmit={handleCreateRoom}
                  >
                    <div className='grid gap-2'>
                      <Label htmlFor='room-name'>Nom de la salle</Label>
                      <Input
                        id='room-name'
                        value={newRoom.name}
                        onChange={(e) =>
                          setNewRoom((r) => ({ ...r, name: e.target.value }))
                        }
                        placeholder='Ex : Salle 201, Amphithéâtre'
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label>Type de salle</Label>
                      <Select
                        value={newRoom.type}
                        onValueChange={(value) =>
                          setNewRoom((r) => ({ ...r, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un type' />
                        </SelectTrigger>
                        <SelectContent>
                          {ROOM_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='room-capacity'>Capacité (optionnel)</Label>
                      <Input
                        id='room-capacity'
                        type='number'
                        min={0}
                        value={newRoom.capacity}
                        onChange={(e) =>
                          setNewRoom((r) => ({ ...r, capacity: e.target.value }))
                        }
                        placeholder='Ex : 30'
                      />
                    </div>
                    <Button type='submit' size='sm'>
                      Enregistrer
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Salles enregistrées
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-xs'>
                  {rooms.length === 0 ? (
                    <p className='text-muted-foreground'>
                      Aucune salle enregistrée pour le moment.
                    </p>
                  ) : (
                    <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className='rounded-md border border-border/80 px-3 py-2'
                        >
                          <p className='text-sm font-medium text-foreground'>
                            {room.name}
                          </p>
                          <p className='text-[11px] text-muted-foreground'>
                            {room.type || 'Type non défini'}
                          </p>
                          {typeof room.capacity === 'number' && (
                            <p className='text-[11px] text-muted-foreground'>
                              Capacité : {room.capacity} personnes
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === 'calendar' && (
            <section className='space-y-5'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Ajouter un évènement / promotion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className='grid gap-3 md:grid-cols-2 text-xs'
                    onSubmit={handleCreateEvent}
                  >
                    <div className='grid gap-2'>
                      <Label htmlFor='event-label'>Titre</Label>
                      <Input
                        id='event-label'
                        value={newEvent.label}
                        onChange={(e) =>
                          setNewEvent((ev) => ({
                            ...ev,
                            label: e.target.value,
                          }))
                        }
                        placeholder='Ex : Promotion des 3ème vers la 2nde'
                        required
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='event-date'>Date ou période</Label>
                      <Input
                        id='event-date'
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent((ev) => ({
                            ...ev,
                            date: e.target.value,
                          }))
                        }
                        placeholder='Ex : 15 juin 2025, Du 2 au 6 avril...'
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label>Heure (optionnel)</Label>
                      <Select
                        value={eventTimePreset}
                        onValueChange={(value) => {
                          setEventTimePreset(value);
                          if (value === 'Personnalisé') {
                            setNewEvent((ev) => ({ ...ev, time: '' }));
                          } else {
                            setNewEvent((ev) => ({ ...ev, time: value }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un créneau (ou personnalisé)' />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TIME_PRESETS.map((preset) => (
                            <SelectItem key={preset} value={preset}>
                              {preset}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {eventTimePreset === 'Personnalisé' && (
                        <Input
                          id='event-time'
                          value={newEvent.time}
                          onChange={(e) =>
                            setNewEvent((ev) => ({
                              ...ev,
                              time: e.target.value,
                            }))
                          }
                          placeholder='Ex : 18h00'
                        />
                      )}
                    </div>
                    <div className='grid gap-2'>
                      <Label>Lieu (optionnel)</Label>
                      <Select
                        value={eventLocationPreset}
                        onValueChange={(value) => {
                          setEventLocationPreset(value);
                          if (value === 'Autre (personnalisé)') {
                            setNewEvent((ev) => ({ ...ev, location: '' }));
                          } else {
                            const roomMatch = rooms.find((r) => r.name === value);
                            setNewEvent((ev) => ({
                              ...ev,
                              location: roomMatch ? roomMatch.name : value,
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un lieu (salle ou générique)' />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.name}>
                              {room.name}
                              {room.type ? ` • ${room.type}` : ''}
                            </SelectItem>
                          ))}
                          {EVENT_LOCATION_PRESETS.map((preset) => (
                            <SelectItem key={preset} value={preset}>
                              {preset}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {eventLocationPreset === 'Autre (personnalisé)' && (
                        <Input
                          id='event-location'
                          value={newEvent.location}
                          onChange={(e) =>
                            setNewEvent((ev) => ({
                              ...ev,
                              location: e.target.value,
                            }))
                          }
                          placeholder='Ex : Salle polyvalente'
                        />
                      )}
                      <p className='mt-1 text-[10px] text-muted-foreground'>
                        Vous pouvez d’abord créer les salles dans l’onglet
                        &quot;Salles&quot; pour les réutiliser ici.
                      </p>
                    </div>
                    <div className='grid gap-2'>
                      <Label>Type d’évènement</Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={(value: CalendarEvent['type']) =>
                          setNewEvent((ev) => ({ ...ev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Sélectionner un type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Promotion'>Promotion</SelectItem>
                          <SelectItem value='Réunion'>Réunion</SelectItem>
                          <SelectItem value='Examen'>Examen</SelectItem>
                          <SelectItem value='Autre'>Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2 md:col-span-2'>
                      <Label htmlFor='event-notes'>Notes internes (optionnel)</Label>
                      <Textarea
                        id='event-notes'
                        rows={2}
                        placeholder='Quelques précisions pour vous et votre équipe...'
                      />
                    </div>
                    <div className='md:col-span-2'>
                      <Button type='submit' size='sm'>
                        Enregistrer l’évènement
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Calendrier synthétique
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm'>
                  {events.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      Aucun évènement ajouté pour le moment.
                    </p>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className='rounded-md border border-border/60 px-3 py-2'
                      >
                        <p className='text-xs font-medium text-foreground'>
                          {event.label}
                        </p>
                        <p className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                          <ClipboardList className='h-3 w-3' />
                          <span>
                            {event.date}
                            {event.time ? ` • ${event.time}` : ''}
                          </span>
                        </p>
                        {event.location && (
                          <p className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                            <MapPin className='h-3 w-3' />
                            <span>{event.location}</span>
                          </p>
                        )}
                        <Badge variant='outline' className='mt-1 text-[10px]'>
                          {event.type}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === 'schedule' && (
            <section className='space-y-5'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Ajouter un créneau à l’emploi du temps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className='grid gap-3 md:grid-cols-2 text-xs'
                    onSubmit={handleCreateSlot}
                  >
                    <div className='grid gap-2'>
                      <Label>Classe</Label>
                      <Select
                        value={newSlot.classId}
                        onValueChange={(value) =>
                          setNewSlot((s) => ({ ...s, classId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Sélectionner une classe' />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classe) => (
                            <SelectItem key={classe.id} value={classe.id}>
                              {classe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2'>
                      <Label>Cours</Label>
                      <Select
                        value={newSlot.courseId}
                        onValueChange={(value) =>
                          setNewSlot((s) => ({ ...s, courseId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Associer un cours (optionnel)' />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2'>
                      <Label>Jour</Label>
                      <Select
                        value={newSlot.day}
                        onValueChange={(value) =>
                          setNewSlot((s) => ({ ...s, day: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un jour' />
                        </SelectTrigger>
                        <SelectContent>
                          {DAY_OPTIONS.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2'>
                      <Label>Heure</Label>
                      <Select
                        value={newSlot.time}
                        onValueChange={(value) =>
                          setNewSlot((s) => ({ ...s, time: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Choisir un créneau' />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOT_OPTIONS.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='grid gap-2 md:col-span-2'>
                      <Label>Salle (optionnel)</Label>
                      <Select
                        value={newSlot.room}
                        onValueChange={(value) =>
                          setNewSlot((s) => ({ ...s, room: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Sélectionner une salle' />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.name}>
                              {room.name}
                              {room.type ? ` • ${room.type}` : ''}
                            </SelectItem>
                          ))}
                          <SelectItem value='Autre (personnalisé)'>
                            Autre (personnalisé)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {newSlot.room === 'Autre (personnalisé)' && (
                        <Input
                          id='slot-room'
                          placeholder='Saisir le nom de la salle'
                          onChange={(e) =>
                            setNewSlot((s) => ({ ...s, room: e.target.value }))
                          }
                        />
                      )}
                      <p className='mt-1 text-[10px] text-muted-foreground'>
                        Pour ajouter une nouvelle salle à la liste, utilisez l’onglet
                        &quot;Salles&quot; dans la barre latérale.
                      </p>
                    </div>
                    <div className='md:col-span-2'>
                      <Button type='submit' size='sm'>
                        Enregistrer le créneau
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm font-medium'>
                    Aperçu de l’emploi du temps
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6 text-xs'>
                  {schedule.length === 0 ? (
                    <p className='text-muted-foreground'>
                      Aucun créneau ajouté pour le moment. Ajoutez quelques
                      créneaux pour voir l’emploi du temps par classe.
                    </p>
                  ) : (
                    classes.map((classe) => {
                      const slotsForClass = schedule.filter(
                        (slot) => slot.classId === classe.id
                      );
                      if (slotsForClass.length === 0) return null;

                      return (
                        <div key={classe.id} className='space-y-2'>
                          <p className='text-sm font-semibold text-foreground'>
                            {classe.name}
                          </p>
                          <div className='overflow-x-auto rounded-lg border border-border/70 bg-card'>
                            <table className='w-full border-collapse text-[11px]'>
                              <thead className='bg-muted/60'>
                                <tr>
                                  <th className='min-w-[90px] border-b border-border/80 px-2 py-1 text-left font-medium text-muted-foreground'>
                                    Heure
                                  </th>
                                  {DAY_OPTIONS.map((day) => (
                                    <th
                                      key={day}
                                      className='min-w-[110px] border-b border-l border-border/80 px-2 py-1 text-left font-medium text-muted-foreground'
                                    >
                                      {day}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {TIME_SLOT_OPTIONS.map((slotTime) => (
                                  <tr key={slotTime} className='odd:bg-background'>
                                    <td className='border-t border-border/60 px-2 py-1 font-medium text-foreground'>
                                      {slotTime}
                                    </td>
                                    {DAY_OPTIONS.map((day) => {
                                      const cellSlot = slotsForClass.find(
                                        (s) => s.day === day && s.time === slotTime
                                      );
                                      return (
                                        <td
                                          key={day}
                                          className='border-t border-l border-border/60 px-2 py-1 align-top'
                                        >
                                          {cellSlot ? (
                                            <div className='space-y-0.5'>
                                              <p className='font-medium text-foreground'>
                                                {getCourseName(cellSlot.courseId)}
                                              </p>
                                              {cellSlot.room && (
                                                <p className='text-[10px] text-muted-foreground'>
                                                  Salle : {cellSlot.room}
                                                </p>
                                              )}
                                            </div>
                                          ) : (
                                            <span className='text-[10px] text-muted-foreground'>
                                              —
                                            </span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </section>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

