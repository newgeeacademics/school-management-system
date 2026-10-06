import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bus, ChevronDown, Clock, LogOut, MapPin, Radio, Users } from 'lucide-react';
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
      toast.success('Trajet démarré');
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

  const refreshSelected = async () => {
    if (!selected) return;
    try {
      const updated = await fetchLiveRoute(selected.routeId);
      setRoutes((prev) => prev.map((r) => (r.routeId === updated.routeId ? updated : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

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

  const details = selected ? (
    <RouteDetails
      selected={selected}
      isLive={isLive}
      canDrive={canDrive(session)}
      driverMode={driverMode}
      onRefresh={() => void refreshSelected()}
      onStartTrip={() => void handleStartTrip()}
      onToggleGps={() => setDriverMode((v) => !v)}
      onStopTrip={() => void handleStopTrip()}
    />
  ) : null;

  const progress = isLive && selected ? tripProgress(selected.livePosition, selected.waypoints) : null;
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
                  onClick={() => {
                    void handleStartTrip();
                    setDriverMode(true);
                  }}
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
  canDrive: showDriver,
  driverMode,
  onRefresh,
  onStartTrip,
  onToggleGps,
  onStopTrip,
}: {
  selected: LiveRoute;
  isLive: boolean;
  canDrive: boolean;
  driverMode: boolean;
  onRefresh: () => void;
  onStartTrip: () => void;
  onToggleGps: () => void;
  onStopTrip: () => void;
}) {
  return (
    <>
      <div className='rounded-2xl border border-foreground/[0.06] bg-card shadow-[var(--brand-shadow)] p-4'>
        <h2 className='font-display text-lg font-bold tracking-tight'>{selected.routeName}</h2>
        <p className='mt-1 text-sm text-muted-foreground'>Chauffeur : {selected.driverName}</p>
        <p className='text-sm text-muted-foreground'>
          Départ : {selected.departureTime}
          {selected.returnTime ? ` · Retour : ${selected.returnTime}` : ''}
        </p>
        <div className='mt-3 flex items-center gap-2'>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              isLive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Radio className='size-3' />
            {isLive ? 'En direct' : 'Hors ligne'}
          </span>
          <Button variant='ghost' size='sm' onClick={onRefresh}>
            Actualiser
          </Button>
        </div>
      </div>

      {selected.students.length > 0 && (
        <div className='rounded-2xl border border-foreground/[0.06] bg-card shadow-[var(--brand-shadow)] p-4'>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <Users className='size-4' />
            Élèves sur ce trajet
          </h3>
          <ul className='space-y-2'>
            {selected.students.map((student) => (
              <li key={student.id} className='rounded-xl bg-muted/60 px-3 py-2 text-sm'>
                <span className='font-medium'>{student.name}</span>
                {student.className && (
                  <span className='block text-xs text-muted-foreground'>{student.className}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDriver && (
        <div className='rounded-2xl border border-foreground/[0.06] bg-card shadow-[var(--brand-shadow)] p-4'>
          <h3 className='mb-3 text-sm font-semibold'>Mode chauffeur</h3>
          <div className='grid grid-cols-1 gap-2'>
            <Button size='sm' className='w-full touch-target' onClick={onStartTrip}>
              Démarrer le trajet
            </Button>
            <Button
              size='sm'
              variant={driverMode ? 'default' : 'outline'}
              className='w-full touch-target'
              onClick={onToggleGps}
            >
              {driverMode ? 'GPS actif' : 'Partager ma position'}
            </Button>
            <Button size='sm' variant='destructive' className='w-full touch-target' onClick={onStopTrip}>
              Terminer
            </Button>
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>
            Activez le GPS pour envoyer la position du bus en temps réel aux parents et enseignants.
          </p>
        </div>
      )}
    </>
  );
}
