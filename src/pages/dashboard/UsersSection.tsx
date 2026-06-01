import React from 'react';

import { EntityCrudActions } from '@/components/dashboard/EntityCrudActions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

import type { AppUser, AppUserRole, NewUserFormState, SetStateAction } from './dashboardTypes';

const ROLE_LABELS: Record<AppUserRole, string> = {
  admin: 'Admin établissement',
  teacher: 'Enseignant',
  parent: 'Parent',
  student: 'Élève',
};

type UsersSectionProps = {
  users: AppUser[];
  newUser: NewUserFormState;
  setNewUser: SetStateAction<NewUserFormState>;
  onCreateUser: (e: React.FormEvent) => void;
  onUpdateUser: (
    id: string,
    data: { name: string; email: string; role: AppUserRole; password?: string }
  ) => void | Promise<void>;
  onDeleteUser: (id: string) => void | Promise<void>;
};

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  newUser,
  setNewUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<NewUserFormState & { password: string }>({
    name: '',
    email: '',
    role: 'teacher',
    password: '',
  });

  const startEdit = (user: AppUser) => {
    setEditingId(user.id);
    setDraft({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const saveEdit = () => {
    if (!editingId || !draft.name.trim() || !draft.email.trim()) return;
    void Promise.resolve(
      onUpdateUser(editingId, {
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role,
        password: draft.password.trim() || undefined,
      })
    ).then(() => setEditingId(null));
  };

  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Créer un compte utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-3 text-[11px] text-muted-foreground'>
            Comptes de connexion (portail / admin). Mot de passe par défaut : <strong>changeme</strong>{' '}
            si vide.
          </p>
          <form
            className='grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end text-xs'
            onSubmit={onCreateUser}
          >
            <div className='grid gap-2'>
              <Label>Nom</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Email</Label>
              <Input
                type='email'
                value={newUser.email}
                onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Rôle</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser((u) => ({ ...u, role: value as AppUserRole }))}
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
            </div>
            <div className='grid gap-2'>
              <Label>Mot de passe (opt.)</Label>
              <Input
                type='password'
                value={newUser.password ?? ''}
                onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                placeholder='changeme'
              />
            </div>
            <Button type='submit' size='sm'>
              Créer
            </Button>
          </form>
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
                    className='rounded-md border border-border/80 px-3 py-2'
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
                            <p className='text-[11px] text-muted-foreground truncate'>{user.email}</p>
                            <Badge variant='secondary' className='mt-0.5 text-[10px]'>
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
