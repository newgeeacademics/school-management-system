import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LivePosition, LiveStudent, LiveWaypoint } from '@/lib/tracking-api';

const defaultCenter: [number, number] = [7.54, -5.55];

const busIcon = L.divIcon({
  className: 'leaflet-div-icon',
  html: `<div style="background:#ea580c;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:14px;">🚌</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const driverIcon = L.divIcon({
  className: 'leaflet-div-icon',
  html: `<div style="background:#7c3aed;width:26px;height:26px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:13px;">👤</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function studentIcon(onBus: boolean) {
  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `<div style="background:${onBus ? '#ea580c' : '#0ea5e9'};width:22px;height:22px;border-radius:50%;border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;">🎒</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function stopIcon(color: string) {
  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({
  polyline,
  livePosition,
  students,
}: {
  polyline: number[][];
  livePosition: LivePosition | null;
  students: LiveStudent[];
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = polyline.map((p) => [p[0], p[1]] as [number, number]);
    if (livePosition) points.push([livePosition.lat, livePosition.lng]);
    for (const student of students) {
      if (student.lat != null && student.lng != null) {
        points.push([student.lat, student.lng]);
      }
    }
    if (points.length < 1) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
  }, [map, polyline, livePosition, students]);
  return null;
}

type TrackingMapProps = {
  waypoints: LiveWaypoint[];
  routePolyline: number[][];
  livePosition: LivePosition | null;
  driverPosition?: LivePosition | null;
  students?: LiveStudent[];
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
  const polylinePositions = routePolyline.map((p) => [p[0], p[1]] as [number, number]);
  const center: [number, number] =
    livePosition != null
      ? [livePosition.lat, livePosition.lng]
      : waypoints[0]
        ? [waypoints[0].lat, waypoints[0].lng]
        : defaultCenter;

  const studentsWithPosition = students.filter(
    (s) => s.lat != null && s.lng != null && Number.isFinite(s.lat) && Number.isFinite(s.lng),
  );

  return (
    <div className={className}>
      <MapContainer center={center} zoom={13} className='h-full w-full rounded-xl' scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {polylinePositions.length >= 2 && (
          <Polyline positions={polylinePositions} color='#2563eb' weight={5} opacity={0.85} />
        )}
        {waypoints.map((wp, idx) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lng]}
            icon={stopIcon(idx === 0 ? '#22c55e' : idx === waypoints.length - 1 ? '#ef4444' : '#3b82f6')}
          >
            <Popup>{wp.name}</Popup>
          </Marker>
        ))}
        {studentsWithPosition.map((student) => (
          <Marker
            key={`student-${student.id}`}
            position={[student.lat!, student.lng!]}
            icon={studentIcon(student.trackingStatus === 'ON_BUS')}
          >
            <Popup>
              {student.name}
              {student.className ? (
                <span className='block text-xs text-muted-foreground'>{student.className}</span>
              ) : null}
              <span className='block text-xs'>
                {student.trackingStatus === 'ON_BUS' ? 'À bord du bus' : 'Point de ramassage'}
              </span>
            </Popup>
          </Marker>
        ))}
        {livePosition && (
          <Marker position={[livePosition.lat, livePosition.lng]} icon={busIcon}>
            <Popup>
              Bus en route
              {livePosition.speedKmh != null && (
                <span className='block text-xs'>{Math.round(livePosition.speedKmh)} km/h</span>
              )}
            </Popup>
          </Marker>
        )}
        {driverPosition &&
          (livePosition == null ||
            Math.abs(driverPosition.lat - livePosition.lat) > 0.0001 ||
            Math.abs(driverPosition.lng - livePosition.lng) > 0.0001) && (
          <Marker position={[driverPosition.lat, driverPosition.lng]} icon={driverIcon}>
            <Popup>Chauffeur</Popup>
          </Marker>
        )}
        <FitBounds polyline={routePolyline} livePosition={livePosition} students={studentsWithPosition} />
      </MapContainer>
    </div>
  );
}
