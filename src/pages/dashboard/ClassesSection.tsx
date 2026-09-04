import React from 'react';

import { EntityCrudActions, NONE_SELECT_VALUE } from '@/components/dashboard/EntityCrudActions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { ClassItem, Teacher } from './dashboardTypes';
import { ClassCreateWizard, type ClassCreatePayload } from './ClassCreateWizard';

type ClassesSectionProps = {
  classes: ClassItem[];
  teachers: Teacher[];
  onCreateClass: (payload: ClassCreatePayload) => Promise<void>;
  onUpdateClass: (
    id: string,
    data: { name: string; level: string; studentsCount: number; homeroomTeacherId?: string }
  ) => void | Promise<void>;
  onDeleteClass: (id: string) => void | Promise<void>;
  getTeacherName: (id?: string) => string;
  levelOptions: string[];
};

export const ClassesSection: React.FC<ClassesSectionProps> = ({
  classes,
  teachers,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  getTeacherName,
  levelOptions,
}) => {
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
    <section className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Créer une classe</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassCreateWizard
              classes={classes}
              teachers={teachers}
              levelOptions={levelOptions}
              onSubmit={onCreateClass}
              getTeacherName={getTeacherName}
            />
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
                    <CardTitle className='text-sm font-semibold tracking-tight'>{classe.name}</CardTitle>
                    <Badge variant='outline' className='text-xs'>
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
