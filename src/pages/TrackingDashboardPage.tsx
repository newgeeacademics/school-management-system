import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronUp, LogOut, MapPin, Radio, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { AppLogo } from '@/components/AppLogo';
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

  return (
    <div className='fixed inset-0 flex flex-col overflow-hidden bg-background'>
      <header className='safe-pt z-30 shrink-0 border-b bg-card/95 backdrop-blur'>
        <div className='flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4'>
          <div className='flex min-w-0 items-center gap-2 sm:gap-3'>
            <AppLogo markClassName='app-logo__mark--compact' name='NewGee Transport' />
            <div className='min-w-0'>
              <h1 className='truncate text-base font-semibold'>Suivi Transport</h1>
              <p className='truncate text-xs text-muted-foreground'>{session.name ?? session.email}</p>
            </div>
          </div>
          <Button variant='outline' size='sm' className='touch-target shrink-0' onClick={handleLogout}>
            <LogOut className='size-4' />
            <span className='hidden sm:inline'>Déconnexion</span>
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

        {loading ? (
          <p className='absolute left-3 top-3 z-10 rounded-lg bg-card/95 px-3 py-2 text-sm text-muted-foreground shadow-sm'>
            Chargement des trajets…
          </p>
        ) : !selected ? (
          <div className='absolute inset-x-4 top-4 z-10 rounded-xl border bg-card/95 p-6 text-center shadow-sm'>
            <MapPin className='mx-auto mb-3 size-10 text-muted-foreground' />
            <p className='font-medium'>Aucun trajet assigné</p>
            <p className='mt-1 text-sm text-muted-foreground'>{emptyCopy}</p>
          </div>
        ) : (
          <>
            {canPickRoute && (
              <div className='absolute inset-x-0 top-0 z-10 flex gap-2 overflow-x-auto px-3 py-3'>
                {routes.map((route) => (
                  <Button
                    key={route.routeId}
                    variant={selected.routeId === route.routeId ? 'default' : 'outline'}
                    size='sm'
                    className='shrink-0 touch-target bg-card/95 shadow-sm'
                    onClick={() => setSelectedId(route.routeId)}
                  >
                    {routeChipLabel(route)}
                  </Button>
                ))}
              </div>
            )}

            <aside className='absolute top-3 right-3 bottom-3 hidden w-80 overflow-y-auto lg:block'>
              <div className='space-y-3'>{details}</div>
            </aside>

            <div className='absolute inset-x-0 bottom-0 z-20 flex max-h-[72svh] flex-col rounded-t-2xl border bg-card shadow-[0_-8px_30px_rgb(15_23_42/0.12)] lg:hidden'>
              <button
                type='button'
                className='flex w-full flex-col items-center px-4 pt-2 pb-3'
                onClick={() => setSheetOpen((open) => !open)}
                aria-expanded={sheetOpen}
              >
                <span className='mb-2 h-1 w-10 rounded-full bg-muted-foreground/30' />
                <span className='flex w-full items-center justify-between gap-2 text-left'>
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-semibold'>{selected.routeName}</span>
                    <span className='text-xs text-muted-foreground'>
                      {isLive ? 'En direct' : 'Hors ligne'}
                    </span>
                  </span>
                  <ChevronUp
                    className={cn('size-5 shrink-0 text-muted-foreground transition-transform', !sheetOpen && 'rotate-180')}
                  />
                </span>
              </button>
              {sheetOpen ? (
                <div className='min-h-0 space-y-3 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))]'>
                  {details}
                </div>
              ) : null}
            </div>
          </>
        )}
      </main>
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
      <div className='rounded-xl border bg-card p-4'>
        <h2 className='font-semibold'>{selected.routeName}</h2>
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
        <div className='rounded-xl border bg-card p-4'>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
            <Users className='size-4' />
            Élèves sur ce trajet
          </h3>
          <ul className='space-y-2'>
            {selected.students.map((student) => (
              <li key={student.id} className='rounded-lg bg-muted/50 px-3 py-2 text-sm'>
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
        <div className='rounded-xl border bg-card p-4'>
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
