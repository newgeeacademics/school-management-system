import { useEffect, useMemo, useRef } from 'react';
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { LngLatBounds } from 'mapbox-gl';

import { getMapboxStyle, getMapboxToken, hasMapboxToken } from './mapbox';

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

const defaultCenter = { lat: 7.54, lng: -5.55 };

function stopDot(color: string) {
  return (
    <div
      style={{
        background: color,
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
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

type TrackingMapProps = {
  waypoints: TrackingWaypoint[];
  routePolyline: number[][];
  livePosition: TrackingPosition | null;
  driverPosition?: TrackingPosition | null;
  students?: TrackingStudent[];
  className?: string;
};

export function TrackingMap({
  waypoints,
  routePolyline,
  livePosition,
  driverPosition = null,
  students = [],
  className = 'h-[420px] w-full rounded-xl',
}: TrackingMapProps) {
  const mapRef = useRef<MapRef>(null);
  const token = getMapboxToken();

  const center =
    livePosition != null
      ? { lat: livePosition.lat, lng: livePosition.lng }
      : waypoints[0]
        ? { lat: waypoints[0].lat, lng: waypoints[0].lng }
        : defaultCenter;

  const studentsWithPosition = students.filter(
    (s) => s.lat != null && s.lng != null && Number.isFinite(s.lat) && Number.isFinite(s.lng),
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

  useEffect(() => {
    const map = mapRef.current?.getMap();
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
    const bounds = new LngLatBounds();
    points.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 40, maxZoom: 15 });
  }, [routePolyline, livePosition, studentsWithPosition]);

  if (!hasMapboxToken()) {
    return (
      <div className={`${className} flex items-center justify-center rounded-xl border bg-muted/40 p-4 text-center text-sm text-muted-foreground`}>
        Add <code className="mx-1">VITE_MAPBOX_TOKEN</code> to <code>.env.local</code>
      </div>
    );
  }

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 13 }}
        style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
        mapStyle={getMapboxStyle()}
      >
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer id="route-line" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 5, 'line-opacity': 0.85 }} />
          </Source>
        )}

        {waypoints.map((wp, idx) => (
          <Marker key={wp.id} longitude={wp.lng} latitude={wp.lat} anchor="center">
            {stopDot(idx === 0 ? '#22c55e' : idx === waypoints.length - 1 ? '#ef4444' : '#3b82f6')}
            <Popup longitude={wp.lng} latitude={wp.lat} closeButton={false} anchor="bottom">
              {wp.name}
            </Popup>
          </Marker>
        ))}

        {studentsWithPosition.map((student) => (
          <Marker key={`student-${student.id}`} longitude={student.lng!} latitude={student.lat!} anchor="center">
            {emojiPin(student.trackingStatus === 'ON_BUS' ? '#ea580c' : '#0ea5e9', '🎒', 22)}
            <Popup longitude={student.lng!} latitude={student.lat!} closeButton={false} anchor="bottom">
              {student.name}
              {student.className ? <span className="block text-xs text-muted-foreground">{student.className}</span> : null}
              <span className="block text-xs">
                {student.trackingStatus === 'ON_BUS' ? 'À bord du bus' : 'Point de ramassage'}
              </span>
            </Popup>
          </Marker>
        ))}

        {livePosition && (
          <Marker longitude={livePosition.lng} latitude={livePosition.lat} anchor="center">
            {emojiPin('#ea580c', '🚌', 28)}
            <Popup longitude={livePosition.lng} latitude={livePosition.lat} closeButton={false} anchor="bottom">
              Bus en route
              {livePosition.speedKmh != null && (
                <span className="block text-xs">{Math.round(livePosition.speedKmh)} km/h</span>
              )}
            </Popup>
          </Marker>
        )}

        {driverPosition &&
          (livePosition == null ||
            Math.abs(driverPosition.lat - livePosition.lat) > 0.0001 ||
            Math.abs(driverPosition.lng - livePosition.lng) > 0.0001) && (
          <Marker longitude={driverPosition.lng} latitude={driverPosition.lat} anchor="center">
            {emojiPin('#7c3aed', '👤', 26)}
            <Popup longitude={driverPosition.lng} latitude={driverPosition.lat} closeButton={false} anchor="bottom">
              Chauffeur
            </Popup>
          </Marker>
        )}
      </Map>
    </div>
  );
}
