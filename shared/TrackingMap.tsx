import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';

import { getMapboxStyle, getMapboxToken } from './mapbox';

export type TrackingWaypoint = { id: string; name: string; lat: number; lng: number };
export type TrackingPosition = { lat: number; lng: number; speedKmh?: number | null };
export type TrackingStudent = {
  id: string;
  name: string;
  className?: string | null;
  lat?: number | null;
  lng?: number | null;
  trackingStatus?: string | null;
};

/** Côte d'Ivoire, shown whole until a route or the bus gives the map something to frame. */
const defaultCenter = { lat: 7.54, lng: -5.55 };
const COUNTRY_ZOOM = 6;
const ROUTE_ZOOM = 13;

function stopDot(color: string) {
  return (
    <div
      style={{
        background: color,
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 2px 6px rgba(15,23,42,0.25)',
      }}
    />
  );
}

function emojiPin(bg: string, emoji: string, size: number) {
  return (
    <div
      style={{
        background: bg,
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid white',
        boxShadow: '0 6px 16px rgba(15,23,42,0.28), 0 0 0 4px rgba(255,255,255,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
      }}
    >
      {emoji}
    </div>
  );
}

export type TrackingMapProps = {
  waypoints: TrackingWaypoint[];
  routePolyline: number[][];
  livePosition: TrackingPosition | null;
  driverPosition?: TrackingPosition | null;
  students?: TrackingStudent[];
  liveActive?: boolean;
  className?: string;
};

/** Minimal map handle shared by Mapbox GL and MapLibre GL. */
export type FramableMap = {
  setCenter: (center: [number, number]) => unknown;
  setZoom: (zoom: number) => unknown;
  fitBounds: (bounds: [[number, number], [number, number]], options?: { padding?: number; maxZoom?: number }) => unknown;
  resize: () => unknown;
};

/** Center, overlays data and framing, independent of the map engine. */
export function useTrackingMapData({ waypoints, routePolyline, livePosition, students = [] }: TrackingMapProps) {
  const hasSubject = livePosition != null || waypoints.length > 0;
  const center =
    livePosition != null
      ? { lat: livePosition.lat, lng: livePosition.lng }
      : waypoints[0]
        ? { lat: waypoints[0].lat, lng: waypoints[0].lng }
        : defaultCenter;

  const studentsWithPosition = useMemo(
    () =>
      students.filter(
        (s) => s.lat != null && s.lng != null && Number.isFinite(s.lat) && Number.isFinite(s.lng),
      ),
    [students],
  );

  const routeGeoJson = useMemo(() => {
    if (routePolyline.length < 2) return null;
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: routePolyline.map((p) => [p[1], p[0]]),
      },
    };
  }, [routePolyline]);

  /** Frames the route, bus and pupils; call when the map loads and whenever they change. */
  const frame = (map: FramableMap | undefined | null) => {
    if (!map) return;
    const points: [number, number][] = routePolyline.map((p) => [p[0], p[1]] as [number, number]);
    if (livePosition) points.push([livePosition.lat, livePosition.lng]);
    studentsWithPosition.forEach((s) => points.push([s.lat!, s.lng!]));
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setCenter([points[0][1], points[0][0]]);
      map.setZoom(14);
      return;
    }
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 15 },
    );
  };

  return {
    initialViewState: { longitude: center.lng, latitude: center.lat, zoom: hasSubject ? ROUTE_ZOOM : COUNTRY_ZOOM },
    studentsWithPosition,
    routeGeoJson,
    frame,
  };
}

/** Marker / Popup / Source / Layer from whichever react-map-gl build renders the map. */
export type MapComponents = {
  Marker: ComponentType<{
    longitude: number;
    latitude: number;
    anchor?: 'center';
    onClick?: (event: { originalEvent: { stopPropagation: () => void } }) => void;
    children?: ReactNode;
  }>;
  Popup: ComponentType<{ longitude: number; latitude: number; closeButton?: boolean; anchor?: 'bottom'; children?: ReactNode }>;
  Source: ComponentType<{ id: string; type: 'geojson'; data: unknown; children?: ReactNode }>;
  /** Layer props differ slightly between the two builds; both accept the route-line layer. */
  Layer: ComponentType<Record<string, unknown>>;
};

