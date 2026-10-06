import React from 'react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

import type { AppUser, AppUserRole, NewUserFormState } from './dashboardTypes';
import { UserCreateWizard, type UserCreatePayload } from './UserCreateWizard';

const ROLE_LABELS: Record<AppUserRole, string> = {
  admin: 'Admin établissement',
  teacher: 'Enseignant',
  parent: 'Parent',
  student: 'Élève',
  staff: 'Personnel (staff)',
};

type UsersSectionProps = {
  users: AppUser[];
  defaultPhoneCountry?: string;
  onCreateUser: (payload: UserCreatePayload) => Promise<void>;
  onUpdateUser: (
    id: string,
    data: { name: string; email?: string; phone?: string; role: AppUserRole; password?: string }
  ) => void | Promise<void>;
  onDeleteUser: (id: string) => void | Promise<void>;
};

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  defaultPhoneCountry,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewUserFormState & { password: string }>({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    password: '',
  });

  const startEdit = (user: AppUser) => {
    setEditingId(user.id);
    setDraft({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      password: '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim() || (!draft.email.trim() && !draft.phone.trim())) return;
    void Promise.resolve(
      onUpdateUser(editingId, {
        name: draft.name.trim(),
        email: draft.email.trim() || undefined,
        phone: draft.phone.trim() || undefined,
        role: draft.role,
        password: draft.password.trim() || undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-6'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Créer un compte utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <UserCreateWizard defaultPhoneCountry={defaultPhoneCountry} onSubmit={onCreateUser} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {users.length === 0 ? (
            <p className='text-muted-foreground'>Aucun utilisateur.</p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {users.map((user) => {
                const isEditing = editingId === user.id;
                return (
                  <div
                    key={user.id}
                    className='dashboard-entity-card'
                  >
                    {isEditing ? (
                      <div className='space-y-2'>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        />
                        <Input
                          type='email'
                          value={draft.email}
                          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                          placeholder='Email'
                        />
                        <Input
                          value={draft.phone}
                          onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          placeholder='Téléphone'
                        />
                        <Select
                          value={draft.role}
                          onValueChange={(value) =>
                            setDraft((d) => ({ ...d, role: value as AppUserRole }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ROLE_LABELS) as AppUserRole[]).map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type='password'
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
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback>
                              {user.name
                                .split(' ')
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((p) => p[0]?.toUpperCase() ?? '')
                                .join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0'>
                            <p className='text-sm font-medium truncate'>{user.name}</p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {user.loginId ? (
                                <>
                                  Connexion : <span className='font-mono'>{user.loginId}</span>
                                </>
                              ) : (
                                user.email || user.phone || '—'
                              )}
                            </p>
                            <Badge variant='secondary' className='mt-0.5 text-xs'>
                              {ROLE_LABELS[user.role]}
                            </Badge>
                          </div>
                        </div>
                        <EntityCrudActions
                          onEdit={() => startEdit(user)}
                          onDelete={() => {
                            if (confirm(`Supprimer l'utilisateur « ${user.name} » ?`)) {
                              void Promise.resolve(onDeleteUser(user.id));
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
