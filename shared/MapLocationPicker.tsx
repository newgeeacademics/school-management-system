'use client';

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';

import { getMapboxStyle, getMapboxToken, hasMapboxToken } from './mapbox';

type MapLocationPickerProps = {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
};

const defaultCenter = { lat: 5.3364, lng: -4.0267 };

export function MapLocationPicker({ lat, lng, onChange }: MapLocationPickerProps) {
  const token = getMapboxToken();
  const hasPosition = typeof lat === 'number' && typeof lng === 'number';
  const [view, setView] = useState({
    longitude: hasPosition ? lng! : defaultCenter.lng,
    latitude: hasPosition ? lat! : defaultCenter.lat,
    zoom: hasPosition ? 15 : 12,
  });

  if (!hasMapboxToken()) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl border border-gray-200 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        Add <code className="mx-1">VITE_MAPBOX_TOKEN</code> to <code>.env.local</code>
      </div>
    );
  }

  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-gray-200">
      <Map
        {...view}
        onMove={(e) => setView(e.viewState)}
        mapboxAccessToken={token}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapboxStyle()}
        onClick={(e) => onChange(e.lngLat.lat, e.lngLat.lng)}
      >
        {hasPosition && (
          <Marker longitude={lng!} latitude={lat!} anchor="bottom" color="#2563eb" />
        )}
      </Map>
    </div>
  );
}
