import { apiFetch } from '@/lib/api';

export type LiveWaypoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type LiveStudent = {
  id: string;
  name: string;
  className: string;
};

export type LivePosition = {
  lat: number;
  lng: number;
  heading?: number | null;
  speedKmh?: number | null;
  recordedAt?: string | null;
};

export type LiveRoute = {
  routeId: string;
  routeName: string;
  driverName: string;
  departureTime: string;
  returnTime?: string | null;
  waypoints: LiveWaypoint[];
  routePolyline: number[][];
  students: LiveStudent[];
  livePosition: LivePosition | null;
  tripStatus: string;
};

export async function fetchLiveRoutes(): Promise<LiveRoute[]> {
  return apiFetch<LiveRoute[]>('/api/tracking/live');
}

export async function fetchLiveRoute(routeId: string): Promise<LiveRoute> {
  return apiFetch<LiveRoute>(`/api/tracking/routes/${routeId}`);
}

export async function startTrip(routeId: string): Promise<LiveRoute> {
  return apiFetch<LiveRoute>(`/api/tracking/routes/${routeId}/trips/start`, { method: 'POST' });
}

export async function stopTrip(routeId: string): Promise<LiveRoute> {
  return apiFetch<LiveRoute>(`/api/tracking/routes/${routeId}/trips/stop`, { method: 'POST' });
}

export async function updatePosition(
  routeId: string,
  payload: { lat: number; lng: number; heading?: number; speedKmh?: number }
): Promise<LiveRoute> {
  return apiFetch<LiveRoute>(`/api/tracking/routes/${routeId}/position`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
