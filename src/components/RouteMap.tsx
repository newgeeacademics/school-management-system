import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import type { TransportNode } from '@/lib/transportGraph';

// Fix default icon in Vite/bundler (Leaflet uses path that breaks)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const pathWeight = 4;

/** Different color per segment (between stops). */
const SEGMENT_COLORS = [
  '#22c55e', // green (départ)
  '#2563eb', // blue
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red (arrivée)
];

/** Default map center: Côte d'Ivoire (lat, lng). */
const DEFAULT_CENTER_IVORY_COAST: [number, number] = [7.54, -5.55];
const DEFAULT_ZOOM = 6;

/** Marker colors by stop role */
const MARKER_COLORS = {
  start: '#22c55e',
  end: '#ef4444',
  stop: '#f97316',
  default: '#94a3b8',
} as const;

/** Split a polyline into segments between consecutive waypoints (by closest point). */
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
    const from = indices[s];
    const to = indices[s + 1];
    segments.push(polyline.slice(from, to + 1));
  }
  return segments;
}

function createCircleIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `<div style="background-color:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

type RouteMapProps = {
  nodes: TransportNode[];
  pathNodeIds: string[];
  /** When provided, this road-following route is drawn instead of a straight line. */
  roadRoutePositions?: [number, number][] | null;
  /** Id of the departure stop (green marker). */
  startStopId?: string;
  /** Id of the arrival stop (red marker). */
  endStopId?: string;
  /** Ids of intermediate stops (orange markers). */
  stopIds?: string[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  /** Optional: when provided, clicking a stop on the map will notify the parent. */
  onSelectNode?: (id: string) => void;
  /** Optional: when provided, clicking anywhere on the map will notify the parent with coordinates. */
  onMapClick?: (lat: number, lng: number) => void;
  /** Optional: when provided, marker popups show a button to remove the stop from the map. */
  onRemoveNode?: (id: string) => void;
  /** Saved routes to display (e.g. for parents viewing trajets). */
  savedRoutes?: { polyline: [number, number][]; waypoints?: { lat: number; lng: number; name: string }[] }[];
};

function FitBounds({
  pathNodeIds,
  nodes,
  roadRoutePositions,
}: {
  pathNodeIds: string[];
  nodes: TransportNode[];
  roadRoutePositions?: [number, number][] | null;
}) {
  const map = useMap();
  const pathNodes = useMemo(
    () => pathNodeIds.map((id) => nodes.find((n) => n.id === id)).filter(Boolean) as TransportNode[],
    [pathNodeIds, nodes],
  );
  const boundsPositions = useMemo(
    () =>
      roadRoutePositions?.length
        ? roadRoutePositions
        : pathNodes.map((n) => [n.lat, n.lng] as [number, number]),
    [roadRoutePositions, pathNodes],
  );
  React.useEffect(() => {
    if (boundsPositions.length < 2) return;
    const bounds = L.latLngBounds(boundsPositions as L.LatLngTuple[]);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }, [map, boundsPositions]);
  return null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBoundsSaved({
  savedRoutes,
}: {
  savedRoutes: { polyline: [number, number][] }[];
}) {
  const map = useMap();
  const allPositions = useMemo(() => {
    const positions: [number, number][] = [];
    for (const sr of savedRoutes) {
      if (sr.polyline.length >= 2) positions.push(...sr.polyline);
    }
    return positions;
  }, [savedRoutes]);
  React.useEffect(() => {
    if (allPositions.length < 2) return;
    const bounds = L.latLngBounds(allPositions as L.LatLngTuple[]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, allPositions]);
  return null;
}

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
  const getMarkerIcon = (nodeId: string) => {
    if (nodeId === startStopId) return createCircleIcon(MARKER_COLORS.start);
    if (nodeId === endStopId) return createCircleIcon(MARKER_COLORS.end);
    if (stopIds.includes(nodeId)) return createCircleIcon(MARKER_COLORS.stop);
    return createCircleIcon(MARKER_COLORS.default);
  };
  const effectiveCenter: [number, number] =
    center ?? (nodes.length ? [nodes[0].lat, nodes[0].lng] : DEFAULT_CENTER_IVORY_COAST);
  const isDefaultCountryView =
    !center && !nodes.length;
  const effectiveZoom = isDefaultCountryView ? DEFAULT_ZOOM : (zoom ?? 13);

  const straightPathPositions = useMemo(() => {
    return pathNodeIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean)
      .map((n) => [n!.lat, n!.lng] as [number, number]);
  }, [pathNodeIds, nodes]);

  const linePositions =
    roadRoutePositions && roadRoutePositions.length >= 2
      ? roadRoutePositions
      : straightPathPositions;

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

  return (
    <div className={className}>
      <MapContainer
        center={effectiveCenter}
        zoom={effectiveZoom}
        className='h-full w-full rounded-lg'
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MapClickHandler onMapClick={onMapClick} />
        {nodes.map((node) => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={getMarkerIcon(node.id)}
            eventHandlers={
              onSelectNode
                ? {
                    click: () => onSelectNode(node.id),
                  }
                : undefined
            }
          >
            <Popup>
              <span className='block text-sm font-medium'>
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
                  type='button'
                  className='mt-2 text-xs text-red-600 hover:underline'
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNode(node.id);
                  }}
                >
                  Supprimer de la carte
                </button>
              )}
            </Popup>
          </Marker>
        ))}
        {currentRouteSegments.map((segment, segIdx) =>
          segment.length >= 2 ? (
            <Polyline
              key={segIdx}
              positions={segment}
              color={SEGMENT_COLORS[segIdx % SEGMENT_COLORS.length]}
              weight={pathWeight}
            />
          ) : null,
        )}
        {savedRoutes.map((sr, idx) => {
          const waypointsForSplit =
            sr.waypoints && sr.waypoints.length >= 2
              ? sr.waypoints.map((w) => ({ lat: w.lat, lng: w.lng }))
              : [];
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
                  <Polyline
                    key={segIdx}
                    positions={segment}
                    color={SEGMENT_COLORS[segIdx % SEGMENT_COLORS.length]}
                    weight={pathWeight}
                  />
                ) : null,
              )}
              {sr.waypoints?.map((wp, widx) => (
                <Marker
                  key={widx}
                  position={[wp.lat, wp.lng]}
                  icon={createCircleIcon(
                    SEGMENT_COLORS[widx % SEGMENT_COLORS.length],
                  )}
                >
                  <Popup>{wp.name}</Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
        {pathNodeIds.length >= 2 && (
          <FitBounds
            pathNodeIds={pathNodeIds}
            nodes={nodes}
            roadRoutePositions={roadRoutePositions}
          />
        )}
        {savedRoutes.length > 0 && nodes.length === 0 && (
          <FitBoundsSaved savedRoutes={savedRoutes} />
        )}
      </MapContainer>
    </div>
  );
};
