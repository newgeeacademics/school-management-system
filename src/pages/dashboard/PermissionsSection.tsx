import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchRoleAccessMatrix,
  isBackendApiConfigured,
  updateRoleAccessMatrix,
  type AccessLevel,
  type AppModule,
  type RoleAccessEntry,
} from '@/lib/dashboard-backend';

const ROLES: { id: string; label: string }[] = [
  { id: 'ADMIN', label: 'Direction (admin)' },
  { id: 'TEACHER', label: 'Enseignant' },
  { id: 'STAFF', label: 'Personnel' },
  { id: 'PARENT', label: 'Parent' },
  { id: 'STUDENT', label: 'Élève' },
];

const MODULES: { id: AppModule; label: string; hint: string }[] = [
  { id: 'ADMIN_CONSOLE', label: 'Console admin', hint: 'Tableau de bord établissement' },
  { id: 'FAMILY_PORTAL', label: 'Portail familles', hint: 'Parents, élèves, enseignants' },
  { id: 'FINANCE_OFFICE', label: 'Finance & paie', hint: 'Trésorerie, salaires' },
];

const LEVELS: { id: AccessLevel; label: string }[] = [
  { id: 'NONE', label: 'Aucun' },
  { id: 'READ', label: 'Lecture' },
  { id: 'WRITE', label: 'Écriture' },
];

type Props = {
  onOpenUsers?: () => void;
};

export function PermissionsSection({ onOpenUsers }: Props) {
  const [entries, setEntries] = React.useState<RoleAccessEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isBackendApiConfigured()) {
      setLoading(false);
      return;
    }
    void fetchRoleAccessMatrix()
      .then(setEntries)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const getLevel = (role: string, module: AppModule): AccessLevel => {
    const row = entries.find((e) => e.role === role && e.module === module);
    return row?.accessLevel ?? 'NONE';
  };

  const setLevel = (role: string, module: AppModule, accessLevel: AccessLevel) => {
    setEntries((prev) => {
      const rest = prev.filter((e) => !(e.role === role && e.module === module));
      return [...rest, { role, module, accessLevel }];
    });
  };

  const handleSave = async () => {
    if (!isBackendApiConfigured()) {
      toast.error('API non configurée');
      return;
    }
    setSaving(true);
    try {
      const matrix = ROLES.flatMap((role) =>
        MODULES.map((mod) => ({
          role: role.id,
          module: mod.id,
          accessLevel: getLevel(role.id, mod.id),
        }))
      );
      const updated = await updateRoleAccessMatrix(matrix);
      setEntries(updated);
      toast.success('Permissions enregistrées');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className='text-sm text-muted-foreground'>Chargement des permissions…</p>;
  }

  return (
    <section className='space-y-5'>
      <p className='text-sm text-muted-foreground'>
        Définissez qui accède à chaque espace : console admin, portail familles et back-office
        finance. Les comptes utilisateurs se créent dans{' '}
        {onOpenUsers ? (
          <button type='button' className='text-primary underline' onClick={onOpenUsers}>
            Utilisateurs
          </button>
        ) : (
          'Utilisateurs'
        )}
        .
      </p>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Matrice des rôles</CardTitle>
          <CardDescription>
            Par défaut : direction (écriture partout), enseignants (portail + finance en lecture),
            personnel (finance en écriture).
          </CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          <table className='w-full min-w-[640px] border-collapse text-xs'>
            <thead>
              <tr className='border-b border-border text-left'>
                <th className='py-2 pr-4 font-medium text-muted-foreground'>Rôle</th>
                {MODULES.map((mod) => (
                  <th key={mod.id} className='px-2 py-2 font-medium'>
                    <div>{mod.label}</div>
                    <div className='font-normal text-[10px] text-muted-foreground'>{mod.hint}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role.id} className='border-b border-border/60'>
                  <td className='py-3 pr-4 font-medium'>{role.label}</td>
                  {MODULES.map((mod) => (
                    <td key={mod.id} className='px-2 py-2'>
                      <Select
                        value={getLevel(role.id, mod.id)}
                        onValueChange={(v) => setLevel(role.id, mod.id, v as AccessLevel)}
                      >
                        <SelectTrigger className='h-8 text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVELS.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className='mt-4 flex flex-wrap gap-2'>
            <Button type='button' size='sm' onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer les permissions'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
