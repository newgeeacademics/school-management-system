import React, { useMemo } from 'react';

import { RouteMap } from '@/components/RouteMap';
import { fetchRoadRoute } from '@/lib/osrm';
import { TRANSPORT_NODES } from '@/lib/transportGraph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  NewTransportRouteFormState,
  TransportRoute,
  SetStateAction,
  Student,
} from './dashboardTypes';

type TransportSectionProps = {
  routes: TransportRoute[];
  newRoute: NewTransportRouteFormState;
  setNewRoute: SetStateAction<NewTransportRouteFormState>;
  onCreateRoute: (e: React.FormEvent, payload?: { waypoints: { lat: number; lng: number; name: string }[]; routePolyline: [number, number][] }) => void;
  onUpdateRouteStudents?: (routeId: string, studentIds: string[]) => void;
  readOnly?: boolean;
  students?: Student[];
  currentStudentId?: string | null;
  onStudentIdChange?: (id: string) => void;
};

export const TransportSection: React.FC<TransportSectionProps> = ({
  routes,
  newRoute,
  setNewRoute,
  onCreateRoute,
  onUpdateRouteStudents,
  readOnly = false,
  students = [],
  currentStudentId,
  onStudentIdChange,
}) => {
  const [startStopId, setStartStopId] = React.useState<string>('');
  const [endStopId, setEndStopId] = React.useState<string>('');
  const [stopIds, setStopIds] = React.useState<string[]>([]);
  const [selectionMode, setSelectionMode] = React.useState<'start' | 'stop' | 'end'>('start');
  const [startQuery, setStartQuery] = React.useState('');
  const [endQuery, setEndQuery] = React.useState('');
  const [stopQuery, setStopQuery] = React.useState('');
  const [stops, setStops] = React.useState(TRANSPORT_NODES);
  const [roadRoutePositions, setRoadRoutePositions] = React.useState<
    [number, number][] | null
  >(null);
  const [routeLoading, setRouteLoading] = React.useState(false);

  const pathNodeIds = useMemo(() => {
    if (!startStopId || !endStopId) return [];
    const ids = [startStopId, ...stopIds, endStopId];
    const uniqueIds: string[] = [];
    for (const id of ids) {
      if (!uniqueIds.includes(id)) uniqueIds.push(id);
    }
    return uniqueIds;
  }, [startStopId, endStopId, stopIds]);

  React.useEffect(() => {
    // Ensure start/end are not duplicated in intermediate stops
    setStopIds((prev) =>
      prev.filter((id) => id !== startStopId && id !== endStopId),
    );
  }, [startStopId, endStopId]);

  // Auto-advance from departure to arrival mode when departure is set
  React.useEffect(() => {
    if (startStopId && selectionMode === 'start') {
      setSelectionMode('end');
    }
  }, [startStopId, selectionMode]);

  // Display mode: when departure is set, never show 'start' as active (prevents stuck button)
  const displayMode = startStopId && selectionMode === 'start' ? 'end' : selectionMode;

  React.useEffect(() => {
    if (pathNodeIds.length < 2) {
      setRoadRoutePositions(null);
      return;
    }
    const waypoints = pathNodeIds
      .map((id) => stops.find((n) => n.id === id))
      .filter(Boolean)
      .map((n) => ({ lat: n!.lat, lng: n!.lng }));
    setRouteLoading(true);
    fetchRoadRoute(waypoints)
      .then((positions) => setRoadRoutePositions(positions))
      .catch(() => setRoadRoutePositions(null))
      .finally(() => setRouteLoading(false));
  }, [pathNodeIds, stops]);

  const startName =
    stops.find((n) => n.id === startStopId)?.name ?? '—';
  const endName =
    stops.find((n) => n.id === endStopId)?.name ?? '—';

  const handleStartQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Blur the submit button immediately so it doesn't stay stuck in pressed state
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLElement) submitter.blur();
    const query = startQuery.trim();
    if (!query) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=1`,
        {
          headers: {
            'Accept-Language': 'fr',
          },
        },
      );
      if (!res.ok) return;
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (!data.length) return;
      const best = data[0];
      const id = `custom-${Date.now()}`;
      const newStop = {
        id,
        name: best.display_name,
        lat: parseFloat(best.lat),
        lng: parseFloat(best.lon),
      };
      setStops((prev) => [...prev, newStop]);
      setStartStopId(id);
      setSelectionMode('end'); // Auto-advance so next action defines arrival
    } catch {
      // ignore network errors for now
    }
  };

  const handleEndQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLElement) submitter.blur();
    const query = endQuery.trim();
    if (!query) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=1`,
        {
          headers: {
            'Accept-Language': 'fr',
          },
        },
      );
      if (!res.ok) return;
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (!data.length) return;
      const best = data[0];
      const id = `custom-${Date.now()}`;
      const newStop = {
        id,
        name: best.display_name,
        lat: parseFloat(best.lat),
        lng: parseFloat(best.lon),
      };
      setStops((prev) => [...prev, newStop]);
      setEndStopId(id);
    } catch {
      // ignore network errors for now
    }
  };

  const handleStopQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLElement) submitter.blur();
    const query = stopQuery.trim();
    if (!query) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=1`,
        {
          headers: {
            'Accept-Language': 'fr',
          },
        },
      );
      if (!res.ok) return;
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (!data.length) return;
      const best = data[0];
      const id = `custom-${Date.now()}`;
      const newStop = {
        id,
        name: best.display_name,
        lat: parseFloat(best.lat),
        lng: parseFloat(best.lon),
      };
      setStops((prev) => [...prev, newStop]);
      setStopIds((prev) => [...prev, id]);
      setStopQuery('');
    } catch {
      // ignore network errors for now
    }
  };

  const handleSelectNode = (id: string) => {
    if (displayMode === 'start') {
      setStartStopId(id);
      setSelectionMode('end');
      (document.activeElement as HTMLElement)?.blur?.();
      return;
    }
    if (displayMode === 'end') {
      setEndStopId(id);
      return;
    }
    setStopIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    const id = `custom-${Date.now()}`;
    const name = `Point (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    const newStop = { id, name, lat, lng };
    setStops((prev) => [...prev, newStop]);
    if (displayMode === 'start') {
      setStartStopId(id);
      setSelectionMode('end');
      (document.activeElement as HTMLElement)?.blur?.();
    } else if (displayMode === 'end') {
      setEndStopId(id);
    } else {
      setStopIds((prev) => [...prev, id]);
    }
  };

  const handleRemoveNode = (id: string) => {
    setStops((prev) => prev.filter((n) => n.id !== id));
    if (startStopId === id) setStartStopId('');
    if (endStopId === id) setEndStopId('');
    setStopIds((prev) => prev.filter((s) => s !== id));
  };

  const clearDeparture = () => setStartStopId('');
  const clearArrival = () => setEndStopId('');
  const removeIntermediateStop = (id: string) =>
    setStopIds((prev) => prev.filter((s) => s !== id));

  const handleSubmitRoute = (e: React.FormEvent) => {
    const waypoints =
      pathNodeIds.length >= 2
        ? pathNodeIds
            .map((id) => stops.find((n) => n.id === id))
            .filter(Boolean)
            .map((n) => ({ lat: n!.lat, lng: n!.lng, name: n!.name }))
        : undefined;
    const routePolyline =
      roadRoutePositions && roadRoutePositions.length >= 2 ? roadRoutePositions : undefined;
    onCreateRoute(e, waypoints && routePolyline ? { waypoints, routePolyline } : undefined);
  };

  const routesWithTrajet = routes.filter((r) => r.routePolyline && r.routePolyline.length >= 2);

  return (
    <section className='space-y-5'>
      {!readOnly && (
      <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Ajouter un trajet / ligne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='space-y-3 text-xs'
              onSubmit={handleSubmitRoute}
            >
              <div className='grid gap-2 sm:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='transport-name'>Nom de la ligne</Label>
                  <Input
                    id='transport-name'
                    value={newRoute.name}
                    onChange={(e) =>
                      setNewRoute((r) => ({ ...r, name: e.target.value }))
                    }
                    placeholder='Ex : Ligne A, Centre – École'
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='transport-driver'>Conducteur</Label>
                  <Input
                    id='transport-driver'
                    value={newRoute.driverName}
                    onChange={(e) =>
                      setNewRoute((r) => ({ ...r, driverName: e.target.value }))
                    }
                    placeholder='Nom du conducteur'
                    required
                  />
                </div>
              </div>
              <div className='grid gap-2 sm:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='transport-departure'>Heure de départ</Label>
                  <Input
                    id='transport-departure'
                    value={newRoute.departureTime}
                    onChange={(e) =>
                      setNewRoute((r) => ({
                        ...r,
                        departureTime: e.target.value,
                      }))
                    }
                    placeholder='Ex : 7h00, 7h30'
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='transport-return'>Heure de retour</Label>
                  <Input
                    id='transport-return'
                    value={newRoute.returnTime}
                    onChange={(e) =>
                      setNewRoute((r) => ({ ...r, returnTime: e.target.value }))
                    }
                    placeholder='Ex : 16h30 (optionnel)'
                  />
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='transport-note'>Note (optionnel)</Label>
                <Input
                  id='transport-note'
                  value={newRoute.note}
                  onChange={(e) =>
                    setNewRoute((r) => ({ ...r, note: e.target.value }))
                  }
                  placeholder='Ex : Passage par la mairie'
                />
              </div>
              <p className='text-[10px] text-muted-foreground'>
                Définir le départ et l&apos;arrivée sur la carte ci-dessous
                avant d&apos;enregistrer pour que les parents voient le trajet.
              </p>
              <Button type='submit' size='sm' className='mt-1'>
                Enregistrer le trajet
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Résumé du transport
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-xs text-muted-foreground'>
            <p>
              Lignes enregistrées :{' '}
              <span className='font-medium text-foreground'>
                {routes.length}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      {readOnly && onStudentIdChange && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Mon profil élève
            </CardTitle>
            <p className='text-xs text-muted-foreground mt-1'>
              Sélectionnez votre profil pour afficher les trajets qui vous sont assignés.
            </p>
          </CardHeader>
          <CardContent>
            <Label className='text-xs'>Je suis</Label>
            <Select
              value={currentStudentId ?? ''}
              onValueChange={onStudentIdChange}
            >
              <SelectTrigger className='mt-1 max-w-xs'>
                <SelectValue placeholder='Choisir un élève…' />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Lignes de ramassage
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {routes.length === 0 ? (
            <p className='text-muted-foreground'>
              {readOnly && onStudentIdChange
                ? currentStudentId
                  ? 'Aucun trajet ne vous est assigné. Demandez à l\'établissement de vous ajouter à un véhicule.'
                  : 'Choisissez votre profil élève ci-dessus pour voir vos trajets.'
                : 'Aucun trajet enregistré. Ajoutez des lignes ci-dessus.'}
            </p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {routes.map((route) => (
                <div
                  key={route.id}
                  className='rounded-md border border-border/80 px-3 py-2'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {route.name}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Conducteur : {route.driverName}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>
                    Départ : {route.departureTime}
                    {route.returnTime
                      ? ` · Retour : ${route.returnTime}`
                      : ''}
                  </p>
                  {route.note && (
                    <p className='mt-1 text-[11px] text-muted-foreground italic'>
                      {route.note}
                    </p>
                  )}
                  {!readOnly && onUpdateRouteStudents && (
                    <div className='mt-2 pt-2 border-t border-border/60'>
                      <p className='text-[11px] text-muted-foreground mb-1'>
                        Élèves dans ce véhicule
                      </p>
                      <div className='flex flex-wrap gap-1'>
                        {(route.studentIds ?? []).map((id) => {
                          const s = students.find((st) => st.id === id);
                          return (
                            <span
                              key={id}
                              className='inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[11px]'
                            >
                              {s?.name ?? id}
                              <button
                                type='button'
                                className='text-red-600 hover:underline'
                                onClick={() =>
                                  onUpdateRouteStudents(
                                    route.id,
                                    (route.studentIds ?? []).filter((x) => x !== id),
                                  )
                                }
                                aria-label={`Retirer ${s?.name ?? id}`}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                        {students.some((s) => !(route.studentIds ?? []).includes(s.id)) ? (
                          <Select
                            key={`${route.id}-${(route.studentIds ?? []).length}`}
                            value=''
                            onValueChange={(value) => {
                              if (!value) return;
                              onUpdateRouteStudents(route.id, [
                                ...(route.studentIds ?? []),
                                value,
                              ]);
                            }}
                          >
                            <SelectTrigger className='h-6 w-auto min-w-[100px] text-[11px] border-dashed'>
                              <SelectValue placeholder='+ Ajouter un élève' />
                            </SelectTrigger>
                            <SelectContent>
                              {students
                                .filter((s) => !(route.studentIds ?? []).includes(s.id))
                                .map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : students.length > 0 ? (
                          <span className='text-[10px] text-muted-foreground'>
                            Tous assignés
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {readOnly ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Carte des trajets
            </CardTitle>
            <p className='text-xs text-muted-foreground mt-1'>
              Trajets de ramassage scolaire enregistrés par l&apos;établissement.
            </p>
          </CardHeader>
          <CardContent>
            <RouteMap
              nodes={[]}
              pathNodeIds={[]}
              savedRoutes={routesWithTrajet.map((r) => ({
                polyline: r.routePolyline!,
                waypoints: r.waypoints,
              }))}
              center={[7.54, -5.55]}
              zoom={6}
              className='h-[360px] w-full rounded-lg border border-border/70 overflow-hidden'
            />
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Carte du trajet (algorithme de Dijkstra)
          </CardTitle>
          <p className='text-xs text-muted-foreground mt-1'>
            Utilisez les boutons ci-dessous pour choisir si le prochain clic
            sur la carte définit un départ, un arrêt intermédiaire ou une
            arrivée. Le plus court chemin est ensuite calculé avec
            l&apos;algorithme de Dijkstra et tracé sur le réseau routier.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form
            className='grid gap-2 sm:grid-cols-[minmax(0,1.6fr)_auto] text-[11px]'
            onSubmit={handleStartQuerySubmit}
          >
            <div className='grid gap-1'>
              <Label htmlFor='transport-start-query'>Départ (par nom)</Label>
              <Input
                id='transport-start-query'
                value={startQuery}
                onChange={(e) => setStartQuery(e.target.value)}
                placeholder='Ex : École, Mairie...'
              />
            </div>
            <div className='flex items-end'>
              <Button type='submit' size='xs' className='mt-1'>
                Définir le départ
              </Button>
            </div>
          </form>
          <form
            className='grid gap-2 sm:grid-cols-[minmax(0,1.6fr)_auto] text-[11px]'
            onSubmit={handleEndQuerySubmit}
          >
            <div className='grid gap-1'>
              <Label htmlFor='transport-end-query'>Arrivée (par nom)</Label>
              <Input
                id='transport-end-query'
                value={endQuery}
                onChange={(e) => setEndQuery(e.target.value)}
                placeholder='Ex : École, Mairie...'
              />
            </div>
            <div className='flex items-end'>
              <Button type='submit' size='xs' className='mt-1'>
                Définir l&apos;arrivée
              </Button>
            </div>
          </form>
          <form
            className='grid gap-2 sm:grid-cols-[minmax(0,1.6fr)_auto] text-[11px]'
            onSubmit={handleStopQuerySubmit}
          >
            <div className='grid gap-1'>
              <Label htmlFor='transport-stop-query'>Arrêt intermédiaire (par nom)</Label>
              <Input
                id='transport-stop-query'
                value={stopQuery}
                onChange={(e) => setStopQuery(e.target.value)}
                placeholder='Ex : Mairie, Gare...'
              />
            </div>
            <div className='flex items-end'>
              <Button type='submit' size='xs' className='mt-1'>
                Ajouter l&apos;arrêt
              </Button>
            </div>
          </form>
          <div className='flex flex-wrap items-center gap-2 text-[11px]'>
            <span className='text-muted-foreground'>
              Action du clic sur la carte :
            </span>
            <Button
              type='button'
              size='xs'
              variant={displayMode === 'start' ? 'default' : 'outline'}
              onClick={() => setSelectionMode('start')}
            >
              Définir le départ
            </Button>
            <Button
              type='button'
              size='xs'
              variant={displayMode === 'stop' ? 'default' : 'outline'}
              onClick={() => setSelectionMode('stop')}
            >
              Ajouter / retirer un arrêt
            </Button>
            <Button
              type='button'
              size='xs'
              variant={displayMode === 'end' ? 'default' : 'outline'}
              onClick={() => setSelectionMode('end')}
            >
              Définir l&apos;arrivée
            </Button>
          </div>
          <p className='text-[11px] text-muted-foreground'>
            Départ :{' '}
            <span className='font-medium text-foreground'>{startName}</span>
            {startStopId && (
              <button
                type='button'
                className='ml-1 text-red-600 hover:underline'
                onClick={clearDeparture}
                aria-label='Supprimer le départ'
              >
                ×
              </button>
            )}{' '}
            · Arrivée :{' '}
            <span className='font-medium text-foreground'>{endName}</span>
            {endStopId && (
              <button
                type='button'
                className='ml-1 text-red-600 hover:underline'
                onClick={clearArrival}
                aria-label="Supprimer l'arrivée"
              >
                ×
              </button>
            )}
          </p>
          {!!stopIds.length && (
            <p className='text-[11px] text-muted-foreground'>
              Arrêts intermédiaires (ordre du trajet) :{' '}
              {stopIds.map((id, idx) => {
                const name = stops.find((n) => n.id === id)?.name ?? id;
                return (
                  <span key={id} className='mr-1 inline-flex items-center gap-0.5'>
                    <span className='font-medium text-foreground'>
                      Arrêt {idx + 1} : {name}
                    </span>
                    <button
                      type='button'
                      className='text-red-600 hover:underline'
                      onClick={() => removeIntermediateStop(id)}
                      aria-label={`Retirer arrêt ${idx + 1}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </p>
          )}
          {pathNodeIds.length >= 2 && (
            <p className='text-[11px] text-muted-foreground'>
              Trajet :{' '}
              <span className='font-medium text-foreground'>
                {pathNodeIds
                  .map((id, idx) => {
                    const name = stops.find((n) => n.id === id)?.name ?? '—';
                    if (idx === 0) return `Départ (${name})`;
                    if (idx === pathNodeIds.length - 1)
                      return `Arrivée (${name})`;
                    return `Arrêt ${idx} (${name})`;
                  })
                  .join(' → ')}
              </span>
              {roadRoutePositions && (
                <span className='ml-1 text-[10px] text-muted-foreground'>
                  · tracé sur les routes (OSRM)
                </span>
              )}
            </p>
          )}
          {routeLoading && pathNodeIds.length >= 2 && (
            <p className='text-[11px] text-muted-foreground'>
              Calcul du tracé sur les routes…
            </p>
          )}
          <RouteMap
            nodes={stops}
            pathNodeIds={pathNodeIds}
            roadRoutePositions={roadRoutePositions}
            startStopId={startStopId}
            endStopId={endStopId}
            stopIds={stopIds}
            center={[7.54, -5.55]}
            zoom={6}
            className='h-[360px] w-full rounded-lg border border-border/70 overflow-hidden'
            onSelectNode={handleSelectNode}
            onMapClick={handleMapClick}
            onRemoveNode={handleRemoveNode}
          />
        </CardContent>
      </Card>
      )}
    </section>
  );
};
