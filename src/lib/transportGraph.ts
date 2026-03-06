/**
 * Graph for transport route visualization: nodes (stops) and edges (segments with distance).
 * Used with Dijkstra to compute shortest path on the map.
 */
export type TransportNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type TransportEdge = {
  fromId: string;
  toId: string;
  weight: number;
};

export const TRANSPORT_NODES: TransportNode[] = [
  { id: 'ecole', name: 'École', lat: 48.8566, lng: 2.3522 },
  { id: 'mairie', name: 'Mairie', lat: 48.8584, lng: 2.3446 },
  { id: 'gare', name: 'Gare', lat: 48.8611, lng: 2.3358 },
  { id: 'centre', name: 'Centre-ville', lat: 48.853, lng: 2.3499 },
  { id: 'stade', name: 'Stade', lat: 48.8496, lng: 2.3386 },
  { id: 'zone_nord', name: 'Zone Nord', lat: 48.862, lng: 2.36 },
];

/** Edges: fromId, toId, weight (approximate distance in arbitrary units for Dijkstra). */
export const TRANSPORT_EDGES: TransportEdge[] = [
  { fromId: 'ecole', toId: 'mairie', weight: 1.2 },
  { fromId: 'ecole', toId: 'centre', weight: 1.8 },
  { fromId: 'mairie', toId: 'gare', weight: 1.0 },
  { fromId: 'mairie', toId: 'centre', weight: 0.9 },
  { fromId: 'gare', toId: 'centre', weight: 1.5 },
  { fromId: 'gare', toId: 'stade', weight: 1.4 },
  { fromId: 'centre', toId: 'stade', weight: 1.1 },
  { fromId: 'centre', toId: 'zone_nord', weight: 2.0 },
  { fromId: 'zone_nord', toId: 'ecole', weight: 1.6 },
  { fromId: 'stade', toId: 'ecole', weight: 1.3 },
];

/** Build adjacency list for Dijkstra (bidirectional). */
export function buildTransportGraph(): Map<
  string,
  { neighborId: string; weight: number }[]
> {
  const graph = new Map<string, { neighborId: string; weight: number }[]>();
  for (const node of TRANSPORT_NODES) {
    graph.set(node.id, []);
  }
  for (const e of TRANSPORT_EDGES) {
    graph.get(e.fromId)!.push({ neighborId: e.toId, weight: e.weight });
    graph.get(e.toId)!.push({ neighborId: e.fromId, weight: e.weight });
  }
  return graph;
}
