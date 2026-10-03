export type GeocodedPlace = { lat: number; lng: number; name: string };

export function getMapboxToken(): string {
  return (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined)?.trim() ?? '';
}

export function getMapboxStyle(): string {
  return 'mapbox://styles/mapbox/streets-v12';
}

export function hasMapboxToken(): boolean {
  return getMapboxToken().length > 0;
}

/** Geocode an address via Mapbox Geocoding API. */
export async function geocodePlace(query: string, language = 'fr'): Promise<GeocodedPlace | null> {
  const trimmed = query.trim();
  const token = getMapboxToken();
  if (!trimmed || !token) return null;

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&limit=1&language=${language}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    features?: Array<{ place_name: string; center: [number, number] }>;
  };
  const feature = data.features?.[0];
  if (!feature) return null;
  return { lng: feature.center[0], lat: feature.center[1], name: feature.place_name };
}
