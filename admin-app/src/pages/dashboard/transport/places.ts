import { getMapboxToken } from '@shared/mapbox';
import { fetchRoadRoute } from '@/lib/osrm';

export type FoundPlace = { lat: number; lng: number; name: string };

const NOMINATIM = 'https://nominatim.openstreetmap.org';

function shortName(full: string): string {
  // "Rue 12, Cocody, Abidjan, Côte d'Ivoire" -> "Rue 12, Cocody"
  return full.split(',').slice(0, 2).map((p) => p.trim()).filter(Boolean).join(', ');
}

/** Search places by name: Mapbox when a token is set, OpenStreetMap otherwise. */
export async function searchPlaces(query: string, near?: { lat: number; lng: number } | null): Promise<FoundPlace[]> {
  const q = query.trim();
  if (!q) return [];
  const token = getMapboxToken();
  try {
    if (token) {
      const proximity = near ? `&proximity=${near.lng},${near.lat}` : '';
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&limit=5&language=fr${proximity}`,
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { features?: Array<{ place_name: string; center: [number, number] }> };
      return (data.features ?? []).map((f) => ({ lng: f.center[0], lat: f.center[1], name: shortName(f.place_name) }));
    }
    const viewbox = near ? `&viewbox=${near.lng - 0.3},${near.lat + 0.3},${near.lng + 0.3},${near.lat - 0.3}` : '';
    const res = await fetch(
      `${NOMINATIM}/search?format=json&limit=5&accept-language=fr&q=${encodeURIComponent(q)}${viewbox}`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    return data.map((d) => ({ lat: Number(d.lat), lng: Number(d.lon), name: shortName(d.display_name) }));
  } catch {
    return [];
  }
}

/** Best-effort street name for a tapped point; null when unavailable. */
export async function reverseName(lat: number, lng: number): Promise<string | null> {
  const token = getMapboxToken();
  try {
    if (token) {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1&language=fr&types=address,poi,neighborhood,locality`,
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { features?: Array<{ place_name: string }> };
      const name = data.features?.[0]?.place_name;
      return name ? shortName(name) : null;
    }
    const res = await fetch(`${NOMINATIM}/reverse?format=json&zoom=17&accept-language=fr&lat=${lat}&lon=${lng}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
    const a = data.address ?? {};
    const street = a.road || a.pedestrian || a.amenity || a.building;
    const area = a.neighbourhood || a.suburb || a.quarter || a.village || a.town || a.city;
    const name = [street, area].filter(Boolean).join(', ');
    return name || (data.display_name ? shortName(data.display_name) : null);
  } catch {
    return null;
  }
}

/** Road path through the points; a straight line when road routing is unavailable. */
export async function buildPath(points: { lat: number; lng: number }[]): Promise<{
  polyline: [number, number][];
  onRoads: boolean;
}> {
  if (points.length < 2) return { polyline: [], onRoads: false };
  const road = await fetchRoadRoute(points);
  if (road && road.length >= 2) return { polyline: road, onRoads: true };
  return { polyline: points.map((p) => [p.lat, p.lng] as [number, number]), onRoads: false };
}

const R = 6371;
export function pathLengthKm(polyline: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < polyline.length; i++) {
    const [lat1, lng1] = polyline[i - 1];
    const [lat2, lng2] = polyline[i];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    total += 2 * R * Math.asin(Math.sqrt(h));
  }
  return total;
}
