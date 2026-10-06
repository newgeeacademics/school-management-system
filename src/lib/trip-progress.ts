import type { LivePosition, LiveWaypoint } from '@/lib/tracking-api';

/** Average school-bus speed in town, used when the GPS gives no usable speed. */
const FALLBACK_SPEED_KMH = 25;
/** Below this the bus is treated as stopped or crawling, so its live speed would overstate the delay. */
const MIN_RELIABLE_SPEED_KMH = 5;

export type TripProgress = {
  nextStop: LiveWaypoint;
  /** Straight-line distance from the bus to the next stop. */
  kmToNextStop: number;
  /** Distance to the last stop (the school, or the last drop-off), through the remaining stops. */
  kmRemaining: number;
  minutesToNextStop: number;
  minutesRemaining: number;
  stopsLeft: number;
};

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Where the bus is along its stops. The next stop is the closest one, unless the bus is
 * already between it and the following stop (closer to the following stop than the stops
 * are to each other), in which case it is the following one.
 */
export function tripProgress(position: LivePosition | null, waypoints: LiveWaypoint[]): TripProgress | null {
  if (!position || waypoints.length === 0) return null;

  let closest = 0;
  waypoints.forEach((wp, i) => {
    if (haversineKm(position, wp) < haversineKm(position, waypoints[closest])) closest = i;
  });

  let next = closest;
  const following = waypoints[closest + 1];
  if (following && haversineKm(position, following) < haversineKm(waypoints[closest], following)) {
    next = closest + 1;
  }

  const kmToNextStop = haversineKm(position, waypoints[next]);
  let kmRemaining = kmToNextStop;
  for (let i = next; i < waypoints.length - 1; i += 1) {
    kmRemaining += haversineKm(waypoints[i], waypoints[i + 1]);
  }

  const speed =
    position.speedKmh != null && position.speedKmh >= MIN_RELIABLE_SPEED_KMH ? position.speedKmh : FALLBACK_SPEED_KMH;

  return {
    nextStop: waypoints[next],
    kmToNextStop,
    kmRemaining,
    minutesToNextStop: Math.max(1, Math.round((kmToNextStop / speed) * 60)),
    minutesRemaining: Math.max(1, Math.round((kmRemaining / speed) * 60)),
    stopsLeft: waypoints.length - next,
  };
}

/** "850 m" under a kilometre, "3,4 km" above. */
export function formatDistance(km: number): { value: string; unit: string } {
  if (km < 1) return { value: String(Math.max(10, Math.round((km * 1000) / 10) * 10)), unit: 'm' };
  return { value: km.toLocaleString('fr-FR', { maximumFractionDigits: km < 10 ? 1 : 0 }), unit: 'km' };
}
