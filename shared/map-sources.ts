import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getMapboxStyle, getMapboxToken, hasMapboxToken } from './mapbox';

/** One way of drawing the base map. Tried in order until one shows tiles. */
export type MapSource = {
  id: string;
  engine: 'mapbox' | 'maplibre';
  style: string | Record<string, unknown>;
};

/** A map that has not drawn a single tile after this long moves on to the next source. */
const NO_TILE_TIMEOUT_MS = 8000;

function rasterStyle(tiles: string[], attribution: string) {
  return {
    version: 8,
    sources: { base: { type: 'raster', tiles, tileSize: 256, maxzoom: 19, attribution } },
    layers: [{ id: 'base', type: 'raster', source: 'base' }],
  };
}

/**
 * Mapbox when a token is set, then free sources needing no key:
 * OpenFreeMap vector tiles, CARTO raster tiles, OpenStreetMap raster tiles.
 * A rejected token, a blocked server or a dead tile host never leaves the map blank.
 */
export function mapSources(): MapSource[] {
  const sources: MapSource[] = [];
  if (hasMapboxToken()) sources.push({ id: 'mapbox', engine: 'mapbox', style: getMapboxStyle() });
  sources.push(
    { id: 'openfreemap', engine: 'maplibre', style: 'https://tiles.openfreemap.org/styles/liberty' },
    {
      id: 'carto',
      engine: 'maplibre',
      style: rasterStyle(
        ['a', 'b', 'c', 'd'].map((s) => `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`),
        '© OpenStreetMap contributors © CARTO',
      ),
    },
    {
      id: 'osm',
      engine: 'maplibre',
      style: rasterStyle(['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], '© OpenStreetMap contributors'),
    },
  );
  return sources;
}

export { getMapboxToken };

/**
 * Picks the map source and falls back to the next one when the style fails to load
 * or no tile arrives in time. Spread `mapProps` on the react-map-gl <Map>, and key the
 * <Map> on `source.id` so a fallback mounts a fresh map.
 */
export function useMapSourceFallback() {
  const sources = useMemo(mapSources, []);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const styleLoaded = useRef(false);
  const readyRef = useRef(false);

  const indexRef = useRef(0);
  const advancedFrom = useRef(-1);
  const [mapboxProblem, setMapboxProblem] = useState<string | null>(null);

  const noteFailure = useCallback(
    (reason: string) => {
      if (sources[indexRef.current]?.engine !== 'mapbox') return;
      setMapboxProblem(reason);
      console.warn(`[carte] Mapbox indisponible : ${reason}. Bascule sur une carte gratuite.`);
    },
    [sources],
  );

  /** Move past the current source, once (many failures may report the same source). */
  const next = useCallback(() => {
    const current = indexRef.current;
    if (readyRef.current || advancedFrom.current === current) return;
    advancedFrom.current = current;
    setIndex(current + 1);
  }, []);

  useEffect(() => {
    indexRef.current = index;
    styleLoaded.current = false;
    readyRef.current = false;
    setReady(false);
    if (index >= sources.length) return;
    const timer = window.setTimeout(() => {
      if (!readyRef.current) noteFailure(`aucune tuile reçue en ${NO_TILE_TIMEOUT_MS / 1000} s`);
      next();
    }, NO_TILE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [index, sources.length, next, noteFailure]);

  const markReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    setReady(true);
  }, []);

  const source = sources[index] ?? null;

  return {
    source,
    ready,
    /** For admins: why the map is not Mapbox (null when Mapbox works or no key is set). */
    diagnostic: hasMapboxToken()
      ? mapboxProblem
        ? `Mapbox : ${mapboxProblem}`
        : null
      : 'Mapbox : aucune clé VITE_MAPBOX_TOKEN dans ce déploiement',
    sourceId: source?.id ?? null,
    failed: index >= sources.length,
    retry: () => {
      advancedFrom.current = -1;
      setIndex(0);
    },
    mapProps: {
      onLoad: () => {
        styleLoaded.current = true;
      },
      // A style that cannot load (bad token, blocked host) fails before 'load'.
      // Tile errors carry a source and are left to the no-tile timer.
      onError: (e: { sourceId?: string; tile?: unknown; error?: { message?: string; status?: number } }) => {
        if (styleLoaded.current || e.sourceId || e.tile) return;
        const status = e.error?.status;
        noteFailure(
          status === 401 || status === 403
            ? `clé refusée par Mapbox (${status}) — vérifiez la clé et ses URL autorisées`
            : e.error?.message || 'style Mapbox impossible à charger',
        );
        next();
      },
      // The first base-map tile that actually arrives proves this source works
      // (GeoJSON overlays such as the route line are tiled locally and prove nothing).
      onSourceData: (e: { tile?: { state?: string }; source?: { type?: string } }) => {
        if (e.tile?.state === 'loaded' && e.source?.type !== 'geojson') markReady();
      },
      ...(source?.engine === 'mapbox' ? { mapboxAccessToken: getMapboxToken() } : {}),
      mapStyle: source?.style,
    },
  };
}
