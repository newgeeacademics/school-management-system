import { useCallback, useEffect, useState } from 'react';
import { apiFetch, isBackendApiConfigured } from '@/lib/api';
import { getPortalSession } from '@/lib/auth';
import type { PortalSectionId } from '@/lib/portal-sections';

export type PortalSchool = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  officialEmail?: string;
};

export type PortalClass = {
  id: string;
  name: string;
  level?: string;
  studentsCount?: number;
};

export type PortalStudent = {
  id: string;
  name: string;
  classId?: string;
  className?: string;
};

export type PortalScheduleItem = {
  id: string;
  day: string;
  time: string;
  room?: string;
  className?: string;
  courseName?: string;
};

export type PortalCanteenItem = {
  id: string;
  day: string;
  mealType: string;
  dish: string;
  note?: string;
};

export type PortalGrade = {
  id: string;
  score: number;
  studentName?: string;
  evaluationLabel?: string;
};

export type PortalTransportRoute = {
  id: string;
  name: string;
  driverName?: string;
  departureTime?: string;
  returnTime?: string;
};

export type PortalCalendarEvent = {
  id: string;
  label: string;
  date: string;
  time?: string;
  location?: string;
};

export type PortalFeed = {
  role?: string;
  profileName?: string;
  classes: PortalClass[];
  students: PortalStudent[];
  schools: PortalSchool[];
  schedule: PortalScheduleItem[];
  canteen: PortalCanteenItem[];
  grades: PortalGrade[];
  transport: PortalTransportRoute[];
  events: PortalCalendarEvent[];
};

const EMPTY: PortalFeed = {
  classes: [],
  students: [],
  schools: [],
  schedule: [],
  canteen: [],
  grades: [],
  transport: [],
  events: [],
};

const MEAL_LABELS: Record<string, string> = {
  DEJEUNER: 'Déjeuner',
  DINER: 'Dîner',
  GOUTER: 'Goûter',
};

function mapFeed(data: Record<string, unknown>): PortalFeed {
  const classes = Array.isArray(data.classes) ? data.classes : [];
  const students = Array.isArray(data.students) ? data.students : [];
  const schools = Array.isArray(data.schools) ? data.schools : [];
  const schedule = Array.isArray(data.schedule) ? data.schedule : [];
  const canteen = Array.isArray(data.canteen) ? data.canteen : [];
  const grades = Array.isArray(data.grades) ? data.grades : [];
  const transport = Array.isArray(data.transport) ? data.transport : [];
  const events = Array.isArray(data.events) ? data.events : [];

  return {
    role: data.role ? String(data.role) : undefined,
    profileName: data.profileName ? String(data.profileName) : undefined,
    classes: classes.map((row) => {
      const c = row as Record<string, unknown>;
      return {
        id: String(c.id),
        name: String(c.name ?? ''),
        level: c.level ? String(c.level) : undefined,
        studentsCount: c.studentsCount != null ? Number(c.studentsCount) : undefined,
      };
    }),
    students: students.map((row) => {
      const s = row as Record<string, unknown>;
      return {
        id: String(s.id),
        name: String(s.name ?? ''),
        classId: s.classId ? String(s.classId) : undefined,
        className: s.className ? String(s.className) : undefined,
      };
    }),
    schools: schools.map((row) => {
      const s = row as Record<string, unknown>;
      return {
        id: String(s.id),
        name: String(s.name ?? ''),
        city: s.city ? String(s.city) : undefined,
        country: s.country ? String(s.country) : undefined,
        officialEmail: s.officialEmail ? String(s.officialEmail) : undefined,
      };
    }),
    schedule: schedule.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        day: String(r.day ?? ''),
        time: String(r.time ?? ''),
        room: r.room ? String(r.room) : undefined,
        className: r.className ? String(r.className) : undefined,
        courseName: r.courseName ? String(r.courseName) : undefined,
      };
    }),
    canteen: canteen.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        day: String(r.day ?? ''),
        mealType: MEAL_LABELS[String(r.mealType)] ?? String(r.mealType ?? ''),
        dish: String(r.dish ?? ''),
        note: r.note ? String(r.note) : undefined,
      };
    }),
    grades: grades.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        score: Number(r.score ?? 0),
        studentName: r.studentName ? String(r.studentName) : undefined,
        evaluationLabel: r.evaluationLabel ? String(r.evaluationLabel) : undefined,
      };
    }),
    transport: transport.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        name: String(r.name ?? ''),
        driverName: r.driverName ? String(r.driverName) : undefined,
        departureTime: r.departureTime ? String(r.departureTime) : undefined,
        returnTime: r.returnTime ? String(r.returnTime) : undefined,
      };
    }),
    events: events.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        label: String(r.label ?? ''),
        date: String(r.date ?? ''),
        time: r.time ? String(r.time) : undefined,
        location: r.location ? String(r.location) : undefined,
      };
    }),
  };
}

export function usePortalFeed() {
  const [feed, setFeed] = useState<PortalFeed>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = getPortalSession();

  const reload = useCallback(async () => {
    if (!session?.token || !isBackendApiConfigured()) {
      setFeed(EMPTY);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Record<string, unknown>>('/api/portal/feed');
      setFeed(mapFeed(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setFeed(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  const reloadSection = useCallback(
    async (_section: PortalSectionId) => {
      await reload();
    },
    [reload]
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    feed,
    loading,
    error,
    reload,
    reloadSection,
    usesBackend: Boolean(session?.token && isBackendApiConfigured()),
  };
}
