import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bus, Check, ChevronDown, Clock, LogOut, MapPin, Radio, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { TrackingMap } from '@/components/TrackingMap';
import { cn } from '@/lib/utils';
import {
  canDrive,
  clearTrackingSession,
  getTrackingSession,
  type TrackingSession,
} from '@/lib/auth';
import {
  fetchLiveRoute,
  fetchLiveRoutes,
  startTrip,
  stopTrip,
  updatePosition,
  type LiveRoute,
} from '@/lib/tracking-api';
import { connectTrackingWebSocket } from '@/lib/tracking-websocket';
import { formatDistance, tripProgress } from '@/lib/trip-progress';

export function TrackingDashboardPage() {
  const navigate = useNavigate();
  const session = getTrackingSession() as TrackingSession;
  const [routes, setRoutes] = useState<LiveRoute[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverMode, setDriverMode] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const refreshSelectedRef = useRef<() => Promise<void>>(async () => undefined);

  const selected = routes.find((r) => r.routeId === selectedId) ?? routes[0] ?? null;

  const loadRoutes = useCallback(async () => {
    try {
      const data = await fetchLiveRoutes();
      setRoutes(data);
      setSelectedId((prev) => prev ?? data[0]?.routeId ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de charger les trajets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    if (!sheetOpen) return;
    void refreshSelectedRef.current();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useEffect(() => {
    if (!session.token) return;
    const client = connectTrackingWebSocket(session.token, {
      onMessage: (msg) => {
        if (msg.type !== 'LOCATION_UPDATE' || !msg.routeId || msg.lat == null || msg.lng == null) {
          return;
        }
        setRoutes((prev) =>
          prev.map((route) =>
            route.routeId === msg.routeId
              ? {
                  ...route,
                  tripStatus: 'ACTIVE',
                  livePosition: {
                    lat: msg.lat!,
                    lng: msg.lng!,
                    recordedAt: msg.recordedAt ?? null,
                  },
                  driverPosition: {
                    lat: msg.lat!,
                    lng: msg.lng!,
                    recordedAt: msg.recordedAt ?? null,
                  },
                  students: route.students.map((s) => ({
                    ...s,
                    lat: msg.lat!,
                    lng: msg.lng!,
                    trackingStatus: 'ON_BUS',
                  })),
                }
              : route
          )
        );
      },
    });
    return () => client?.close();
  }, [session.token]);

  const handleLogout = () => {
    clearTrackingSession();
    navigate('/connexion', { replace: true });
  };

  const handleStartTrip = async () => {
    if (!selected) return;
    try {
      const updated = await startTrip(selected.routeId);
      setRoutes((prev) => prev.map((r) => (r.routeId === updated.routeId ? updated : r)));
      setDriverMode(true);
      toast.success('Trajet démarré · position partagée');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleStopTrip = async () => {
    if (!selected) return;
    try {
      const updated = await stopTrip(selected.routeId);
      setRoutes((prev) => prev.map((r) => (r.routeId === updated.routeId ? updated : r)));
      setDriverMode(false);
      toast.success('Trajet terminé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const pushPosition = useCallback(
    async (lat: number, lng: number, speedKmh?: number, heading?: number) => {
      if (!selected) return;
      try {
        const updated = await updatePosition(selected.routeId, { lat, lng, speedKmh, heading });
        setRoutes((prev) => prev.map((r) => (r.routeId === updated.routeId ? updated : r)));
      } catch {
        // silent during watch
      }
    },
    [selected]
  );

  useEffect(() => {
    if (!driverMode || !selected || !canDrive(session)) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible');
      setDriverMode(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        void pushPosition(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.speed != null ? pos.coords.speed * 3.6 : undefined,
          pos.coords.heading ?? undefined
        );
      },
      () => toast.error('Impossible d\'accéder à la position GPS'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [driverMode, selected, session, pushPosition]);

  // A driver reopening the app during an active trip keeps sharing the bus position.
  const tripActiveForDriver = canDrive(session) && selected?.tripStatus === 'ACTIVE';
  useEffect(() => {
    if (tripActiveForDriver) setDriverMode(true);
  }, [tripActiveForDriver]);

  const refreshSelected = async () => {
    if (!selected) return;
    try {
      const updated = await fetchLiveRoute(selected.routeId);
      setRoutes((prev) => prev.map((r) => (r.routeId === updated.routeId ? updated : r)));
    } catch {
      // the websocket keeps the view current; a failed refresh is not worth a toast
    }
  };
  refreshSelectedRef.current = refreshSelected;

  const isLive = selected?.tripStatus === 'ACTIVE' && selected?.livePosition != null;
  const canPickRoute = routes.length > 1;
  const emptyCopy =
    session.role === 'student'
      ? 'Aucun bus scolaire n’est lié à votre compte pour le moment.'
      : session.role === 'parent'
        ? 'Aucun bus scolaire n’est lié à vos enfants pour le moment.'
        : 'Aucun trajet n’a encore été créé.';

  const routeChipLabel = (route: LiveRoute) => {
    if (session.role === 'parent' && route.students.length > 0) {
      return `${route.routeName} · ${route.students.map((s) => s.name).join(', ')}`;
    }
    return route.routeName;
  };

  const progress = isLive && selected ? tripProgress(selected.livePosition, selected.waypoints) : null;

  const details = selected ? (
    <RouteDetails
      selected={selected}
      isLive={isLive}
      nextIndex={progress?.nextIndex ?? null}
      gpsSharing={driverMode && canDrive(session)}
    />
  ) : null;

  const toNext = progress ? formatDistance(progress.kmToNextStop) : null;
  const speedKmh = selected?.livePosition?.speedKmh;
  const onBoard = selected?.students.filter((s) => s.trackingStatus === 'ON_BUS') ?? [];
  const isDriver = canDrive(session);
  const tripActive = selected?.tripStatus === 'ACTIVE';

  const hudCells: [string, string, string][] = !selected
    ? []
    : isLive && progress
      ? [
          ['arrivée', String(progress.minutesRemaining), 'min'],
          ['restant', formatDistance(progress.kmRemaining).value, formatDistance(progress.kmRemaining).unit],
          ['vitesse', speedKmh != null ? String(Math.round(speedKmh)) : '—', 'km/h'],
        ]
      : [
          ['départ', selected.departureTime || '—', ''],
          ['arrêts', String(selected.waypoints.length), ''],
          ['élèves', String(selected.students.length), ''],
        ];

  return (
    <div className='fixed inset-0 flex flex-col overflow-hidden bg-background'>
      {/* Heads-up banner: what matters right now, readable at a glance. */}
      <header className='safe-pt z-30 shrink-0 border-b border-foreground/[0.06] bg-card'>
        <div className='flex items-center gap-3 px-4 py-3'>
          <span
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-xl',
              isLive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
            aria-hidden
          >
            {!selected ? <MapPin className='size-7' /> : isLive ? <Bus className='size-7' /> : <Clock className='size-7' />}
          </span>
          <div className='min-w-0 flex-1' aria-live='polite'>
            {loading ? (
              <p className='font-display text-xl font-bold tracking-tight'>Chargement…</p>
            ) : !selected ? (
              <>
                <p className='font-display text-xl font-bold tracking-tight'>Aucun trajet</p>
                <p className='truncate text-sm text-muted-foreground'>{emptyCopy}</p>
              </>
            ) : isLive && progress && toNext ? (
              <>
                <p className='font-display text-[2rem] font-extrabold leading-none tracking-tight tabular-nums'>
                  {toNext.value}
                  <span className='ml-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{toNext.unit}</span>
                </p>
                <p className='mt-1 truncate text-sm text-muted-foreground'>
                  Prochain arrêt · <span className='font-semibold text-foreground'>{progress.nextStop.name}</span>
                </p>
              </>
            ) : isLive ? (
              <>
                <p className='font-display text-xl font-bold tracking-tight'>Bus en route</p>
                <p className='truncate text-sm text-muted-foreground'>{selected.routeName}</p>
              </>
            ) : (
              <>
                <p className='font-display text-xl font-bold tracking-tight'>En attente du départ</p>
                <p className='truncate text-sm text-muted-foreground'>
                  {selected.departureTime ? `Départ prévu à ${selected.departureTime} · ` : ''}
                  {selected.routeName}
                </p>
              </>
            )}
          </div>
          <Button variant='ghost' size='icon' className='touch-target shrink-0' onClick={handleLogout} aria-label='Déconnexion'>
            <LogOut className='size-5' />
          </Button>
        </div>
      </header>

      <main className='relative min-h-0 flex-1'>
        <div className='absolute inset-x-0 top-0 z-30'>
          <PushNotificationPrompt
            enabled={session.role === 'parent' || session.role === 'teacher' || session.role === 'student'}
          />
        </div>

        <TrackingMap
          waypoints={selected?.waypoints ?? []}
          routePolyline={selected?.routePolyline ?? []}
          livePosition={selected?.livePosition ?? null}
          driverPosition={selected?.driverPosition ?? null}
          students={selected?.students ?? []}
          liveActive={isLive}
          className='absolute inset-0 h-full w-full [&_.mapboxgl-map]:h-full [&_.mapboxgl-canvas]:h-full'
        />

        {sheetOpen && selected ? (
          <>
            <button
              type='button'
              className='absolute inset-0 z-20 bg-slate-950/30 backdrop-blur-[2px]'
              aria-label='Fermer les détails'
              onClick={() => setSheetOpen(false)}
            />
            <div
              className='absolute inset-x-0 bottom-0 z-30 mx-auto flex max-h-[75%] w-full max-w-lg flex-col rounded-t-[28px] border border-b-0 border-foreground/[0.06] bg-card shadow-[0_-12px_40px_rgb(15_23_42/0.16)]'
              role='dialog'
              aria-modal='true'
              aria-label={`Détails · ${selected.routeName}`}
            >
              <button
                type='button'
                className='flex w-full items-center justify-between gap-2 px-5 pb-3 pt-4 text-left'
                onClick={() => setSheetOpen(false)}
              >
                <span className='font-display text-base font-bold tracking-tight'>Détails du trajet</span>
                <ChevronDown className='size-5 text-muted-foreground' />
              </button>
              <div className='min-h-0 space-y-3 overflow-y-auto px-4 pb-4'>
                {canPickRoute ? (
                  <div className='flex gap-2 overflow-x-auto pb-1'>
                    {routes.map((route) => (
                      <Button
                        key={route.routeId}
                        variant={selected.routeId === route.routeId ? 'default' : 'outline'}
                        size='sm'
                        className='shrink-0 touch-target'
                        onClick={() => setSelectedId(route.routeId)}
                      >
                        {routeChipLabel(route)}
                      </Button>
                    ))}
                  </div>
                ) : null}
                {details}
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* Bottom heads-up strip: three readings and the one action that matters. */}
      {selected ? (
        <footer className='z-30 shrink-0 border-t border-foreground/[0.06] bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3'>
          <div className='mb-3 flex items-center gap-2 text-xs'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold',
                isLive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
              )}
            >
              <span className={cn('size-1.5 rounded-full', isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/50')} />
              {isLive ? 'En direct' : 'Hors ligne'}
            </span>
            <span className='min-w-0 flex-1 truncate text-muted-foreground'>
              {session.role === 'parent' && onBoard.length > 0
                ? `${onBoard.map((s) => s.name).join(', ')} à bord`
                : `${selected.routeName} · ${selected.driverName}`}
            </span>
            <button
              type='button'
              className='shrink-0 font-semibold text-primary underline-offset-4 hover:underline'
              onClick={() => setSheetOpen(true)}
            >
              Détails
            </button>
          </div>
          <div className='flex items-end gap-3'>
            <dl className='grid flex-1 grid-cols-3 divide-x divide-foreground/10'>
              {hudCells.map(([label, value, unit]) => (
                <div key={label} className='min-w-0 px-2.5 first:pl-0'>
                  <dt className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{label}</dt>
                  <dd
                    className={cn(
                      'mt-1 whitespace-nowrap font-display font-extrabold leading-none tracking-tight tabular-nums',
                      value.length > 3 ? 'text-[1.4rem]' : 'text-[1.75rem]'
                    )}
                  >
                    {value}
                    {unit ? (
                      <span className='ml-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>{unit}</span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            {isDriver ? (
              tripActive ? (
                <Button variant='destructive' className='h-12 w-28 shrink-0 rounded-xl text-base font-bold' onClick={() => void handleStopTrip()}>
                  Terminer
                </Button>
              ) : (
                <Button
                  className='h-12 w-28 shrink-0 rounded-xl text-base font-bold'
                  onClick={() => void handleStartTrip()}
                >
                  Démarrer
                </Button>
              )
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function RouteDetails({
  selected,
  isLive,
  nextIndex,
  gpsSharing,
}: {
  selected: LiveRoute;
  isLive: boolean;
  nextIndex: number | null;
  gpsSharing: boolean;
}) {
  const stops = selected.waypoints;
  return (
    <>
      <div className='rounded-2xl border border-foreground/[0.06] bg-card p-4 shadow-[var(--brand-shadow)]'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <h2 className='font-display text-lg font-bold tracking-tight'>{selected.routeName}</h2>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              {selected.driverName} · départ {selected.departureTime}
              {selected.returnTime ? ` · retour ${selected.returnTime}` : ''}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              isLive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
            )}
          >
            <Radio className='size-3' />
            {isLive ? 'En direct' : 'Hors ligne'}
          </span>
        </div>
        {gpsSharing ? (
          <p className='mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-800'>
            Votre position est partagée avec les familles jusqu’à « Terminer ».
          </p>
        ) : null}
      </div>

      {stops.length > 0 ? (
        <div className='rounded-2xl border border-foreground/[0.06] bg-card p-4 shadow-[var(--brand-shadow)]'>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <MapPin className='size-4' />
            Arrêts
          </h3>
          <ol className='relative space-y-0'>
            {stops.map((stop, i) => {
              const passed = nextIndex != null && i < nextIndex;
              const next = nextIndex === i;
              const last = i === stops.length - 1;
              return (
                <li key={`${stop.lat}-${stop.lng}-${i}`} className='relative flex gap-3 pb-3 last:pb-0'>
                  {!last ? (
                    <span
                      className={cn('absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5', passed ? 'bg-primary' : 'bg-foreground/10')}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                      passed
                        ? 'bg-primary text-primary-foreground'
                        : next
                          ? 'bg-card text-primary ring-2 ring-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {passed ? <Check className='size-3.5' strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn('pt-0.5 text-sm', passed ? 'text-muted-foreground line-through decoration-foreground/20' : next ? 'font-semibold' : '')}>
                    {stop.name || `Arrêt ${i + 1}`}
                    {next ? <span className='ml-2 text-xs font-medium text-primary'>prochain</span> : null}
                    {last && !next ? <span className='ml-2 text-xs font-medium text-muted-foreground'>arrivée</span> : null}
                    {i === 0 && !passed && !next ? <span className='ml-2 text-xs font-medium text-muted-foreground'>départ</span> : null}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {selected.students.length > 0 && (
        <div className='rounded-2xl border border-foreground/[0.06] bg-card p-4 shadow-[var(--brand-shadow)]'>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <Users className='size-4' />
            Élèves ({selected.students.length})
          </h3>
          <ul className='grid gap-2 sm:grid-cols-2'>
            {selected.students.map((student) => (
              <li key={student.id} className='flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm'>
                <span className='min-w-0'>
                  <span className='block truncate font-medium'>{student.name}</span>
                  {student.className && <span className='block text-xs text-muted-foreground'>{student.className}</span>}
                </span>
                {student.trackingStatus === 'ON_BUS' ? (
                  <span className='shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800'>à bord</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
