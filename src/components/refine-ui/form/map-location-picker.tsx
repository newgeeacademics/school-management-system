'use client';

import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

type MapLocationPickerProps = {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
};

const defaultCenter: [number, number] = [5.3364, -4.0267];

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapLocationPicker({ lat, lng, onChange }: MapLocationPickerProps) {
  const position: [number, number] | null =
    typeof lat === 'number' && typeof lng === 'number' ? [lat, lng] : null;

  return (
    <div className='w-full h-72 overflow-hidden rounded-xl border border-gray-200'>
      <MapContainer
        center={position ?? defaultCenter}
        zoom={position ? 15 : 12}
        scrollWheelZoom
        className='h-full w-full'
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <ClickHandler onChange={onChange} />
        {position && <Marker position={position} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
