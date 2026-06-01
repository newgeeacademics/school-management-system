import React from 'react';

import { InputPassword } from '@/components/refine-ui/form/input-password';
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
  ClassItem,
  NewStudentFormState,
  SetStateAction,
  Student,
} from './dashboardTypes';

type StudentsSectionProps = {
  students: Student[];
  classes: ClassItem[];
  newStudent: NewStudentFormState;
  setNewStudent: SetStateAction<NewStudentFormState>;
  onCreateStudent: (e: React.FormEvent) => void;
  onUpdateStudent: (
    id: string,
    data: { name: string; classId?: string; email?: string; password?: string }
  ) => void | Promise<void>;
  onDeleteStudent: (id: string) => void | Promise<void>;
  getClassName: (id: string) => string;
  readOnly?: boolean;
};

export const StudentsSection: React.FC<StudentsSectionProps> = ({
  students,
  classes,
  newStudent,
  setNewStudent,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  getClassName,
  readOnly = false,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewStudentFormState>({
    name: '',
    classId: '',
    email: '',
    password: '',
  });

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setDraft({
      name: student.name,
      classId: student.classId ?? '',
      email: student.email ?? '',
      password: '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim()) return;
    void Promise.resolve(
      onUpdateStudent(editingId, {
        name: draft.name.trim(),
        classId: draft.classId && draft.classId !== NONE_SELECT_VALUE ? draft.classId : undefined,
        email: draft.email.trim() || undefined,
        password: draft.password.trim() || undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Ajouter un élève + compte portail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-3 text-[11px] text-muted-foreground'>
              L&apos;email sert à la connexion sur le portail (rôle élève).
            </p>
            <form
              className='grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end text-xs'
              onSubmit={onCreateStudent}
            >
              <div className='grid gap-2'>
                <Label htmlFor='student-name'>Nom complet</Label>
                <Input
                  id='student-name'
                  value={newStudent.name}
                  onChange={(e) => setNewStudent((s) => ({ ...s, name: e.target.value }))}
                  placeholder='Ex : Aïcha Konaté'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label>Classe</Label>
                <Select
                  value={newStudent.classId || NONE_SELECT_VALUE}
                  onValueChange={(value) =>
                    setNewStudent((s) => ({
                      ...s,
                      classId: value === NONE_SELECT_VALUE ? '' : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Associer à une classe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_SELECT_VALUE}>Aucune classe</SelectItem>
                    {classes.map((classe) => (
                      <SelectItem key={classe.id} value={classe.id}>
                        {classe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='student-email'>Email (connexion)</Label>
                <Input
                  id='student-email'
                  type='email'
                  value={newStudent.email}
                  onChange={(e) => setNewStudent((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label>Mot de passe</Label>
                <InputPassword
                  value={newStudent.password}
                  onChange={(e) => setNewStudent((s) => ({ ...s, password: e.target.value }))}
                  placeholder='changeme si vide'
                />
              </div>
              <Button type='submit' size='sm'>
                Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Élèves ({students.length})</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {students.length === 0 ? (
            <p className='text-muted-foreground'>Aucun élève. Ajoutez-en un puis associez-le à une classe.</p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {students.map((student) => {
                const isEditing = editingId === student.id;
                return (
                  <div key={student.id} className='rounded-md border border-border/80 px-3 py-2'>
                    {isEditing ? (
                      <div className='space-y-2'>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          placeholder='Nom'
                        />
                        <Select
                          value={draft.classId || NONE_SELECT_VALUE}
                          onValueChange={(value) =>
                            setDraft((d) => ({
                              ...d,
                              classId: value === NONE_SELECT_VALUE ? '' : value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Classe' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_SELECT_VALUE}>Aucune classe</SelectItem>
                            {classes.map((classe) => (
                              <SelectItem key={classe.id} value={classe.id}>
                                {classe.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type='email'
                          value={draft.email}
                          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                          placeholder='Email portail'
                        />
                        <InputPassword
                          value={draft.password}
                          onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                          placeholder='Nouveau mot de passe (opt.)'
                        />
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
                        <p className='text-sm font-medium text-foreground'>{student.name}</p>
                        <p className='text-[11px] text-muted-foreground'>
                          Classe :{' '}
                          {student.classId ? getClassName(student.classId) : 'Non renseignée'}
                        </p>
                        {student.email && (
                          <p className='text-[11px] text-muted-foreground'>{student.email}</p>
                        )}
                        {!readOnly && (
                          <EntityCrudActions
                            onEdit={() => startEdit(student)}
                            onDelete={() => {
                              if (confirm(`Supprimer l'élève « ${student.name} » ?`)) {
                                void Promise.resolve(onDeleteStudent(student.id));
                              }
                            }}
                          />
                        )}
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
