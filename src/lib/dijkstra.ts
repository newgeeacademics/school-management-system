/**
 * Dijkstra's algorithm: shortest path in a weighted graph.
 * Returns the ordered list of node ids from start to end, or empty if no path.
 */
export function dijkstra(
  graph: Map<string, { neighborId: string; weight: number }[]>,
  startId: string,
  endId: string,
): string[] {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | undefined>();
  const unvisited = new Set<string>();

  for (const nodeId of graph.keys()) {
    dist.set(nodeId, nodeId === startId ? 0 : Infinity);
    prev.set(nodeId, undefined);
    unvisited.add(nodeId);
  }

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id) ?? Infinity;
      if (d < minDist) {
        minDist = d;
        current = id;
      }
    }
    if (current === null || current === endId || minDist === Infinity) break;

    unvisited.delete(current);
    const neighbors = graph.get(current) ?? [];
    for (const { neighborId, weight } of neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const alt = (dist.get(current) ?? Infinity) + weight;
      const currentDist = dist.get(neighborId) ?? Infinity;
      if (alt < currentDist) {
        dist.set(neighborId, alt);
        prev.set(neighborId, current);
      }
    }
  }

  const path: string[] = [];
  let u: string | undefined = endId;
  while (u !== undefined) {
    path.unshift(u);
    u = prev.get(u);
  }
  if (path[0] !== startId) return [];
  return path;
}
