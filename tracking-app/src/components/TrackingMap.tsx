import { useEffect, useRef } from 'react';
import MapboxMap, {
  Layer as MapboxLayer,
  Marker as MapboxMarker,
  Popup as MapboxPopup,
  Source as MapboxSource,
} from 'react-map-gl/mapbox';
import OpenMap, { Layer, Marker, Popup, Source } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ComponentType } from 'react';

import {
  MapControls,
  TrackingOverlays,
  useTrackingMapData,
  type FramableMap,
  type MapComponents,
  type TrackingMapProps,
} from '@shared/TrackingMap';
import { useMapSourceFallback } from '@shared/map-sources';
import { MapStatus } from '@shared/MapStatus';

const OPEN_COMPONENTS = { Marker, Popup, Source, Layer } as unknown as MapComponents;
const MAPBOX_COMPONENTS = {
  Marker: MapboxMarker,
  Popup: MapboxPopup,
  Source: MapboxSource,
  Layer: MapboxLayer,
} as unknown as MapComponents;

/**
 * Full-screen tracking map. Mapbox when VITE_MAPBOX_TOKEN works, otherwise free map
 * tiles; it moves to the next source when one fails, so the map is never left blank.
 */
export function TrackingMap(props: TrackingMapProps) {
  const { className = 'h-full w-full', waypoints, livePosition, driverPosition = null, liveActive = true } = props;
  const mapRef = useRef<{ getMap: () => unknown } | null>(null);
  const { initialViewState, studentsWithPosition, routeGeoJson, frame } = useTrackingMapData(props);
  const base = useMapSourceFallback();
  const isMapbox = base.source?.engine === 'mapbox';
  const Map = (isMapbox ? MapboxMap : OpenMap) as unknown as ComponentType<Record<string, unknown>>;

  const getMap = () => mapRef.current?.getMap() as FramableMap | undefined;

  useEffect(() => {
    frame(getMap());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.routePolyline, livePosition, studentsWithPosition]);

  return (
    <div className={className}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapControls getMap={getMap} onRecenter={() => frame(getMap())} />
        <MapStatus ready={base.ready} failed={base.failed} onRetry={base.retry} />
        {base.source ? (
          <Map
            key={base.source.id}
            ref={mapRef}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            attributionControl={{ compact: true }}
            {...base.mapProps}
            onLoad={() => {
              base.mapProps.onLoad();
              const map = getMap();
              map?.resize();
              frame(map);
            }}
          >
            <TrackingOverlays
              components={isMapbox ? MAPBOX_COMPONENTS : OPEN_COMPONENTS}
              waypoints={waypoints}
              livePosition={livePosition}
              driverPosition={driverPosition}
              liveActive={liveActive}
              studentsWithPosition={studentsWithPosition}
              routeGeoJson={routeGeoJson}
            />
          </Map>
        ) : null}
      </div>
    </div>
  );
}
