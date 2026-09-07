import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { ClassItem, Matiere } from './dashboardTypes';

export function homeroomClassIdsForTeacher(teacherId: string, classes: ClassItem[]): string[] {
  return classes.filter((c) => c.homeroomTeacherId === teacherId).map((c) => c.id);
}

function toggleClassId(ids: string[], classId: string, checked: boolean): string[] {
  if (checked) return ids.includes(classId) ? ids : [...ids, classId];
  return ids.filter((id) => id !== classId);
}

export function ClassAssignmentPicker({
  classes,
  selectedIds,
  onChange,
  idPrefix,
  emptyHint = 'Créez d\u2019abord des classes pour assigner un enseignant.',
}: {
  classes: ClassItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  idPrefix: string;
  emptyHint?: string;
}) {
  if (classes.length === 0) {
    return (
      <p className='text-xs text-muted-foreground italic rounded-lg border border-dashed p-3'>
        {emptyHint}
      </p>
    );
  }

  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {classes.map((classe) => {
        const inputId = `${idPrefix}-class-${classe.id}`;
        return (
          <label
            key={classe.id}
            htmlFor={inputId}
            className='flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs cursor-pointer hover:bg-muted/50'
          >
            <input
              id={inputId}
              type='checkbox'
              className='mt-0.5 h-4 w-4 rounded border-slate-300'
              checked={selectedIds.includes(classe.id)}
              onChange={(e) => onChange(toggleClassId(selectedIds, classe.id, e.target.checked))}
            />
            <span>
              <span className='font-medium'>{classe.name}</span>
              <span className='text-muted-foreground'> · {classe.level}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function toggleHomeroomClass(ids: string[], classId: string, checked: boolean): string[] {
  if (checked) return ids.includes(classId) ? ids : [...ids, classId];
  return ids.filter((id) => id !== classId);
}

export function HomeroomPicker({
  classes,
  selectedIds,
  onChange,
  idPrefix,
  editingTeacherId,
}: {
  classes: ClassItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  idPrefix: string;
  editingTeacherId?: string | null;
}) {
  if (classes.length === 0) {
    return (
      <p className='text-xs text-muted-foreground italic rounded-lg border border-dashed p-3'>
        Créez d&apos;abord des classes pour assigner un professeur principal.
      </p>
    );
  }

  return (
    <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {classes.map((classe) => {
        const inputId = `${idPrefix}-homeroom-${classe.id}`;
        const takenByOther =
          classe.homeroomTeacherId &&
          classe.homeroomTeacherId !== editingTeacherId &&
          !selectedIds.includes(classe.id);
        return (
          <label
            key={classe.id}
            htmlFor={inputId}
            className='flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs cursor-pointer hover:bg-muted/50'
          >
            <input
              id={inputId}
              type='checkbox'
              className='mt-0.5 h-4 w-4 rounded border-slate-300'
              checked={selectedIds.includes(classe.id)}
              onChange={(e) => onChange(toggleHomeroomClass(selectedIds, classe.id, e.target.checked))}
            />
            <span>
              <span className='font-medium'>{classe.name}</span>
              <span className='text-muted-foreground'> · {classe.level}</span>
              {takenByOther ? (
                <span className='block text-xs text-amber-700'>Remplacera le PP actuel</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function matiereNamesFrom(matiereList: Matiere[]): string[] {
  return [...new Set(matiereList.map((m) => m.name.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );
}

export function SubjectField({
  value,
  onChange,
  matieres,
  onOpenMatieres,
  idPrefix,
  compact = false,
}: {
  value: string;
  onChange: (subject: string) => void;
  matieres: Matiere[];
  onOpenMatieres?: () => void;
  idPrefix: string;
  compact?: boolean;
}) {
  const names = matiereNamesFrom(matieres);
  const options = names.length > 0 ? [...names, 'Autre'] : [];
  const [preset, setPreset] = React.useState(() => {
    if (names.includes(value)) return value;
    if (value.trim()) return 'Autre';
    return '';
  });

  React.useEffect(() => {
    if (names.includes(value)) setPreset(value);
    else if (value.trim()) setPreset('Autre');
    else setPreset('');
  }, [value, names]);

  if (names.length === 0) {
    return (
      <div className='grid gap-2'>
        {!compact ? <Label htmlFor={`${idPrefix}-subject`}>Matière principale *</Label> : null}
        <Input
          id={`${idPrefix}-subject`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Ex : Mathématiques'
          required
        />
        <p className='text-xs text-muted-foreground'>
          Aucune matière enregistrée. Ajoutez d&apos;abord les matières du programme dans le menu{' '}
          <strong>Matières</strong>.
        </p>
        {onOpenMatieres ? (
          <Button type='button' variant='link' className='h-auto justify-start p-0 text-xs' onClick={onOpenMatieres}>
            Aller aux matières
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className='grid gap-2'>
      {!compact ? <Label htmlFor={`${idPrefix}-subject-preset`}>Matière principale *</Label> : null}
      <Select
        value={preset || undefined}
        onValueChange={(next) => {
          setPreset(next);
          onChange(next === 'Autre' ? '' : next);
        }}
      >
        <SelectTrigger id={`${idPrefix}-subject-preset`} className='w-full'>
          <SelectValue placeholder='Choisir une matière du programme' />
        </SelectTrigger>
        <SelectContent>
          {options.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {preset === 'Autre' ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Précisez la matière'
          required
        />
      ) : null}
    </div>
  );
}
