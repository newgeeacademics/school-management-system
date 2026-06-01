/**
 * Fetch road-following route from OSRM (uses Dijkstra on the real road network).
 * Returns polyline as [lat, lng][] for Leaflet, or null on error.
 */
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export type LatLng = { lat: number; lng: number };

export async function fetchRoadRoute(
  waypoints: LatLng[],
): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
    };
    const coordsGeo = data.routes?.[0]?.geometry?.coordinates;
    if (!coordsGeo?.length) return null;
    // GeoJSON is [lng, lat]; Leaflet wants [lat, lng]
    return coordsGeo.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}
