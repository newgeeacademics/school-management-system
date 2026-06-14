import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LivePosition, LiveWaypoint } from '@/lib/tracking-api';

const defaultCenter: [number, number] = [7.54, -5.55];

const busIcon = L.divIcon({
  className: 'leaflet-div-icon',
  html: `<div style="background:#ea580c;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:14px;">🚌</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

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
}: {
  polyline: number[][];
  livePosition: LivePosition | null;
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = polyline.map((p) => [p[0], p[1]] as [number, number]);
    if (livePosition) points.push([livePosition.lat, livePosition.lng]);
    if (points.length < 1) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
  }, [map, polyline, livePosition]);
  return null;
}

type TrackingMapProps = {
  waypoints: LiveWaypoint[];
  routePolyline: number[][];
  livePosition: LivePosition | null;
  className?: string;
};

export function TrackingMap({
  waypoints,
  routePolyline,
  livePosition,
  className = 'h-[420px] w-full rounded-xl',
}: TrackingMapProps) {
  const polylinePositions = routePolyline.map((p) => [p[0], p[1]] as [number, number]);
  const center: [number, number] =
    livePosition != null
      ? [livePosition.lat, livePosition.lng]
      : waypoints[0]
        ? [waypoints[0].lat, waypoints[0].lng]
        : defaultCenter;

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
        <FitBounds polyline={routePolyline} livePosition={livePosition} />
      </MapContainer>
    </div>
  );
}
