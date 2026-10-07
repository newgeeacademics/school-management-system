import React from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Flag,
  Loader2,
  MapPin,
  MousePointerClick,
  School,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { fetchLatestSchoolFromBackend } from '@/lib/dashboard-backend';

import type { Student, TransportRoute } from '../dashboardTypes';

type Driver = { id: string; name: string };
import { PlannerMap, type PlannerPoint } from './PlannerMap';
import { buildPath, pathLengthKm, reverseName, searchPlaces, type FoundPlace } from './places';
import { StudentPicker } from './StudentPicker';

export type NewRoutePayload = {
  name: string;
  driverId?: string;
  driverName?: string;
  departureTime: string;
  returnTime?: string;
  note?: string;
  waypoints: { lat: number; lng: number; name: string }[];
  routePolyline: [number, number][];
  studentIds: string[];
};

type RouteCreatorProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: NewRoutePayload) => Promise<boolean>;
  drivers: Driver[];
  students: Student[];
  classNameById?: Record<string, string>;
  routeCount: number;
  /** Students already riding another line (shown, not hidden). */
  assignedElsewhere?: Record<string, string>;
  /** Existing line to edit (prefilled; saving updates it). */
  initial?: TransportRoute | null;
};

/** "7h00", "07:00", "7h" -> "07:00" for <input type="time">; '' when unreadable. */
function toTimeInput(value: string | undefined, fallback: string): string {
  const m = /^(\d{1,2})\s*[h:]\s*(\d{2})?/i.exec(value?.trim() ?? '');
  if (!m) return fallback;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (h > 23 || min > 59) return fallback;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

type Step = 1 | 2 | 3;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: 'Arrêts' },
  { id: 2, label: 'Élèves' },
  { id: 3, label: 'Chauffeur' },
];

let idSeq = 0;
const nextId = () => `stop-${Date.now()}-${idSeq++}`;

