import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, MapPin, Radio, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';
import { TrackingMap } from '@/components/TrackingMap';
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

  return (
    <div className='min-h-svh bg-background'>
      <header className='border-b bg-card'>
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4'>
          <div className='flex items-center gap-3'>
            <AppLogo markClassName='app-logo__mark--compact' name='NewGee Transport' />
            <div>
              <h1 className='font-semibold'>Suivi Transport</h1>
              <p className='text-xs text-muted-foreground'>{session.name ?? session.email}</p>
            </div>
          </div>
          <Button variant='outline' size='sm' onClick={handleLogout}>
            <LogOut className='size-4' />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className='mx-auto max-w-6xl space-y-6 px-4 py-6'>
        {loading ? (
          <p className='text-sm text-muted-foreground'>Chargement des trajets…</p>
        ) : routes.length === 0 ? (
          <div className='rounded-xl border bg-card p-8 text-center'>
            <MapPin className='mx-auto mb-3 size-10 text-muted-foreground' />
            <p className='font-medium'>Aucun trajet assigné</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Aucun bus scolaire n&apos;est lié à vos enfants ou élèves pour le moment.
            </p>
          </div>
        ) : (
          <>
            {routes.length > 1 && (
              <div className='flex flex-wrap gap-2'>
                {routes.map((route) => (
                  <Button
                    key={route.routeId}
                    variant={selected?.routeId === route.routeId ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedId(route.routeId)}
                  >
                    {route.routeName}
                  </Button>
                ))}
              </div>
            )}

            {selected && (
              <>
                <div className='grid gap-4 lg:grid-cols-[1fr_320px]'>
                  <TrackingMap
                    waypoints={selected.waypoints}
                    routePolyline={selected.routePolyline}
                    livePosition={selected.livePosition}
                    driverPosition={selected.driverPosition}
                    students={selected.students}
                    className='h-[480px] w-full rounded-xl border shadow-sm'
                  />

                  <aside className='space-y-4'>
                    <div className='rounded-xl border bg-card p-4'>
                      <h2 className='font-semibold'>{selected.routeName}</h2>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        Chauffeur : {selected.driverName}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Départ : {selected.departureTime}
                        {selected.returnTime ? ` · Retour : ${selected.returnTime}` : ''}
                      </p>
                      <div className='mt-3 flex items-center gap-2'>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            isLive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Radio className='size-3' />
                          {isLive ? 'En direct' : 'Hors ligne'}
                        </span>
                        <Button variant='ghost' size='sm' onClick={() => void refreshSelected()}>
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
                            <li
                              key={student.id}
                              className='rounded-lg bg-muted/50 px-3 py-2 text-sm'
                            >
                              <span className='font-medium'>{student.name}</span>
                              {student.className && (
                                <span className='block text-xs text-muted-foreground'>
                                  {student.className}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {canDrive(session) && (
                      <div className='rounded-xl border bg-card p-4'>
                        <h3 className='mb-3 text-sm font-semibold'>Mode chauffeur</h3>
                        <div className='flex flex-wrap gap-2'>
                          <Button size='sm' onClick={() => void handleStartTrip()}>
                            Démarrer le trajet
                          </Button>
                          <Button
                            size='sm'
                            variant={driverMode ? 'default' : 'outline'}
                            onClick={() => setDriverMode((v) => !v)}
                          >
                            {driverMode ? 'GPS actif' : 'Partager ma position'}
                          </Button>
                          <Button size='sm' variant='destructive' onClick={() => void handleStopTrip()}>
                            Terminer
                          </Button>
                        </div>
                        <p className='mt-2 text-xs text-muted-foreground'>
                          Activez le GPS pour envoyer la position du bus en temps réel aux parents et enseignants.
                        </p>
                      </div>
                    )}
                  </aside>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