/** Route line, stops, pupils, bus and driver markers. */
export function TrackingOverlays({
  components: { Marker, Popup, Source, Layer },
  waypoints,
  livePosition,
  driverPosition = null,
  liveActive = true,
  studentsWithPosition,
  routeGeoJson,
}: {
  components: MapComponents;
  waypoints: TrackingWaypoint[];
  livePosition: TrackingPosition | null;
  driverPosition?: TrackingPosition | null;
  liveActive?: boolean;
  studentsWithPosition: TrackingStudent[];
  routeGeoJson: unknown;
}) {
  // One label at a time, opened by tapping a marker; the bus label shows by default.
  const [openId, setOpenId] = useState<string | null>('bus');
  const toggle = (id: string) => (event: { originalEvent: { stopPropagation: () => void } }) => {
    event.originalEvent.stopPropagation();
    setOpenId((current) => (current === id ? null : id));
  };
  return (
    <>
      {routeGeoJson != null && (
        <Source id="route" type="geojson" data={routeGeoJson}>
          <Layer
            id="route-line"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': '#2563eb', 'line-width': 6, 'line-opacity': 0.9 }}
          />
        </Source>
      )}

      {waypoints.map((wp, idx) => (
        <Marker key={wp.id} longitude={wp.lng} latitude={wp.lat} anchor="center" onClick={toggle(`stop-${wp.id}`)}>
          {stopDot(idx === 0 ? '#22c55e' : idx === waypoints.length - 1 ? '#ef4444' : '#3b82f6')}
          {openId === `stop-${wp.id}` ? (
            <Popup longitude={wp.lng} latitude={wp.lat} closeButton={false} anchor="bottom">
              {wp.name}
            </Popup>
          ) : null}
        </Marker>
      ))}

      {studentsWithPosition.map((student) => (
        <Marker key={`student-${student.id}`} longitude={student.lng!} latitude={student.lat!} anchor="center" onClick={toggle(`student-${student.id}`)}>
          {emojiPin(student.trackingStatus === 'ON_BUS' ? '#ea580c' : '#0ea5e9', '🎒', 22)}
          {openId === `student-${student.id}` ? (
          <Popup longitude={student.lng!} latitude={student.lat!} closeButton={false} anchor="bottom">
            {student.name}
            {student.className ? <span className="block text-xs text-muted-foreground">{student.className}</span> : null}
            <span className="block text-xs">
              {student.trackingStatus === 'ON_BUS' ? 'À bord du bus' : 'Point de ramassage'}
            </span>
          </Popup>
          ) : null}
        </Marker>
      ))}

      {livePosition && (
        <Marker longitude={livePosition.lng} latitude={livePosition.lat} anchor="center" onClick={toggle('bus')}>
          {emojiPin(liveActive ? '#ea580c' : '#64748b', '🚌', 28)}
          {openId === 'bus' ? (
          <Popup longitude={livePosition.lng} latitude={livePosition.lat} closeButton={false} anchor="bottom">
            {liveActive ? 'Bus en route' : 'Dernière position'}
            {livePosition.speedKmh != null && (
              <span className="block text-xs">{Math.round(livePosition.speedKmh)} km/h</span>
            )}
          </Popup>
          ) : null}
        </Marker>
      )}

      {driverPosition &&
        (livePosition == null ||
          Math.abs(driverPosition.lat - livePosition.lat) > 0.0001 ||
          Math.abs(driverPosition.lng - livePosition.lng) > 0.0001) && (
        <Marker longitude={driverPosition.lng} latitude={driverPosition.lat} anchor="center" onClick={toggle('driver')}>
          {emojiPin('#7c3aed', '👤', 26)}
          {openId === 'driver' ? (
            <Popup longitude={driverPosition.lng} latitude={driverPosition.lat} closeButton={false} anchor="bottom">
              Chauffeur
            </Popup>
          ) : null}
        </Marker>
      )}
    </>
  );
}

/** Mapbox GL map (used when VITE_MAPBOX_TOKEN is set). */
export function TrackingMap(props: TrackingMapProps) {
  const { className = 'h-full w-full', waypoints, livePosition, driverPosition = null, liveActive = true } = props;
  const mapRef = useRef<MapRef>(null);
  const { initialViewState, studentsWithPosition, routeGeoJson, frame } = useTrackingMapData(props);

  useEffect(() => {
    frame(mapRef.current?.getMap() as unknown as FramableMap | undefined);
  }, [props.routePolyline, livePosition, studentsWithPosition]);

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        mapboxAccessToken={getMapboxToken()}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapboxStyle()}
        onLoad={() => {
          const map = mapRef.current?.getMap();
          map?.resize();
          frame(map as unknown as FramableMap | undefined);
        }}
      >
        <TrackingOverlays
          components={{ Marker, Popup, Source, Layer } as unknown as MapComponents}
          waypoints={waypoints}
          livePosition={livePosition}
          driverPosition={driverPosition}
          liveActive={liveActive}
          studentsWithPosition={studentsWithPosition}
          routeGeoJson={routeGeoJson}
        />
      </Map>
    </div>
  );
}
