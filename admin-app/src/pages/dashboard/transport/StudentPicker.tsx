import React from 'react';
import { Check, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Student } from '../dashboardTypes';

type StudentPickerProps = {
  students: Student[];
  value: string[];
  onChange: (ids: string[]) => void;
  classNameById?: Record<string, string>;
  /** studentId -> name of the other line they already ride. */
  assignedElsewhere?: Record<string, string>;
};

/** Searchable tick-list of pupils, grouped by class. */
export function StudentPicker({ students, value, onChange, classNameById, assignedElsewhere }: StudentPickerProps) {
  const [query, setQuery] = React.useState('');
  const selected = React.useMemo(() => new Set(value), [value]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter((s) => {
        if (!q) return true;
        const cls = s.classId ? classNameById?.[s.classId] ?? '' : '';
        return s.name.toLowerCase().includes(q) || cls.toLowerCase().includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [students, query, classNameById]);

  const groups = React.useMemo(() => {
    const map = new Map<string, Student[]>();
    for (const s of filtered) {
      const key = (s.classId && classNameById?.[s.classId]) || 'Sans classe';
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr'));
  }, [filtered, classNameById]);

  const toggle = (id: string) => onChange(selected.has(id) ? value.filter((x) => x !== id) : [...value, id]);
  const setMany = (ids: string[], on: boolean) => {
    const next = new Set(value);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onChange([...next]);
  };

  if (students.length === 0) {
    return (
      <p className='rounded-xl border border-dashed px-4 py-6 text-center text-sm text-slate-500'>
        Aucun élève enregistré. Vous pourrez en ajouter à la ligne plus tard.
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Nom ou classe…'
          className='h-11 rounded-xl pl-9'
        />
      </div>
      <p className='text-xs text-slate-500'>
        <span className='font-semibold text-slate-900'>{value.length}</span> élève{value.length > 1 ? 's' : ''} sélectionné
        {value.length > 1 ? 's' : ''}
        {value.length > 0 ? (
          <button type='button' className='ml-2 text-blue-600 hover:underline' onClick={() => onChange([])}>
            Tout retirer
          </button>
        ) : null}
      </p>

      {groups.map(([group, list]) => {
        const ids = list.map((s) => s.id);
        const allOn = ids.every((id) => selected.has(id));
        return (
          <section key={group}>
            <div className='mb-1 flex items-center justify-between'>
              <h4 className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>{group}</h4>
              <button type='button' className='text-[11px] font-medium text-blue-600 hover:underline' onClick={() => setMany(ids, !allOn)}>
                {allOn ? 'Décocher' : 'Tout cocher'}
              </button>
            </div>
            <ul className='overflow-hidden rounded-xl border border-slate-200'>
              {list.map((s) => {
                const on = selected.has(s.id);
                const other = assignedElsewhere?.[s.id];
                return (
                  <li key={s.id} className='border-b border-slate-100 last:border-0'>
                    <button
                      type='button'
                      onClick={() => toggle(s.id)}
                      className={cn('flex w-full items-center gap-3 px-3 py-2.5 text-left transition', on ? 'bg-blue-50' : 'hover:bg-slate-50')}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border-2',
                          on ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300',
                        )}
                      >
                        {on ? <Check className='size-3' strokeWidth={3} /> : null}
                      </span>
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-medium text-slate-900'>{s.name}</span>
                        {other ? <span className='block truncate text-[11px] text-amber-700'>Déjà sur {other}</span> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {filtered.length === 0 ? <p className='text-center text-sm text-slate-500'>Aucun résultat.</p> : null}
    </div>
  );
}
