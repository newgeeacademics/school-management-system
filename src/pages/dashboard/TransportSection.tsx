import React from 'react';
import { Bus, Clock, Loader2, MapPin, Plus, Route as RouteIcon, Trash2, User, Users, X } from 'lucide-react';

import { DriversSection } from '@/pages/dashboard/DriversSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { ClassItem, Student, Driver, TransportRoute } from './dashboardTypes';
import type { DriverCreatePayload } from './DriverCreateWizard';
import { PlannerMap, type PlannerPoint } from './transport/PlannerMap';
import { RouteCreator, type NewRoutePayload } from './transport/RouteCreator';
import { StudentPicker } from './transport/StudentPicker';

export type { NewRoutePayload };

type TransportSectionProps = {
  routes: TransportRoute[];
  drivers?: Driver[];
  classes?: ClassItem[];
  onCreateRoute?: (payload: NewRoutePayload) => Promise<boolean>;
  onUpdateRouteStudents?: (routeId: string, studentIds: string[]) => void | Promise<void>;
  onDeleteRoute?: (routeId: string) => void | Promise<void>;
  defaultPhoneCountry?: string;
  onCreateDriver?: (payload: DriverCreatePayload) => Promise<void>;
  onDeleteDriver?: (id: string) => void | Promise<void>;
  readOnly?: boolean;
  students?: Student[];
  currentStudentId?: string | null;
  onStudentIdChange?: (id: string) => void;
};

/** "07:00" / "7h00" -> "7h00" for display. */
function prettyTime(value?: string) {
  if (!value) return '';
  const m = /^(\d{1,2})[:h](\d{2})/.exec(value.trim());
  return m ? `${Number(m[1])}h${m[2]}` : value;
}

function isSchoolStop(name: string | undefined) {
  return Boolean(name && /^école\b/i.test(name.trim()));
}

function routeMapPoints(route: TransportRoute | undefined): { stops: PlannerPoint[]; school: PlannerPoint | null } {
  const wps = route?.waypoints ?? [];
  const last = wps[wps.length - 1];
  const school = last && isSchoolStop(last.name) ? { id: 'school', ...last } : null;
  const stops = (school ? wps.slice(0, -1) : wps).map((w, i) => ({ id: `wp-${i}`, ...w }));
  return { stops, school };
}

