import React from 'react';

import { InputPassword } from '@/components/refine-ui/form/input-password';
import { LoginIdPreview } from '@/components/dashboard/LoginIdPreview';
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
    data: {
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      studentId?: string;
      password?: string;
    }
  ) => void | Promise<void>;
  onDeleteParent: (id: string) => void | Promise<void>;
};

const emptyDraft = (): NewParentFormState => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  studentId: '',
});

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
  const [draft, setDraft] = React.useState<NewParentFormState>(emptyDraft());

  const getStudentName = (id: string | undefined) =>
    id ? students.find((s) => s.id === id)?.name ?? '—' : '—';

  const startEdit = (parent: ParentContact) => {
    setEditingId(parent.id);
    setDraft({
      firstName: parent.firstName ?? parent.name.split(' ')[0] ?? '',
      lastName: parent.lastName ?? parent.name.split(' ').slice(1).join(' ') ?? '',
      phone: parent.phone ?? '',
      email: parent.email ?? '',
      password: '',
      studentId: parent.studentId ?? '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.firstName.trim() || !draft.lastName.trim()) return;
    void Promise.resolve(
      onUpdateParent(editingId, {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phone: draft.phone.trim() || undefined,
        email: draft.email.trim() || undefined,
        studentId:
          draft.studentId && draft.studentId !== NONE_SELECT_VALUE ? draft.studentId : undefined,
        password: draft.password.trim() || undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Ajouter un parent + compte portail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-3 text-[11px] text-muted-foreground'>
            Liez le parent à un élève. L&apos;identifiant de connexion portail est généré automatiquement
            à partir du prénom et du nom.
          </p>
          <form
            className='grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] items-end text-xs'
            onSubmit={onCreateParent}
          >
            <div className='grid gap-2'>
              <Label htmlFor='parent-first-name'>Prénom</Label>
              <Input
                id='parent-first-name'
                value={newParent.firstName}
                onChange={(e) => setNewParent((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='parent-last-name'>Nom</Label>
              <Input
                id='parent-last-name'
                value={newParent.lastName}
                onChange={(e) => setNewParent((p) => ({ ...p, lastName: e.target.value }))}
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
              <Label htmlFor='parent-email'>E-mail de contact *</Label>
              <Input
                id='parent-email'
                type='email'
                value={newParent.email}
                onChange={(e) => setNewParent((p) => ({ ...p, email: e.target.value }))}
                placeholder='parent@exemple.com'
                required
              />
            </div>
            <div className='grid gap-2 md:col-span-2 lg:col-span-3'>
              <LoginIdPreview firstName={newParent.firstName} lastName={newParent.lastName} />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='parent-password'>Mot de passe</Label>
              <InputPassword
                id='parent-password'
                value={newParent.password}
                onChange={(e) => setNewParent((p) => ({ ...p, password: e.target.value }))}
                placeholder='changeme si vide'
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
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          placeholder='Téléphone'
                        />
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
                          {parent.loginId ? (
                            <>
                              Connexion : <span className='font-mono'>{parent.loginId}</span>
                              {parent.phone ? ` · Tél. : ${parent.phone}` : ''}
                            </>
                          ) : (
                            <>Tél. : {parent.phone || '—'} · Email : {parent.email || '—'}</>
                          )}
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
