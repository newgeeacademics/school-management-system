import React from 'react';

import { EntityCrudActions, NONE_SELECT_VALUE } from '@/components/dashboard/EntityCrudActions';
import { Badge } from '@/components/ui/badge';
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

import { getSystemLabel, type SchoolProfile } from '@/lib/school-profile';
import { buildClassNameOptions } from '@/lib/class-name-utils';

import { type SchoolType } from './dashboardConstants';
import type { ClassItem, NewClassFormState, SetStateAction, Teacher } from './dashboardTypes';

type ClassesSectionProps = {
  classes: ClassItem[];
  teachers: Teacher[];
  newClass: NewClassFormState;
  setNewClass: SetStateAction<NewClassFormState>;
  onCreateClass: (e: React.FormEvent) => void;
  onUpdateClass: (
    id: string,
    data: { name: string; level: string; studentsCount: number; homeroomTeacherId?: string }
  ) => void | Promise<void>;
  onDeleteClass: (id: string) => void | Promise<void>;
  getTeacherName: (id?: string) => string;
  schoolTypes: SchoolType[];
  schoolProfile: SchoolProfile | null;
  levelOptions: string[];
};

export const ClassesSection: React.FC<ClassesSectionProps> = ({
  classes,
  teachers,
  newClass,
  setNewClass,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  getTeacherName,
  schoolTypes,
  schoolProfile,
  levelOptions,
}) => {
  const effectiveType: SchoolType | '' = schoolTypes.length > 0 ? schoolTypes[0] : '';

  const classNameOptions = React.useMemo(() => {
    return buildClassNameOptions(
      newClass.level,
      classes.map((classe) => classe.name)
    );
  }, [newClass.level, classes]);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({
    name: '',
    level: '',
    studentsCount: '0',
    homeroomTeacherId: '',
  });

  const startEdit = (classe: ClassItem) => {
    setEditingId(classe.id);
    setDraft({
      name: classe.name,
      level: classe.level,
      studentsCount: String(classe.studentsCount),
      homeroomTeacherId: classe.homeroomTeacherId ?? '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim()) return;
    void Promise.resolve(
      onUpdateClass(editingId, {
        name: draft.name.trim(),
        level: draft.level.trim() || 'Niveau non défini',
        studentsCount: Number(draft.studentsCount || 0),
        homeroomTeacherId:
          draft.homeroomTeacherId && draft.homeroomTeacherId !== NONE_SELECT_VALUE
            ? draft.homeroomTeacherId
            : undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      {schoolProfile ? (
        <div className='dashboard-school-context flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600'>
          <Badge variant='outline' className='dashboard-header__school-type text-[10px] px-2 py-0.5'>
            {schoolProfile.type}
          </Badge>
          <Badge
            variant='outline'
            className={`dashboard-header__school-system dashboard-header__school-system--${schoolProfile.system} text-[10px] px-2 py-0.5`}
          >
            {getSystemLabel(schoolProfile.system)}
          </Badge>
          <span>
            Niveaux proposés pour votre établissement ({schoolProfile.name}
            {schoolProfile.city ? ` · ${schoolProfile.city}` : ''}).
          </span>
        </div>
      ) : null}
      <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Créer une classe</CardTitle>
          </CardHeader>
          <CardContent>
            <form className='space-y-3 text-xs' onSubmit={onCreateClass}>
              <div className='grid gap-2'>
                <Label>Niveau</Label>
                <Select
                  value={newClass.level}
                  onValueChange={(value) => setNewClass((c) => ({ ...c, level: value, name: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        effectiveType
                          ? `Choisir un niveau (${effectiveType})`
                          : 'Choisir un niveau'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label>Nom de la classe</Label>
                <Select
                  value={newClass.name}
                  onValueChange={(value) => setNewClass((c) => ({ ...c, name: value }))}
                  disabled={!newClass.level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Ex. 6ème A' />
                  </SelectTrigger>
                  <SelectContent>
                    {classNameOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label>Nombre d&apos;élèves (indicatif)</Label>
                <Input
                  type='number'
                  min={0}
                  value={newClass.studentsCount}
                  onChange={(e) => setNewClass((c) => ({ ...c, studentsCount: e.target.value }))}
                />
              </div>
              <div className='grid gap-2'>
                <Label>Professeur principal</Label>
                <Select
                  value={newClass.homeroomTeacherId || NONE_SELECT_VALUE}
                  onValueChange={(value) =>
                    setNewClass((c) => ({
                      ...c,
                      homeroomTeacherId: value === NONE_SELECT_VALUE ? '' : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Enseignant' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_SELECT_VALUE}>Aucun</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} · {teacher.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type='submit' size='sm'>
                Enregistrer la classe
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Résumé</CardTitle>
          </CardHeader>
          <CardContent className='text-xs text-muted-foreground space-y-1'>
            <p>
              Classes : <span className='font-medium text-foreground'>{classes.length}</span>
            </p>
            <p>
              Avec prof. principal :{' '}
              <span className='font-medium text-foreground'>
                {classes.filter((c) => c.homeroomTeacherId).length}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {classes.map((classe) => {
          const isEditing = editingId === classe.id;
          return (
            <Card key={classe.id}>
              <CardHeader className='pb-2'>
                {isEditing ? (
                  <div className='space-y-2 text-xs'>
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder='Nom'
                    />
                    <Input
                      value={draft.level}
                      onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value }))}
                      placeholder='Niveau'
                    />
                    <Input
                      type='number'
                      min={0}
                      value={draft.studentsCount}
                      onChange={(e) => setDraft((d) => ({ ...d, studentsCount: e.target.value }))}
                    />
                    <Select
                      value={draft.homeroomTeacherId || NONE_SELECT_VALUE}
                      onValueChange={(value) =>
                        setDraft((d) => ({
                          ...d,
                          homeroomTeacherId: value === NONE_SELECT_VALUE ? '' : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_SELECT_VALUE}>Aucun prof.</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <EntityCrudActions
                      editing
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onSave={saveEdit}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div className='flex items-center justify-between gap-2'>
                    <CardTitle className='text-sm font-semibold'>{classe.name}</CardTitle>
                    <Badge variant='outline' className='text-[10px]'>
                      {classe.level}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              {!isEditing && (
                <CardContent className='space-y-1 text-xs text-muted-foreground'>
                  <p>
                    <span className='font-medium text-foreground'>{classe.studentsCount}</span> élèves
                    (indicatif)
                  </p>
                  <p>
                    Prof. principal :{' '}
                    <span className='text-foreground'>
                      {getTeacherName(classe.homeroomTeacherId)}
                    </span>
                  </p>
                  <EntityCrudActions
                    onEdit={() => startEdit(classe)}
                    onDelete={() => {
                      if (confirm(`Supprimer la classe « ${classe.name} » ?`)) {
                        void Promise.resolve(onDeleteClass(classe.id));
                      }
                    }}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};
