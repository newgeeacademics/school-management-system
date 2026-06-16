import React from 'react';

import { CreditCard, FileDown } from 'lucide-react';

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
    data: {
      firstName: string;
      lastName: string;
      idCardNumber?: string;
      classId?: string;
      email?: string;
      phone?: string;
      password?: string;
    }
  ) => void | Promise<void>;
  onDeleteStudent: (id: string) => void | Promise<void>;
  onPrintIdCard?: (studentId: string) => void | Promise<void>;
  onExportRoster?: (classId?: string) => void | Promise<void>;
  getClassName: (id: string) => string;
  readOnly?: boolean;
};

const emptyDraft = (): NewStudentFormState => ({
  firstName: '',
  lastName: '',
  idCardNumber: '',
  classId: '',
  email: '',
  phone: '',
  password: '',
});

export const StudentsSection: React.FC<StudentsSectionProps> = ({
  students,
  classes,
  newStudent,
  setNewStudent,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  onPrintIdCard,
  onExportRoster,
  getClassName,
  readOnly = false,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewStudentFormState>(emptyDraft());
  const [exportClassId, setExportClassId] = React.useState('');

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setDraft({
      firstName: student.firstName ?? student.name.split(' ')[0] ?? '',
      lastName: student.lastName ?? student.name.split(' ').slice(1).join(' ') ?? '',
      idCardNumber: student.idCardNumber ?? '',
      classId: student.classId ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      password: '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.firstName.trim() || !draft.lastName.trim()) return;
    void Promise.resolve(
      onUpdateStudent(editingId, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        idCardNumber: draft.idCardNumber.trim() || undefined,
        classId: draft.classId && draft.classId !== NONE_SELECT_VALUE ? draft.classId : undefined,
        email: draft.email.trim() || undefined,
        phone: draft.phone.trim() || undefined,
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
              Prénom et nom séparés. Email ou téléphone pour la connexion portail. Le matricule et
              le numéro de carte sont générés automatiquement si non renseignés.
            </p>
            <form
              className='grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] items-end text-xs'
              onSubmit={onCreateStudent}
            >
              <div className='grid gap-2'>
                <Label htmlFor='student-first-name'>Prénom</Label>
                <Input
                  id='student-first-name'
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent((s) => ({ ...s, firstName: e.target.value }))}
                  placeholder='Ex : Aïcha'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='student-last-name'>Nom</Label>
                <Input
                  id='student-last-name'
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent((s) => ({ ...s, lastName: e.target.value }))}
                  placeholder='Ex : Konaté'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='student-id-card'>N° carte (opt.)</Label>
                <Input
                  id='student-id-card'
                  value={newStudent.idCardNumber}
                  onChange={(e) => setNewStudent((s) => ({ ...s, idCardNumber: e.target.value }))}
                  placeholder='Auto si vide'
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
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='student-phone'>Téléphone (connexion)</Label>
                <Input
                  id='student-phone'
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent((s) => ({ ...s, phone: e.target.value }))}
                  placeholder='+225…'
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
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
          <CardTitle className='text-sm font-medium'>Élèves ({students.length})</CardTitle>
          {!readOnly && onExportRoster ? (
            <div className='flex flex-wrap items-center gap-2'>
              <Select
                value={exportClassId || NONE_SELECT_VALUE}
                onValueChange={(value) =>
                  setExportClassId(value === NONE_SELECT_VALUE ? '' : value)
                }
              >
                <SelectTrigger className='h-8 w-[160px] text-xs'>
                  <SelectValue placeholder='Classe (export)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_SELECT_VALUE}>Toutes les classes</SelectItem>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 gap-1 text-xs'
                onClick={() =>
                  void Promise.resolve(
                    onExportRoster(exportClassId && exportClassId !== NONE_SELECT_VALUE ? exportClassId : undefined)
                  )
                }
              >
                <FileDown className='size-3.5' />
                Export Word
              </Button>
            </div>
          ) : null}
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
                          value={draft.firstName}
                          onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                          placeholder='Prénom'
                        />
                        <Input
                          value={draft.lastName}
                          onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                          placeholder='Nom'
                        />
                        <Input
                          value={draft.idCardNumber}
                          onChange={(e) => setDraft((d) => ({ ...d, idCardNumber: e.target.value }))}
                          placeholder='N° carte (opt.)'
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
                        <Input
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          placeholder='Téléphone portail'
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
                        {student.matricule && (
                          <p className='text-[11px] font-mono text-muted-foreground'>
                            Matricule : {student.matricule}
                          </p>
                        )}
                        {student.idCardNumber && (
                          <p className='text-[11px] font-mono text-muted-foreground'>
                            N° carte : {student.idCardNumber}
                          </p>
                        )}
                        {(student.email || student.phone) && (
                          <p className='text-[11px] text-muted-foreground'>
                            {student.email ?? student.phone}
                          </p>
                        )}
                        {!readOnly && onPrintIdCard && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='mt-2 h-7 gap-1 text-[11px]'
                            onClick={() => void Promise.resolve(onPrintIdCard(student.id))}
                          >
                            <CreditCard className='size-3' />
                            Carte scolaire
                          </Button>
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
