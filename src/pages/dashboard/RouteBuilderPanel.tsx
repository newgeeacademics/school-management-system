import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { RouteMap } from '@/components/RouteMap';
import { fetchRoadRoute } from '@/lib/osrm';
import { geocodePlace } from '../../../shared/mapbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type RouteStop = { id: string; name: string; lat: number; lng: number };

export type BuiltRoute = {
  waypoints: { lat: number; lng: number; name: string }[];
  routePolyline: [number, number][];
};

type RouteBuilderPanelProps = {
  onChange: (route: BuiltRoute | null) => void;
  className?: string;
};

function stopLabel(index: number, total: number): string {
  if (total === 1) return 'Arrêt';
  if (index === 0) return 'Départ';
  if (index === total - 1) return 'Arrivée';
  return `Arrêt ${index}`;
}

function nextId() {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function RouteBuilderPanel({ onChange, className }: RouteBuilderPanelProps) {
  const [stops, setStops] = React.useState<RouteStop[]>([]);
  const [orderedIds, setOrderedIds] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [roadRoutePositions, setRoadRoutePositions] = React.useState<[number, number][] | null>(
    null,
  );
  const [routeLoading, setRouteLoading] = React.useState(false);

  const orderedStops = useMemo(
    () =>
      orderedIds
        .map((id) => stops.find((s) => s.id === id))
        .filter((s): s is RouteStop => Boolean(s)),
    [orderedIds, stops],
  );

  const startStopId = orderedIds[0] ?? '';
  const endStopId = orderedIds.length > 1 ? orderedIds[orderedIds.length - 1] : '';
  const middleStopIds = orderedIds.length > 2 ? orderedIds.slice(1, -1) : [];

  const addStop = (stop: RouteStop) => {
    setStops((prev) => [...prev, stop]);
    setOrderedIds((prev) => [...prev, stop.id]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearching(true);
    try {
      const place = await geocodePlace(query);
      if (!place) {
        toast.error('Lieu introuvable. Essayez un autre nom.', { richColors: true });
        return;
      }
      addStop({ id: nextId(), name: place.name, lat: place.lat, lng: place.lng });
      setSearchQuery('');
    } catch {
      toast.error('Recherche impossible pour le moment.', { richColors: true });
    } finally {
      setSearching(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    addStop({
      id: nextId(),
      name: `Point (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      lat,
      lng,
    });
  };

  const removeStop = (id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
    setOrderedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const moveStop = (id: string, direction: -1 | 1) => {
    setOrderedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = idx + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  };

  const renameStop = (id: string, name: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const clearAll = () => {
    setStops([]);
    setOrderedIds([]);
    setRoadRoutePositions(null);
  };

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    if (orderedStops.length < 2) {
      setRoadRoutePositions(null);
      return;
    }
    setRouteLoading(true);
    fetchRoadRoute(orderedStops.map((s) => ({ lat: s.lat, lng: s.lng })))
      .then((positions) => setRoadRoutePositions(positions))
      .catch(() => setRoadRoutePositions(null))
      .finally(() => setRouteLoading(false));
  }, [orderedStops]);

  const builtRoute = useMemo((): BuiltRoute | null => {
    if (orderedStops.length < 2 || !roadRoutePositions || roadRoutePositions.length < 2) {
      return null;
    }
    return {
      waypoints: orderedStops.map((s) => ({ lat: s.lat, lng: s.lng, name: s.name })),
      routePolyline: roadRoutePositions,
    };
  }, [orderedStops, roadRoutePositions]);

  React.useEffect(() => {
    onChangeRef.current(builtRoute);
  }, [builtRoute]);

  const mapCenter: [number, number] | undefined =
    orderedStops.length > 0 ? [orderedStops[0].lat, orderedStops[0].lng] : undefined;

  return (
    <div className={className ?? 'space-y-4'}>
      <p className='text-xs text-muted-foreground'>
        Ajoutez les arrêts dans l&apos;ordre du trajet : le premier est le départ, le dernier
        l&apos;arrivée. Recherchez un lieu ou cliquez directement sur la carte.
      </p>

      <form className='flex flex-col gap-2 sm:flex-row sm:items-end' onSubmit={handleSearch}>
        <div className='grid flex-1 gap-1'>
          <Label htmlFor='route-search' className='text-xs'>
            Rechercher un lieu
          </Label>
          <Input
            id='route-search'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Ex : École, Mairie, Gare…'
            disabled={searching}
          />
        </div>
        <Button type='submit' size='sm' disabled={searching || !searchQuery.trim()}>
          {searching ? 'Recherche…' : 'Ajouter'}
        </Button>
      </form>

      {orderedStops.length > 0 ? (
        <div className='space-y-2 rounded-lg border bg-muted/20 p-3'>
          <div className='flex items-center justify-between gap-2'>
            <p className='text-xs font-medium text-foreground'>
              Arrêts ({orderedStops.length})
            </p>
            <Button type='button' variant='ghost' size='sm' className='h-7 text-xs' onClick={clearAll}>
              <Trash2 className='mr-1 size-3' />
              Tout effacer
            </Button>
          </div>
          <ul className='space-y-1.5'>
            {orderedStops.map((stop, index) => (
              <li
                key={stop.id}
                className='flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs'
              >
                <span
                  className='flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white'
                  style={{
                    backgroundColor:
                      index === 0
                        ? '#22c55e'
                        : index === orderedStops.length - 1
                          ? '#ef4444'
                          : '#3b82f6',
                  }}
                >
                  {index + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] text-muted-foreground'>{stopLabel(index, orderedStops.length)}</p>
                  <Input
                    value={stop.name}
                    onChange={(e) => renameStop(stop.id, e.target.value)}
                    className='h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0'
                  />
                </div>
                <div className='flex shrink-0 items-center gap-0.5'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-7'
                    disabled={index === 0}
                    onClick={() => moveStop(stop.id, -1)}
                    aria-label='Monter'
                  >
                    <ChevronUp className='size-3.5' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-7'
                    disabled={index === orderedStops.length - 1}
                    onClick={() => moveStop(stop.id, 1)}
                    aria-label='Descendre'
                  >
                    <ChevronDown className='size-3.5' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-7 text-destructive hover:text-destructive'
                    onClick={() => removeStop(stop.id)}
                    aria-label='Supprimer'
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {orderedStops.length === 1 ? (
            <p className='text-[10px] text-amber-700 dark:text-amber-400'>
              Ajoutez au moins un second arrêt (arrivée) pour tracer l&apos;itinéraire.
            </p>
          ) : null}
          {routeLoading ? (
            <p className='text-[10px] text-muted-foreground'>Calcul du tracé sur les routes…</p>
          ) : orderedStops.length >= 2 && roadRoutePositions ? (
            <p className='flex items-center gap-1 text-[10px] text-muted-foreground'>
              <MapPin className='size-3' />
              Itinéraire prêt — enregistrez la ligne ci-dessus pour le partager avec les parents.
            </p>
          ) : orderedStops.length >= 2 ? (
            <p className='text-[10px] text-muted-foreground'>
              Tracé indisponible pour le moment (vérifiez la connexion).
            </p>
          ) : null}
        </div>
      ) : (
        <p className='rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground'>
          Aucun arrêt. Recherchez un lieu ou cliquez sur la carte pour commencer.
        </p>
      )}

      <RouteMap
        nodes={stops}
        pathNodeIds={orderedIds}
        roadRoutePositions={roadRoutePositions}
        startStopId={startStopId}
        endStopId={endStopId}
        stopIds={middleStopIds}
        center={mapCenter}
        zoom={orderedStops.length > 0 ? 13 : 6}
        className='h-[380px] w-full overflow-hidden rounded-lg border border-border/70'
        onMapClick={handleMapClick}
        onRemoveNode={removeStop}
      />
    </div>
  );
}
