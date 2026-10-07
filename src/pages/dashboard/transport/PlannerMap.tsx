import React from 'react';
import MapboxMap, {
  Layer as MapboxLayer,
  Marker as MapboxMarker,
  Source as MapboxSource,
} from 'react-map-gl/mapbox';
import OpenMap, {
  Layer as OpenLayer,
  Marker as OpenMarker,
  Source as OpenSource,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Crosshair, Minus, Plus, School } from 'lucide-react';

import { useMapSourceFallback } from '../../../../shared/map-sources';
import { MapStatus } from '../../../../shared/MapStatus';

const COUNTRY_VIEW = { latitude: 7.54, longitude: -5.55, zoom: 6 };

export type PlannerPoint = { id: string; name: string; lat: number; lng: number };

type MinimalMap = {
  fitBounds: (b: [[number, number], [number, number]], o?: { padding?: number | { top: number; right: number; bottom: number; left: number }; maxZoom?: number; duration?: number }) => void;
  flyTo: (o: { center: [number, number]; zoom?: number; duration?: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resize: () => void;
};

type PlannerMapProps = {
  stops: PlannerPoint[];
  school?: PlannerPoint | null;
  polyline: [number, number][];
  /** Pixels hidden behind the side panel, so framing keeps points visible. */
  padding?: { top: number; right: number; bottom: number; left: number };
  onAddStop?: (lat: number, lng: number) => void;
  onSelectStop?: (id: string) => void;
  selectedId?: string | null;
  className?: string;
  /** Show why Mapbox is not used (for school admins). */
  showDiagnostic?: boolean;
};

function frame(map: MinimalMap | undefined, points: { lat: number; lng: number }[], padding: PlannerMapProps['padding']) {
  if (!map) return;
  if (points.length === 0) return;
  if (points.length === 1) {
    map.flyTo({ center: [points[0].lng, points[0].lat], zoom: 14, duration: 600 });
    return;
  }
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: padding ?? 60, maxZoom: 15, duration: 600 },
  );
}

const pinStyle = (bg: string, selected: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: selected ? 34 : 28,
  height: selected ? 34 : 28,
  borderRadius: '9999px',
  background: bg,
  color: '#fff',
  fontSize: 12,
  fontWeight: 700,
  border: '3px solid #fff',
  boxShadow: '0 2px 8px rgba(15,23,42,.35)',
  cursor: 'pointer',
  transition: 'all .15s',
});

const ctrlBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  background: '#fff',
  border: 'none',
  color: '#0f172a',
  cursor: 'pointer',
};

