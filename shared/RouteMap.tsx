import React, { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { LngLatBounds } from 'mapbox-gl';

import { getMapboxStyle, getMapboxToken, hasMapboxToken } from './mapbox';

export type RouteMapNode = { id: string; name: string; lat: number; lng: number };

const pathWeight = 4;
const SEGMENT_COLORS = ['#22c55e', '#2563eb', '#3b82f6', '#a855f7', '#ec4899', '#ef4444'];
const MARKER_COLORS = { start: '#22c55e', end: '#ef4444', stop: '#3b82f6', default: '#94a3b8' } as const;
const DEFAULT_CENTER = { lat: 7.54, lng: -5.55 };
const DEFAULT_ZOOM = 6;

function splitPolylineByWaypoints(
  polyline: [number, number][],
  waypoints: { lat: number; lng: number }[],
): [number, number][][] {
  if (polyline.length < 2 || waypoints.length < 2) return [polyline];
  const indices: number[] = [];
  for (let w = 0; w < waypoints.length; w++) {
    const wp = waypoints[w];
    const start = w === 0 ? 0 : indices[w - 1];
    let best = start;
    let bestDist = Infinity;
    for (let i = start; i < polyline.length; i++) {
      const [lat, lng] = polyline[i];
      const d = (lat - wp.lat) ** 2 + (lng - wp.lng) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    indices.push(best);
  }
  const segments: [number, number][][] = [];
  for (let s = 0; s < indices.length - 1; s++) {
    segments.push(polyline.slice(indices[s], indices[s + 1] + 1));
  }
  return segments;
}

function circleMarker(color: string, size = 20) {
  return (
    <div
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}
    />
  );
}

function lineGeoJson(segment: [number, number][]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: segment.map(([lat, lng]) => [lng, lat]),
    },
  };
}

