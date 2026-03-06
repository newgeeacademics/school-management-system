import React from 'react';

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

import type {
  AppUser,
  AppUserRole,
  NewUserFormState,
  SetStateAction,
} from './dashboardTypes';

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
};

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  newUser,
  setNewUser,
  onCreateUser,
}) => {
  return (
    <section className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Créer un utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className='grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] items-end text-xs'
            onSubmit={onCreateUser}
          >
            <div className='grid gap-2'>
              <Label htmlFor='user-name'>Nom complet</Label>
              <Input
                id='user-name'
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, name: e.target.value }))
                }
                placeholder='Ex : Jean Dupont'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='user-email'>Email</Label>
              <Input
                id='user-email'
                type='email'
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, email: e.target.value }))
                }
                placeholder='exemple@ecole.fr'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Rôle</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser((u) => ({ ...u, role: value as AppUserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choisir un rôle' />
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
            <Button type='submit' size='sm'>
              Créer l&apos;utilisateur
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Utilisateurs (administration)
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {users.length === 0 ? (
            <p className='text-muted-foreground'>
              Aucun utilisateur créé. Créez un utilisateur pour lui donner accès
              au tableau de bord selon son rôle.
            </p>
          ) : (
            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
              {users.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center gap-3 rounded-md border border-border/80 px-3 py-2'
                >
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
                    <p className='text-sm font-medium text-foreground truncate'>
                      {user.name}
                    </p>
                    <p className='text-[11px] text-muted-foreground truncate'>
                      {user.email}
                    </p>
                    <Badge variant='secondary' className='mt-0.5 text-[10px]'>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
