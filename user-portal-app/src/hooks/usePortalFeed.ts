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

export type PortalScheduleItem = {
  id: string;
  day: string;
  time: string;
  room?: string;
  classItem?: string;
  course?: string;
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
  student?: string;
  evaluation?: string;
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
  schools: PortalSchool[];
  schedule: PortalScheduleItem[];
  canteen: PortalCanteenItem[];
  grades: PortalGrade[];
  transport: PortalTransportRoute[];
  events: PortalCalendarEvent[];
};

const EMPTY: PortalFeed = {
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

function mapSchedule(rows: Record<string, unknown>[]): PortalScheduleItem[] {
  return rows.map((row) => ({
    id: String(row.id),
    day: String(row.day ?? ''),
    time: String(row.time ?? ''),
    room: row.room ? String(row.room) : undefined,
    classItem: row.classItem ? String(row.classItem) : undefined,
    course: row.course ? String(row.course) : undefined,
  }));
}

function mapCanteen(rows: Record<string, unknown>[]): PortalCanteenItem[] {
  return rows.map((row) => ({
    id: String(row.id),
    day: String(row.day ?? ''),
    mealType: MEAL_LABELS[String(row.mealType)] ?? String(row.mealType ?? ''),
    dish: String(row.dish ?? ''),
    note: row.note ? String(row.note) : undefined,
  }));
}

function mapGrades(rows: Record<string, unknown>[]): PortalGrade[] {
  return rows.map((row) => ({
    id: String(row.id),
    score: Number(row.score ?? 0),
    student: row.student ? String(row.student) : undefined,
    evaluation: row.evaluation ? String(row.evaluation) : undefined,
  }));
}

function mapTransport(rows: Record<string, unknown>[]): PortalTransportRoute[] {
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    driverName: row.driverName ? String(row.driverName) : undefined,
    departureTime: row.departureTime ? String(row.departureTime) : undefined,
    returnTime: row.returnTime ? String(row.returnTime) : undefined,
  }));
}

function mapEvents(rows: Record<string, unknown>[]): PortalCalendarEvent[] {
  return rows.map((row) => ({
    id: String(row.id),
    label: String(row.label ?? row.title ?? ''),
    date: String(row.date ?? ''),
    time: row.time ? String(row.time) : undefined,
    location: row.location ? String(row.location) : undefined,
  }));
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
      const [schools, schedule, canteen, grades, transport, events] = await Promise.all([
        apiFetch<PortalSchool[]>('/api/schools'),
        apiFetch<Record<string, unknown>[]>('/api/schedule'),
        apiFetch<Record<string, unknown>[]>('/api/canteen'),
        apiFetch<Record<string, unknown>[]>('/api/grades'),
        apiFetch<Record<string, unknown>[]>('/api/transport'),
        apiFetch<Record<string, unknown>[]>('/api/calendar'),
      ]);

      setFeed({
        schools,
        schedule: mapSchedule(schedule),
        canteen: mapCanteen(canteen),
        grades: mapGrades(grades),
        transport: mapTransport(transport),
        events: mapEvents(events),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setFeed(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  const reloadSection = useCallback(
    async (section: PortalSectionId) => {
      if (!session?.token || !isBackendApiConfigured()) return;

      setError(null);
      try {
        switch (section) {
          case 'schools': {
            const schools = await apiFetch<PortalSchool[]>('/api/schools');
            setFeed((prev) => ({ ...prev, schools }));
            break;
          }
          case 'schedule': {
            const schedule = await apiFetch<Record<string, unknown>[]>('/api/schedule');
            setFeed((prev) => ({ ...prev, schedule: mapSchedule(schedule) }));
            break;
          }
          case 'grades': {
            const grades = await apiFetch<Record<string, unknown>[]>('/api/grades');
            setFeed((prev) => ({ ...prev, grades: mapGrades(grades) }));
            break;
          }
          case 'canteen': {
            const canteen = await apiFetch<Record<string, unknown>[]>('/api/canteen');
            setFeed((prev) => ({ ...prev, canteen: mapCanteen(canteen) }));
            break;
          }
          case 'transport': {
            const transport = await apiFetch<Record<string, unknown>[]>('/api/transport');
            setFeed((prev) => ({ ...prev, transport: mapTransport(transport) }));
            break;
          }
          case 'messages': {
            const events = await apiFetch<Record<string, unknown>[]>('/api/calendar');
            setFeed((prev) => ({ ...prev, events: mapEvents(events) }));
            break;
          }
          case 'overview':
            await reload();
            break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    },
    [session?.token, reload]
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