type RouteMapProps = {
  nodes: RouteMapNode[];
  pathNodeIds: string[];
  roadRoutePositions?: [number, number][] | null;
  startStopId?: string;
  endStopId?: string;
  stopIds?: string[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onSelectNode?: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onRemoveNode?: (id: string) => void;
  savedRoutes?: { polyline: [number, number][]; waypoints?: { lat: number; lng: number; name: string }[] }[];
};

export const RouteMap: React.FC<RouteMapProps> = ({
  nodes,
  pathNodeIds,
  roadRoutePositions,
  startStopId = '',
  endStopId = '',
  stopIds = [],
  center,
  zoom,
  className = 'h-[360px] w-full rounded-lg z-0',
  onSelectNode,
  onMapClick,
  onRemoveNode,
  savedRoutes = [],
}) => {
  const mapRef = useRef<MapRef>(null);
  const [popupNodeId, setPopupNodeId] = useState<string | null>(null);
  const token = getMapboxToken();

  const getMarkerColor = (nodeId: string) => {
    if (nodeId === startStopId) return MARKER_COLORS.start;
    if (nodeId === endStopId) return MARKER_COLORS.end;
    if (stopIds.includes(nodeId)) return MARKER_COLORS.stop;
    return MARKER_COLORS.default;
  };

  const isDefaultCountryView = !center && !nodes.length;
  const initialCenter = center
    ? { lat: center[0], lng: center[1] }
    : nodes.length
      ? { lat: nodes[0].lat, lng: nodes[0].lng }
      : DEFAULT_CENTER;
  const initialZoom = isDefaultCountryView ? DEFAULT_ZOOM : (zoom ?? 13);

  const straightPathPositions = useMemo(
    () =>
      pathNodeIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter(Boolean)
        .map((n) => [n!.lat, n!.lng] as [number, number]),
    [pathNodeIds, nodes],
  );

  const linePositions =
    roadRoutePositions && roadRoutePositions.length >= 2 ? roadRoutePositions : straightPathPositions;

  const pathWaypoints = useMemo(
    () =>
      pathNodeIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter(Boolean)
        .map((n) => ({ lat: n!.lat, lng: n!.lng })),
    [pathNodeIds, nodes],
  );

  const currentRouteSegments = useMemo(() => {
    if (linePositions.length < 2) return [];
    return splitPolylineByWaypoints(linePositions, pathWaypoints);
  }, [linePositions, pathWaypoints]);

  const fitPoints = useMemo(() => {
    const points: [number, number][] = [];
    if (roadRoutePositions?.length) points.push(...roadRoutePositions);
    else if (pathNodeIds.length >= 2) {
      pathNodeIds.forEach((id) => {
        const n = nodes.find((node) => node.id === id);
        if (n) points.push([n.lat, n.lng]);
      });
    } else if (savedRoutes.length && !nodes.length) {
      savedRoutes.forEach((sr) => {
        if (sr.polyline.length >= 2) points.push(...sr.polyline);
      });
    }
    return points;
  }, [roadRoutePositions, pathNodeIds, nodes, savedRoutes]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || fitPoints.length < 2) return;
    const bounds = new LngLatBounds();
    fitPoints.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
  }, [fitPoints]);

  if (!hasMapboxToken()) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground`}>
        Add <code className="mx-1">VITE_MAPBOX_TOKEN</code> to <code>.env.local</code>
      </div>
    );
  }

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{ longitude: initialCenter.lng, latitude: initialCenter.lat, zoom: initialZoom }}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        mapStyle={getMapboxStyle()}
        onClick={(e) => onMapClick?.(e.lngLat.lat, e.lngLat.lng)}
      >
        {currentRouteSegments.map((segment, segIdx) =>
          segment.length >= 2 ? (
            <Source key={`route-${segIdx}`} id={`route-${segIdx}`} type="geojson" data={lineGeoJson(segment)}>
              <Layer
                id={`route-line-${segIdx}`}
                type="line"
                paint={{ 'line-color': SEGMENT_COLORS[segIdx % SEGMENT_COLORS.length], 'line-width': pathWeight }}
              />
            </Source>
          ) : null,
        )}

        {savedRoutes.map((sr, idx) => {
          const waypointsForSplit =
            sr.waypoints && sr.waypoints.length >= 2 ? sr.waypoints.map((w) => ({ lat: w.lat, lng: w.lng })) : [];
          const segments =
            sr.polyline.length >= 2 && waypointsForSplit.length >= 2
              ? splitPolylineByWaypoints(sr.polyline, waypointsForSplit)
              : sr.polyline.length >= 2
                ? [sr.polyline]
                : [];
          return (
            <React.Fragment key={idx}>
              {segments.map((segment, segIdx) =>
                segment.length >= 2 ? (
                  <Source key={`saved-${idx}-${segIdx}`} id={`saved-${idx}-${segIdx}`} type="geojson" data={lineGeoJson(segment)}>
                    <Layer
                      id={`saved-line-${idx}-${segIdx}`}
                      type="line"
                      paint={{ 'line-color': SEGMENT_COLORS[segIdx % SEGMENT_COLORS.length], 'line-width': pathWeight }}
                    />
                  </Source>
                ) : null,
              )}
              {sr.waypoints?.map((wp, widx) => (
                <Marker key={`wp-${idx}-${widx}`} longitude={wp.lng} latitude={wp.lat} anchor="center">
                  {circleMarker(SEGMENT_COLORS[widx % SEGMENT_COLORS.length])}
                  <Popup longitude={wp.lng} latitude={wp.lat} closeButton={false} anchor="bottom">
                    {wp.name}
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}

        {nodes.map((node) => (
          <Marker
            key={node.id}
            longitude={node.lng}
            latitude={node.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectNode?.(node.id);
              setPopupNodeId(node.id);
            }}
          >
            {circleMarker(getMarkerColor(node.id))}
            {popupNodeId === node.id && (
              <Popup
                longitude={node.lng}
                latitude={node.lat}
                anchor="bottom"
                onClose={() => setPopupNodeId(null)}
                closeOnClick={false}
              >
                <span className="block text-sm font-medium">
                  {node.id === startStopId
                    ? `Départ – ${node.name}`
                    : node.id === endStopId
                      ? `Arrivée – ${node.name}`
                      : stopIds.includes(node.id)
                        ? `Arrêt ${stopIds.indexOf(node.id) + 1} – ${node.name}`
                        : node.name}
                </span>
                {onRemoveNode && (
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-600 hover:underline"
                    onClick={() => onRemoveNode(node.id)}
                  >
                    Supprimer de la carte
                  </button>
                )}
              </Popup>
            )}
          </Marker>
        ))}
      </Map>
    </div>
  );
};