export function RouteCreator({
  open,
  onClose,
  onSave,
  drivers,
  students,
  classNameById,
  routeCount,
  assignedElsewhere,
  initial,
}: RouteCreatorProps) {
  const [step, setStep] = React.useState<Step>(1);
  const [stops, setStops] = React.useState<PlannerPoint[]>([]);
  const [selectedStop, setSelectedStop] = React.useState<string | null>(null);
  const [school, setSchool] = React.useState<PlannerPoint | null>(null);
  const [endAtSchool, setEndAtSchool] = React.useState(true);
  const [path, setPath] = React.useState<{ polyline: [number, number][]; onRoads: boolean }>({
    polyline: [],
    onRoads: false,
  });
  const [pathLoading, setPathLoading] = React.useState(false);

  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<FoundPlace[]>([]);
  const [searching, setSearching] = React.useState(false);

  const [studentIds, setStudentIds] = React.useState<string[]>([]);
  const [driverId, setDriverId] = React.useState('');
  const [driverName, setDriverName] = React.useState('');
  const [departureTime, setDepartureTime] = React.useState('06:45');
  const [returnTime, setReturnTime] = React.useState('16:30');
  const [name, setName] = React.useState('');
  const [nameTouched, setNameTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Reset (or prefill from the line being edited) every time the creator opens.
  React.useEffect(() => {
    if (!open) return;
    setSelectedStop(null);
    setQuery('');
    setResults([]);
    if (initial) {
      const wps = initial.waypoints ?? [];
      const last = wps[wps.length - 1];
      const endsAtSchool = Boolean(last && /^école\b/i.test(last.name.trim()));
      setStops((endsAtSchool ? wps.slice(0, -1) : wps).map((w) => ({ id: nextId(), ...w })));
      setEndAtSchool(wps.length === 0 || endsAtSchool);
      setStudentIds(initial.studentIds ?? []);
      const initialDriverId = (initial as { driverId?: string }).driverId;
      const knownDriver = Boolean(initialDriverId && drivers.some((d) => d.id === initialDriverId));
      setDriverId(knownDriver ? initialDriverId! : '');
      setDriverName(knownDriver ? '' : initial.driverName ?? '');
      setDepartureTime(toTimeInput(initial.departureTime, '06:45'));
      setReturnTime(initial.returnTime ? toTimeInput(initial.returnTime, '') : '');
      setName(initial.name);
      setNameTouched(true);
      setStep(1);
      return;
    }
    setStep(1);
    setStops([]);
    setEndAtSchool(true);
    setStudentIds([]);
    setDriverId(drivers.length === 1 ? drivers[0].id : '');
    setDriverName('');
    setDepartureTime('06:45');
    setReturnTime('16:30');
    setName('');
    setNameTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  // The school is always the arrival: fetch its GPS position once.
  React.useEffect(() => {
    if (!open || school) return;
    let cancelled = false;
    void fetchLatestSchoolFromBackend()
      .then((s) => {
        if (cancelled || !s) return;
        const lat = Number(s.gpsLat);
        const lng = Number(s.gpsLng);
        if (s.gpsLat == null || s.gpsLng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setSchool({ id: 'school', name: s.name ? `École · ${s.name}` : 'École', lat, lng });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, school]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const arrival = endAtSchool && school ? school : null;
  const points = React.useMemo(() => [...stops, ...(arrival ? [arrival] : [])], [stops, arrival]);
  const pointsKey = points.map((p) => `${p.lat},${p.lng}`).join('|');

  // Road path, debounced; falls back to straight segments.
  React.useEffect(() => {
    if (points.length < 2) {
      setPath({ polyline: [], onRoads: false });
      return;
    }
    let cancelled = false;
    setPathLoading(true);
    const t = window.setTimeout(() => {
      void buildPath(points).then((p) => {
        if (cancelled) return;
        setPath(p);
        setPathLoading(false);
      });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey]);

  // Suggested name: "Ligne 3 · Cocody".
  React.useEffect(() => {
    if (nameTouched) return;
    const first = stops[0]?.name;
    const area = first && !/^Arrêt \d+$/.test(first) ? first.split(',').pop()?.trim() : '';
    setName(`Ligne ${routeCount + 1}${area ? ` · ${area}` : ''}`);
  }, [stops, routeCount, nameTouched]);

  const addStop = (lat: number, lng: number, knownName?: string) => {
    const id = nextId();
    setStops((prev) => [...prev, { id, lat, lng, name: knownName ?? `Arrêt ${prev.length + 1}` }]);
    setSelectedStop(id);
    if (!knownName) {
      void reverseName(lat, lng).then((n) => {
        if (n) setStops((prev) => prev.map((s) => (s.id === id && /^Arrêt \d+$/.test(s.name) ? { ...s, name: n } : s)));
      });
    }
  };

  const moveStop = (index: number, dir: -1 | 1) => {
    setStops((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[j]] = [copy[j], copy[index]];
      return copy;
    });
  };

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const found = await searchPlaces(query, school ?? stops[0] ?? null);
    setSearching(false);
    setResults(found);
    if (found.length === 0) toast.error('Aucun lieu trouvé. Touchez plutôt la carte.');
  };

  const km = pathLengthKm(path.polyline);
  const driverOk = Boolean(driverId || driverName.trim());
  const canSave = points.length >= 2 && driverOk && departureTime && name.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const ok = await onSave({
      name: name.trim(),
      driverId: driverId || undefined,
      driverName: driverId ? drivers.find((d) => d.id === driverId)?.name : driverName.trim(),
      departureTime,
      returnTime: returnTime || undefined,
      waypoints: points.map((p) => ({ lat: p.lat, lng: p.lng, name: p.name })),
      routePolyline: path.polyline.length >= 2 ? path.polyline : points.map((p) => [p.lat, p.lng]),
      studentIds,
    });
    setSaving(false);
    if (ok) onClose();
  };

  if (!open) return null;

  const panelPadding = isDesktop
    ? { top: 80, right: 80, bottom: 40, left: 440 }
    : { top: 80, right: 40, bottom: 40, left: 40 };

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-slate-100 lg:block' role='dialog' aria-modal='true' aria-label={initial ? `Modifier ${initial.name}` : 'Nouvelle ligne de ramassage'}>
      {/* Map */}
      <div className='relative h-[42vh] shrink-0 lg:absolute lg:inset-0 lg:h-auto'>
        <PlannerMap
          className='h-full w-full'
          stops={stops}
          school={school}
          polyline={path.polyline}
          padding={panelPadding}
          onAddStop={step === 1 ? (lat, lng) => addStop(lat, lng) : undefined}
          onSelectStop={setSelectedStop}
          selectedId={selectedStop}
        />
        {step === 1 && stops.length === 0 ? (
          <div className='pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-medium text-white shadow-lg lg:left-[calc(50%+200px)] lg:top-6'>
            <MousePointerClick className='mr-1.5 inline size-4' />
            Touchez la carte pour placer le 1<sup>er</sup> arrêt
          </div>
        ) : null}
        <button
          type='button'
          onClick={onClose}
          className='absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg lg:right-5 lg:top-5'
          aria-label='Fermer'
        >
          <X className='size-5' />
        </button>
      </div>

      {/* Panel */}
      <aside className='relative z-10 flex min-h-0 flex-1 flex-col bg-white shadow-2xl lg:absolute lg:bottom-4 lg:left-4 lg:top-4 lg:w-[400px] lg:rounded-2xl'>
        <header className='border-b px-5 pb-3 pt-4'>
          <p className='truncate text-[11px] font-semibold uppercase tracking-wider text-orange-600'>
            {initial ? `Modifier · ${initial.name}` : 'Nouvelle ligne'}
          </p>
          <ol className='mt-2 flex items-center gap-1.5'>
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              const reachable = s.id === 1 || points.length >= 2;
              return (
                <li key={s.id} className='flex flex-1 items-center gap-1.5'>
                  <button
                    type='button'
                    disabled={!reachable}
                    onClick={() => setStep(s.id)}
                    className={cn(
                      'flex flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition',
                      active ? 'bg-slate-900 text-white' : done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
                      !reachable && 'opacity-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]',
                        active ? 'bg-white text-slate-900' : done ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500',
                      )}
                    >
                      {done ? <Check className='size-3' strokeWidth={3} /> : s.id}
                    </span>
                    {s.label}
                  </button>
                  {i < STEPS.length - 1 ? <span className='h-px w-2 bg-slate-200' /> : null}
                </li>
              );
            })}
          </ol>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4'>
          {step === 1 ? (
            <div className='space-y-4'>
              <form onSubmit={runSearch} className='relative'>
                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!e.target.value) setResults([]);
                  }}
                  placeholder='Chercher un quartier, une rue…'
                  className='h-11 rounded-xl pl-9 pr-10'
                />
                {searching ? <Loader2 className='absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400' /> : null}
                {results.length > 0 ? (
                  <ul className='absolute inset-x-0 top-12 z-20 overflow-hidden rounded-xl border bg-white shadow-xl'>
                    {results.map((r, i) => (
                      <li key={`${r.lat}-${r.lng}-${i}`}>
                        <button
                          type='button'
                          className='flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50'
                          onClick={() => {
                            addStop(r.lat, r.lng, r.name);
                            setResults([]);
                            setQuery('');
                          }}
                        >
                          <MapPin className='size-4 shrink-0 text-blue-600' />
                          <span className='truncate'>{r.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </form>

              <ol className='relative space-y-2'>
                {stops.length === 0 ? (
                  <li className='rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500'>
                    Touchez la carte à chaque point de ramassage, dans l’ordre du trajet.
                  </li>
                ) : null}
                {stops.map((stop, index) => {
                  const isDestination = !arrival && stops.length > 1 && index === stops.length - 1;
                  const role = isDestination ? 'Arrivée' : index === 0 ? 'Départ' : null;
                  return (
                  <li
                    key={stop.id}
                    className={cn(
                      'group flex items-center gap-2 rounded-xl border px-2.5 py-2 transition',
                      selectedStop === stop.id ? 'border-blue-500 bg-blue-50/60' : 'border-slate-200',
                    )}
                    onClick={() => setSelectedStop(stop.id)}
                  >
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center text-xs font-bold text-white',
                        isDestination ? 'rounded-lg bg-red-600' : index === 0 ? 'rounded-full bg-green-600' : 'rounded-full bg-blue-600',
                      )}
                    >
                      {isDestination ? <Flag className='size-3.5' /> : index + 1}
                    </span>
                    <span className='min-w-0 flex-1'>
                      {role ? (
                        <span className={cn('block text-[10px] font-semibold uppercase', isDestination ? 'text-red-700' : 'text-green-700')}>
                          {role}
                        </span>
                      ) : null}
                      <input
                        value={stop.name}
                        onChange={(e) =>
                          setStops((prev) => prev.map((s) => (s.id === stop.id ? { ...s, name: e.target.value } : s)))
                        }
                        className='w-full min-w-0 bg-transparent text-sm font-medium text-slate-900 outline-none'
                        aria-label={`Nom de l’arrêt ${index + 1}`}
                      />
                    </span>
                    <div className='flex shrink-0 items-center'>
                      <IconBtn label='Monter' disabled={index === 0} onClick={() => moveStop(index, -1)}>
                        <ArrowUp className='size-3.5' />
                      </IconBtn>
                      <IconBtn label='Descendre' disabled={index === stops.length - 1} onClick={() => moveStop(index, 1)}>
                        <ArrowDown className='size-3.5' />
                      </IconBtn>
                      <IconBtn label='Supprimer' danger onClick={() => setStops((prev) => prev.filter((s) => s.id !== stop.id))}>
                        <Trash2 className='size-3.5' />
                      </IconBtn>
                    </div>
                  </li>
                  );
                })}

                {school ? (
                  <li
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-2.5 py-2',
                      endAtSchool ? 'border-orange-200 bg-orange-50' : 'border-slate-200 opacity-60',
                    )}
                  >
                    <span className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white'>
                      <School className='size-4' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block text-[10px] font-semibold uppercase text-orange-700'>Arrivée</span>
                      <span className='block truncate text-sm font-medium text-slate-900'>{school.name}</span>
                    </span>
                    <label className='flex shrink-0 items-center gap-1.5 text-xs text-slate-600'>
                      <input
                        type='checkbox'
                        checked={endAtSchool}
                        onChange={(e) => setEndAtSchool(e.target.checked)}
                        className='size-4 accent-orange-600'
                      />
                      Inclure
                    </label>
                  </li>
                ) : (
                  <li className='rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800'>
                    Le dernier point placé est la destination finale. Ajoutez la position GPS de l’école dans
                    Paramètres → Établissement pour qu’elle devienne l’arrivée automatiquement.
                  </li>
                )}
              </ol>

              {points.length >= 2 ? (
                <div className='flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs'>
                  <span className='font-semibold text-slate-900'>
                    {stops.length} arrêt{stops.length > 1 ? 's' : ''} · {km < 10 ? km.toFixed(1) : Math.round(km)} km
                  </span>
                  <span className='text-slate-500'>
                    {pathLoading ? (
                      <>
                        <Loader2 className='mr-1 inline size-3 animate-spin' />
                        Calcul…
                      </>
                    ) : path.onRoads ? (
                      'Tracé par la route'
                    ) : (
                      'Tracé approximatif'
                    )}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <StudentPicker
              students={students}
              value={studentIds}
              onChange={setStudentIds}
              classNameById={classNameById}
              assignedElsewhere={assignedElsewhere}
            />
          ) : null}

          {step === 3 ? (
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label className='text-xs font-semibold text-slate-700'>Chauffeur</Label>
                {drivers.length > 0 ? (
                  <div className='grid gap-2'>
                    {drivers.map((d) => (
                      <button
                        key={d.id}
                        type='button'
                        onClick={() => {
                          setDriverId(d.id);
                          setDriverName('');
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                          driverId === d.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-8 items-center justify-center rounded-full text-xs font-bold',
                            driverId === d.id ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {initials(d.name)}
                        </span>
                        <span className='flex-1 text-sm font-medium'>{d.name}</span>
                        {driverId === d.id ? <Check className='size-4' /> : null}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className='text-xs text-slate-500'>
                    Aucun chauffeur avec compte tracker. Saisissez un nom, ou créez le chauffeur plus bas dans la page.
                  </p>
                )}
                <Input
                  value={driverName}
                  onChange={(e) => {
                    setDriverName(e.target.value);
                    if (e.target.value) setDriverId('');
                  }}
                  placeholder={drivers.length > 0 ? 'Ou un autre nom…' : 'Nom du chauffeur'}
                  className='h-10 rounded-xl'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='rc-dep' className='text-xs font-semibold text-slate-700'>
                    Départ le matin
                  </Label>
                  <Input id='rc-dep' type='time' value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className='h-11 rounded-xl text-base' />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='rc-ret' className='text-xs font-semibold text-slate-700'>
                    Retour <span className='font-normal text-slate-400'>(option)</span>
                  </Label>
                  <Input id='rc-ret' type='time' value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className='h-11 rounded-xl text-base' />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='rc-name' className='text-xs font-semibold text-slate-700'>
                  Nom de la ligne
                </Label>
                <Input
                  id='rc-name'
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameTouched(true);
                  }}
                  className='h-10 rounded-xl'
                />
              </div>

              <div className='rounded-xl bg-slate-50 p-3 text-xs text-slate-600'>
                <p className='font-semibold text-slate-900'>Récapitulatif</p>
                <p className='mt-1'>
                  {stops.length} arrêt{stops.length > 1 ? 's' : ''}
                  {arrival ? ' → école' : ''} · {km < 10 ? km.toFixed(1) : Math.round(km)} km ·{' '}
                  {studentIds.length} élève{studentIds.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <footer className='flex items-center gap-2 border-t px-5 py-3'>
          {step > 1 ? (
            <Button type='button' variant='ghost' className='h-11 rounded-xl' onClick={() => setStep((s) => (s - 1) as Step)}>
              <ArrowLeft className='mr-1 size-4' />
              Retour
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              type='button'
              className='h-11 flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800'
              disabled={points.length < 2}
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              {points.length < 2
                ? stops.length === 0
                  ? 'Placez au moins un arrêt'
                  : 'Placez un 2e arrêt'
                : step === 1
                  ? 'Continuer · élèves'
                  : `Continuer · ${studentIds.length} élève${studentIds.length > 1 ? 's' : ''}`}
            </Button>
          ) : (
            <Button
              type='button'
              className='h-11 flex-1 rounded-xl bg-orange-600 text-white hover:bg-orange-700'
              disabled={!canSave || saving}
              onClick={() => void handleSave()}
            >
              {saving ? <Loader2 className='mr-2 size-4 animate-spin' /> : <Check className='mr-2 size-4' />}
              {!driverOk ? 'Choisissez un chauffeur' : initial ? 'Enregistrer' : 'Créer la ligne'}
            </Button>
          )}
        </footer>
      </aside>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-30',
        danger ? 'hover:text-red-600' : 'hover:text-slate-900',
      )}
    >
      {children}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function useMediaQuery(query: string) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
