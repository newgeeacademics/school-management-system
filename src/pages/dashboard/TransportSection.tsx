import React from 'react';

import { RouteMap } from '@/components/RouteMap';
import { DriversSection } from '@/pages/dashboard/DriversSection';
import { RouteBuilderPanel, type BuiltRoute } from '@/pages/dashboard/RouteBuilderPanel';
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
  SetStateAction,
  Student,
  Driver,
  TransportRoute,
} from './dashboardTypes';
import type { DriverCreatePayload } from './DriverCreateWizard';

type TransportSectionProps = {
  routes: TransportRoute[];
  drivers?: Driver[];
  newRoute: NewTransportRouteFormState;
  setNewRoute: SetStateAction<NewTransportRouteFormState>;
  onCreateRoute: (e: React.FormEvent, payload?: { waypoints: { lat: number; lng: number; name: string }[]; routePolyline: [number, number][] }) => void;
  onUpdateRouteStudents?: (routeId: string, studentIds: string[]) => void;
  defaultPhoneCountry?: string;
  onCreateDriver?: (payload: DriverCreatePayload) => Promise<void>;
  onDeleteDriver?: (id: string) => void | Promise<void>;
  readOnly?: boolean;
  students?: Student[];
  currentStudentId?: string | null;
  onStudentIdChange?: (id: string) => void;
};

export const TransportSection: React.FC<TransportSectionProps> = ({
  routes,
  drivers = [],
  newRoute,
  setNewRoute,
  onCreateRoute,
  onUpdateRouteStudents,
  defaultPhoneCountry,
  onCreateDriver,
  onDeleteDriver,
  readOnly = false,
  students = [],
  currentStudentId,
  onStudentIdChange,
}) => {
  const [builtRoute, setBuiltRoute] = React.useState<BuiltRoute | null>(null);

  const handleSubmitRoute = (e: React.FormEvent) => {
    onCreateRoute(e, builtRoute ?? undefined);
  };

  const routesWithTrajet = routes.filter((r) => r.routePolyline && r.routePolyline.length >= 2);

  return (
    <section className='space-y-5'>
      {!readOnly && onCreateDriver && onDeleteDriver && (
        <DriversSection
          drivers={drivers}
          defaultPhoneCountry={defaultPhoneCountry}
          onCreateDriver={onCreateDriver}
          onDeleteDriver={onDeleteDriver}
        />
      )}
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
                  {drivers.length > 0 ? (
                    <Select
                      value={newRoute.driverId || '__manual__'}
                      onValueChange={(value) => {
                        if (value === '__manual__') {
                          setNewRoute((r) => ({ ...r, driverId: '', driverName: '' }));
                          return;
                        }
                        const driver = drivers.find((d) => d.id === value);
                        setNewRoute((r) => ({
                          ...r,
                          driverId: value,
                          driverName: driver?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger id='transport-driver'>
                        <SelectValue placeholder='Choisir un chauffeur' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__manual__'>Saisie manuelle</SelectItem>
                        {drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  {(!newRoute.driverId || drivers.length === 0) && (
                    <Input
                      id='transport-driver-manual'
                      value={newRoute.driverName}
                      onChange={(e) =>
                        setNewRoute((r) => ({ ...r, driverName: e.target.value, driverId: '' }))
                      }
                      placeholder='Nom du conducteur'
                      required={!newRoute.driverId}
                    />
                  )}
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
                Tracez l&apos;itinéraire sur la carte ci-dessous (au moins 2 arrêts) avant
                d&apos;enregistrer pour que les parents voient le trajet.
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
            Carte du trajet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RouteBuilderPanel onChange={setBuiltRoute} />
        </CardContent>
      </Card>
      )}
    </section>
  );
};
