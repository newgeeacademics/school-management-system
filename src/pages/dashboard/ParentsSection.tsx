import React from 'react';

import { InputPassword } from '@/components/refine-ui/form/input-password';
import { EntityCrudActions, NONE_SELECT_VALUE } from '@/components/dashboard/EntityCrudActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { NewParentFormState, ParentContact, Student } from './dashboardTypes';
import { ParentCreateWizard, type ParentCreatePayload } from './ParentCreateWizard';

type ParentsSectionProps = {
  parents: ParentContact[];
  students: Student[];
  defaultPhoneCountry?: string;
  onCreateParent: (payload: ParentCreatePayload) => Promise<void>;
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
  defaultPhoneCountry,
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
    <section className='space-y-6'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Ajouter un parent</CardTitle>
          <CardDescription className='text-xs'>
            Parcours guidé en 3 étapes — identité, compte portail, lien avec un élève.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParentCreateWizard
            students={students}
            defaultPhoneCountry={defaultPhoneCountry}
            onSubmit={onCreateParent}
          />
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
                  <div key={parent.id} className='dashboard-entity-card'>
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
                        <p className='text-xs text-muted-foreground'>
                          {parent.loginId ? (
                            <>
                              Connexion : <span className='font-mono'>{parent.loginId}</span>
                              {parent.phone ? ` · Tél. : ${parent.phone}` : ''}
                            </>
                          ) : (
                            <>Tél. : {parent.phone || '—'} · Email : {parent.email || '—'}</>
                          )}
                        </p>
                        <p className='text-xs text-muted-foreground'>
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
