import { useEffect, useRef } from 'react';
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  TrackingMap as MapboxTrackingMap,
  MapControls,
  TrackingOverlays,
  useTrackingMapData,
  type FramableMap,
  type MapComponents,
  type TrackingMapProps,
} from '@shared/TrackingMap';
import { hasMapboxToken } from '@shared/mapbox';

/** Free OpenStreetMap vector tiles (no key needed), used when no Mapbox token is configured. */
const OPEN_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function OpenTrackingMap(props: TrackingMapProps) {
  const { className = 'h-full w-full', waypoints, livePosition, driverPosition = null, liveActive = true } = props;
  const mapRef = useRef<MapRef>(null);
  const { initialViewState, studentsWithPosition, routeGeoJson, frame } = useTrackingMapData(props);

  useEffect(() => {
    frame(mapRef.current?.getMap() as unknown as FramableMap | undefined);
  }, [props.routePolyline, livePosition, studentsWithPosition]);

  const getMap = () => mapRef.current?.getMap() as unknown as FramableMap | undefined;
  return (
    <div className={className}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapControls getMap={getMap} onRecenter={() => frame(getMap())} />
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={OPEN_MAP_STYLE}
        attributionControl={{ compact: true }}
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
    </div>
  );
}

/** Full-screen tracking map: Mapbox when VITE_MAPBOX_TOKEN is set, open map tiles otherwise. */
export function TrackingMap(props: TrackingMapProps) {
  return hasMapboxToken() ? <MapboxTrackingMap {...props} /> : <OpenTrackingMap {...props} />;
}