export const TransportSection: React.FC<TransportSectionProps> = ({
  routes,
  drivers = [],
  classes = [],
  onCreateRoute,
  onUpdateRouteStudents,
  onDeleteRoute,
  defaultPhoneCountry,
  onCreateDriver,
  onDeleteDriver,
  readOnly = false,
  students = [],
  currentStudentId,
  onStudentIdChange,
}) => {
  const [creating, setCreating] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [editingStudents, setEditingStudents] = React.useState<TransportRoute | null>(null);

  const selected = routes.find((r) => r.id === selectedId) ?? routes[0];
  const { stops: mapStops, school: mapSchool } = routeMapPoints(selected);
  const mapPolyline =
    selected?.routePolyline && selected.routePolyline.length >= 2
      ? selected.routePolyline
      : (selected?.waypoints ?? []).map((w) => [w.lat, w.lng] as [number, number]);

  const classNameById = React.useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );
  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? 'Élève';

  const riderLine = React.useCallback(
    (excludeRouteId?: string) => {
      const out: Record<string, string> = {};
      for (const r of routes) {
        if (r.id === excludeRouteId) continue;
        for (const id of r.studentIds ?? []) out[id] = r.name;
      }
      return out;
    },
    [routes],
  );

  const riders = new Set(routes.flatMap((r) => r.studentIds ?? [])).size;
  const canManage = !readOnly && Boolean(onCreateRoute);

  return (
    <section className='space-y-5'>
      {readOnly && onStudentIdChange && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Mon profil élève</CardTitle>
            <p className='mt-1 text-xs text-muted-foreground'>
              Sélectionnez votre profil pour afficher les trajets qui vous sont assignés.
            </p>
          </CardHeader>
          <CardContent>
            <Label className='text-xs'>Je suis</Label>
            <Select value={currentStudentId ?? ''} onValueChange={onStudentIdChange}>
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

      <div className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4'>
          <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
            <Stat icon={<RouteIcon className='size-4' />} value={routes.length} label={routes.length > 1 ? 'lignes' : 'ligne'} />
            {!readOnly ? (
              <>
                <Stat icon={<Users className='size-4' />} value={riders} label={riders > 1 ? 'élèves transportés' : 'élève transporté'} />
                <Stat icon={<User className='size-4' />} value={drivers.length} label={drivers.length > 1 ? 'chauffeurs' : 'chauffeur'} />
              </>
            ) : null}
          </div>
          {canManage ? (
            <Button className='h-10 rounded-xl bg-orange-600 px-4 text-white hover:bg-orange-700' onClick={() => setCreating(true)}>
              <Plus className='mr-1.5 size-4' />
              Nouvelle ligne
            </Button>
          ) : null}
        </div>

        {routes.length === 0 ? (
          <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
            <span className='flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600'>
              <Bus className='size-7' />
            </span>
            <p className='text-base font-semibold'>
              {readOnly
                ? onStudentIdChange && !currentStudentId
                  ? 'Choisissez votre profil élève ci-dessus.'
                  : 'Aucun trajet ne vous est assigné.'
                : 'Aucune ligne de ramassage'}
            </p>
            {canManage ? (
              <>
                <p className='max-w-sm text-sm text-muted-foreground'>
                  Touchez la carte pour placer les arrêts, cochez les élèves, choisissez le chauffeur : c’est prêt
                  en une minute.
                </p>
                <Button className='mt-1 h-11 rounded-xl bg-orange-600 px-5 text-white hover:bg-orange-700' onClick={() => setCreating(true)}>
                  <Plus className='mr-1.5 size-4' />
                  Créer la première ligne
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <div className='grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]'>
            <ul className='max-h-[520px] divide-y overflow-y-auto lg:border-r'>
              {routes.map((route) => {
                const active = selected?.id === route.id;
                const nStops = route.waypoints?.length ?? 0;
                const nStudents = route.studentIds?.length ?? 0;
                return (
                  <li key={route.id}>
                    <div
                      role='button'
                      tabIndex={0}
                      onClick={() => setSelectedId(route.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedId(route.id)}
                      className={cn(
                        'cursor-pointer px-5 py-4 transition',
                        active ? 'bg-orange-50/70 shadow-[inset_3px_0_0_#ea580c]' : 'hover:bg-muted/40',
                      )}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <p className='font-semibold text-foreground'>{route.name}</p>
                        <span className='shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white'>
                          {prettyTime(route.departureTime)}
                          {route.returnTime ? ` · ${prettyTime(route.returnTime)}` : ''}
                        </span>
                      </div>
                      <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                        <span className='inline-flex items-center gap-1'>
                          <User className='size-3.5' />
                          {route.driverName || '—'}
                        </span>
                        <span className='inline-flex items-center gap-1'>
                          <MapPin className='size-3.5' />
                          {nStops} arrêt{nStops > 1 ? 's' : ''}
                        </span>
                        <span className='inline-flex items-center gap-1'>
                          <Users className='size-3.5' />
                          {nStudents} élève{nStudents > 1 ? 's' : ''}
                        </span>
                      </p>
                      {nStops === 0 && !readOnly ? (
                        <p className='mt-1 text-[11px] text-amber-700'>Pas de tracé : recréez la ligne pour la voir sur la carte.</p>
                      ) : null}
                      {active && !readOnly && (onUpdateRouteStudents || onDeleteRoute) ? (
                        <div className='mt-3 flex gap-2'>
                          {onUpdateRouteStudents ? (
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-8 rounded-lg'
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStudents(route);
                              }}
                            >
                              <Users className='mr-1.5 size-3.5' />
                              Élèves
                            </Button>
                          ) : null}
                          {onDeleteRoute ? (
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700'
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Supprimer la ligne « ${route.name} » ?`)) void onDeleteRoute(route.id);
                              }}
                            >
                              <Trash2 className='mr-1.5 size-3.5' />
                              Supprimer
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                      {active && readOnly && nStudents > 0 ? (
                        <p className='mt-2 text-xs text-muted-foreground'>
                          {(route.studentIds ?? []).map(studentName).join(', ')}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className='relative h-[360px] lg:h-[520px]'>
              <PlannerMap
                key={selected?.id}
                className='h-full w-full'
                stops={mapStops}
                school={mapSchool}
                polyline={mapPolyline}
                padding={{ top: 70, right: 70, bottom: 90, left: 50 }}
              />
              {selected && mapStops.length > 0 ? (
                <div className='pointer-events-none absolute bottom-3 left-3 max-w-[70%] rounded-xl bg-white/95 px-3 py-2 text-xs shadow-md'>
                  <p className='font-semibold text-slate-900'>{selected.name}</p>
                  <p className='mt-0.5 flex items-center gap-1 text-slate-500'>
                    <Clock className='size-3' />
                    {mapStops[0]?.name} → {mapSchool ? 'école' : mapStops[mapStops.length - 1]?.name}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {!readOnly && onCreateDriver && onDeleteDriver && (
        <DriversSection
          drivers={drivers}
          defaultPhoneCountry={defaultPhoneCountry}
          onCreateDriver={onCreateDriver}
          onDeleteDriver={onDeleteDriver}
        />
      )}

      {canManage && onCreateRoute ? (
        <RouteCreator
          open={creating}
          onClose={() => setCreating(false)}
          onSave={async (payload) => {
            const ok = await onCreateRoute(payload);
            if (ok) setSelectedId(null);
            return ok;
          }}
          drivers={drivers}
          students={students}
          classNameById={classNameById}
          routeCount={routes.length}
          assignedElsewhere={riderLine()}
        />
      ) : null}

      {editingStudents && onUpdateRouteStudents ? (
        <StudentsDialog
          route={editingStudents}
          students={students}
          classNameById={classNameById}
          assignedElsewhere={riderLine(editingStudents.id)}
          onClose={() => setEditingStudents(null)}
          onSave={async (ids) => {
            await onUpdateRouteStudents(editingStudents.id, ids);
            setEditingStudents(null);
          }}
        />
      ) : null}
    </section>
  );
};

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className='flex items-center gap-2'>
      <span className='flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>{icon}</span>
      <p className='text-sm'>
        <span className='text-lg font-bold text-foreground'>{value}</span>{' '}
        <span className='text-muted-foreground'>{label}</span>
      </p>
    </div>
  );
}

function StudentsDialog({
  route,
  students,
  classNameById,
  assignedElsewhere,
  onClose,
  onSave,
}: {
  route: TransportRoute;
  students: Student[];
  classNameById: Record<string, string>;
  assignedElsewhere: Record<string, string>;
  onClose: () => void;
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [ids, setIds] = React.useState<string[]>(route.studentIds ?? []);
  const [saving, setSaving] = React.useState(false);
  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center' onClick={onClose}>
      <div
        className='flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-label={`Élèves de ${route.name}`}
      >
        <header className='flex items-center justify-between border-b px-5 py-4'>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-wider text-orange-600'>Élèves</p>
            <p className='font-semibold text-slate-900'>{route.name}</p>
          </div>
          <button type='button' onClick={onClose} className='flex size-9 items-center justify-center rounded-full hover:bg-slate-100' aria-label='Fermer'>
            <X className='size-5' />
          </button>
        </header>
        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4'>
          <StudentPicker students={students} value={ids} onChange={setIds} classNameById={classNameById} assignedElsewhere={assignedElsewhere} />
        </div>
        <footer className='border-t px-5 py-3'>
          <Button
            className='h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800'
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(ids);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? <Loader2 className='mr-2 size-4 animate-spin' /> : null}
            Enregistrer · {ids.length} élève{ids.length > 1 ? 's' : ''}
          </Button>
        </footer>
      </div>
    </div>
  );
}
