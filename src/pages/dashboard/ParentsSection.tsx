import React from 'react';

import { EntityCrudActions, NONE_SELECT_VALUE } from '@/components/dashboard/EntityCrudActions';
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
  NewParentFormState,
  ParentContact,
  SetStateAction,
  Student,
} from './dashboardTypes';

type ParentsSectionProps = {
  parents: ParentContact[];
  students: Student[];
  newParent: NewParentFormState;
  setNewParent: SetStateAction<NewParentFormState>;
  onCreateParent: (e: React.FormEvent) => void;
  onUpdateParent: (
    id: string,
    data: { name: string; phone?: string; email?: string; studentId?: string }
  ) => void | Promise<void>;
  onDeleteParent: (id: string) => void | Promise<void>;
};

export const ParentsSection: React.FC<ParentsSectionProps> = ({
  parents,
  students,
  newParent,
  setNewParent,
  onCreateParent,
  onUpdateParent,
  onDeleteParent,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewParentFormState>({
    name: '',
    phone: '',
    email: '',
    studentId: '',
  });

  const getStudentName = (id: string | undefined) =>
    id ? students.find((s) => s.id === id)?.name ?? '—' : '—';

  const startEdit = (parent: ParentContact) => {
    setEditingId(parent.id);
    setDraft({
      name: parent.name,
      phone: parent.phone ?? '',
      email: parent.email ?? '',
      studentId: parent.studentId ?? '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim()) return;
    void Promise.resolve(
      onUpdateParent(editingId, {
        name: draft.name.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        studentId:
          draft.studentId && draft.studentId !== NONE_SELECT_VALUE ? draft.studentId : undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Ajouter un parent</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end text-xs'
            onSubmit={onCreateParent}
          >
            <div className='grid gap-2'>
              <Label htmlFor='parent-name'>Nom complet</Label>
              <Input
                id='parent-name'
                value={newParent.name}
                onChange={(e) => setNewParent((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='parent-phone'>Téléphone</Label>
              <Input
                id='parent-phone'
                value={newParent.phone}
                onChange={(e) => setNewParent((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='parent-email'>Email</Label>
              <Input
                id='parent-email'
                type='email'
                value={newParent.email}
                onChange={(e) => setNewParent((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Enfant</Label>
              <Select
                value={newParent.studentId || NONE_SELECT_VALUE}
                onValueChange={(value) =>
                  setNewParent((p) => ({
                    ...p,
                    studentId: value === NONE_SELECT_VALUE ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Élève' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_SELECT_VALUE}>Aucun élève</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type='submit' size='sm'>
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Parents ({parents.length})</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {parents.length === 0 ? (
            <p className='text-muted-foreground'>Aucun parent. Créez d&apos;abord des élèves pour les associer.</p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {parents.map((parent) => {
                const isEditing = editingId === parent.id;
                return (
                  <div key={parent.id} className='rounded-md border border-border/80 px-3 py-2'>
                    {isEditing ? (
                      <div className='space-y-2'>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        />
                        <Input
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          placeholder='Téléphone'
                        />
                        <Input
                          type='email'
                          value={draft.email}
                          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                          placeholder='Email'
                        />
                        <Select
                          value={draft.studentId || NONE_SELECT_VALUE}
                          onValueChange={(value) =>
                            setDraft((d) => ({
                              ...d,
                              studentId: value === NONE_SELECT_VALUE ? '' : value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_SELECT_VALUE}>Aucun élève</SelectItem>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name}
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
                      <>
                        <p className='text-sm font-medium'>{parent.name}</p>
                        <p className='text-[11px] text-muted-foreground'>
                          Tél. : {parent.phone || '—'} · Email : {parent.email || '—'}
                        </p>
                        <p className='text-[11px] text-muted-foreground'>
                          Enfant : {getStudentName(parent.studentId)}
                        </p>
                        <EntityCrudActions
                          onEdit={() => startEdit(parent)}
                          onDelete={() => {
                            if (confirm(`Supprimer le parent « ${parent.name} » ?`)) {
                              void Promise.resolve(onDeleteParent(parent.id));
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