/** Map for planning a bus line: tap to add a stop, numbered pins, road path, school pin. */
export function PlannerMap(props: PlannerMapProps) {
  const { stops, school, polyline, padding, onAddStop, onSelectStop, selectedId, className, showDiagnostic } = props;
  const base = useMapSourceFallback();
  const useMapbox = base.source?.engine === 'mapbox';
  const Map = (useMapbox ? MapboxMap : OpenMap) as unknown as React.ComponentType<Record<string, unknown>>;
  const Marker = (useMapbox ? MapboxMarker : OpenMarker) as unknown as React.ComponentType<Record<string, unknown>>;
  const Source = (useMapbox ? MapboxSource : OpenSource) as unknown as React.ComponentType<Record<string, unknown>>;
  const Layer = (useMapbox ? MapboxLayer : OpenLayer) as unknown as React.ComponentType<Record<string, unknown>>;

  const mapRef = React.useRef<{ getMap: () => MinimalMap } | null>(null);
  const getMap = () => mapRef.current?.getMap();

  const allPoints = React.useMemo(
    () => [...stops, ...(school ? [school] : [])],
    [stops, school],
  );

  // Re-frame when a stop is added/removed or the school position arrives (not on rename).
  const frameKey = allPoints.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|');
  const lastCount = React.useRef(0);
  React.useEffect(() => {
    const prev = lastCount.current;
    lastCount.current = allPoints.length;
    // A stop added by tapping should not move the map under the finger (except the first ones).
    if (prev >= 2 && allPoints.length === prev + 1) return;
    frame(getMap(), allPoints, padding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey]);

  const lineData = React.useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: polyline.map(([lat, lng]) => [lng, lat]) },
    }),
    [polyline],
  );

  const initialViewState = school
    ? { latitude: school.lat, longitude: school.lng, zoom: 13 }
    : COUNTRY_VIEW;

  return (
    <div className={className} style={{ position: 'relative' }}>
      <MapStatus ready={base.ready} failed={base.failed} onRetry={base.retry} />
      {showDiagnostic && base.diagnostic ? (
        <div
          title={base.diagnostic}
          style={{
            position: 'absolute',
            top: 12,
            right: 64,
            zIndex: 2,
            maxWidth: 'min(70%, 420px)',
            padding: '6px 10px',
            borderRadius: 10,
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            color: '#92400e',
            fontSize: 11,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(15,23,42,.12)',
          }}
        >
          {base.diagnostic} · carte gratuite affichée
        </div>
      ) : null}
      {base.source ? (
      <Map
        key={base.source.id}
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        {...base.mapProps}
        attributionControl={{ compact: true }}
        cursor={onAddStop ? 'crosshair' : 'grab'}
        onClick={(e: { lngLat: { lat: number; lng: number } }) => onAddStop?.(e.lngLat.lat, e.lngLat.lng)}
        onLoad={() => {
          base.mapProps.onLoad();
          getMap()?.resize();
          frame(getMap(), allPoints, padding);
          window.requestAnimationFrame(() => frame(getMap(), allPoints, padding));
        }}
      >
        {polyline.length >= 2 ? (
          <Source id='planner-route' type='geojson' data={lineData}>
            <Layer
              id='planner-route-casing'
              type='line'
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': '#1e3a8a', 'line-width': 9, 'line-opacity': 0.35 }}
            />
            <Layer
              id='planner-route-line'
              type='line'
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': '#2563eb', 'line-width': 5 }}
            />
          </Source>
        ) : null}

        {stops.map((stop, index) => (
          <Marker key={stop.id} latitude={stop.lat} longitude={stop.lng} anchor='center'>
            <div
              role='button'
              title={stop.name}
              onClick={(e) => {
                e.stopPropagation();
                onSelectStop?.(stop.id);
              }}
              style={pinStyle(index === 0 ? '#16a34a' : '#2563eb', selectedId === stop.id)}
            >
              {index + 1}
            </div>
          </Marker>
        ))}

        {school ? (
          <Marker latitude={school.lat} longitude={school.lng} anchor='bottom'>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} title={school.name}>
              <div
                style={{
                  ...pinStyle('#ea580c', false),
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  cursor: 'default',
                }}
              >
                <School size={18} />
              </div>
              <div style={{ width: 3, height: 10, background: '#ea580c' }} />
            </div>
          </Marker>
        ) : null}
      </Map>
      ) : null}

      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: (padding?.bottom ?? 0) + 24,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(15,23,42,.18)',
          zIndex: 2,
        }}
      >
        <button type='button' style={ctrlBtn} aria-label='Zoomer' onClick={() => getMap()?.zoomIn()}>
          <Plus size={18} />
        </button>
        <button
          type='button'
          style={{ ...ctrlBtn, borderTop: '1px solid #e2e8f0' }}
          aria-label='Dézoomer'
          onClick={() => getMap()?.zoomOut()}
        >
          <Minus size={18} />
        </button>
        <button
          type='button'
          style={{ ...ctrlBtn, borderTop: '1px solid #e2e8f0' }}
          aria-label='Recentrer'
          onClick={() => frame(getMap(), allPoints, padding)}
        >
          <Crosshair size={18} />
        </button>
      </div>
    </div>
  );
}
