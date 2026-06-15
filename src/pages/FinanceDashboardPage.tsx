import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  UserCircle2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { AppLogo } from '@/components/AppLogo';
import { FinanceOverviewPanel } from '@/components/finance/FinanceOverviewPanel';
import { PayrollPanel } from '@/components/finance/PayrollPanel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { clearAuthSession, getStoredUser } from '@/lib/auth';
import {
  createPayroll,
  deletePayroll,
  fetchFinanceOverview,
  fetchMyRoleAccess,
  fetchPayroll,
  fetchTeachers,
  markPayrollPaid,
} from '@/lib/finance-api';
import { canWriteFinance } from '@/lib/finance-role';
import { getStoredRole } from '@/lib/auth';
import type { FinanceOverview, FinanceSectionId, PayrollPayment, TeacherOption } from '@/types/finance';
import { cn } from '@/lib/utils';

const NAV: { id: FinanceSectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'teachers', label: 'Paie enseignants', icon: UserCircle2 },
  { id: 'staff', label: 'Paie personnel', icon: Users },
];

export function FinanceDashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [section, setSection] = React.useState<FinanceSectionId>('overview');
  const [overview, setOverview] = React.useState<FinanceOverview | null>(null);
  const [teacherPayroll, setTeacherPayroll] = React.useState<PayrollPayment[]>([]);
  const [staffPayroll, setStaffPayroll] = React.useState<PayrollPayment[]>([]);
  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [canWrite, setCanWrite] = React.useState(false);
  const role = getStoredRole();

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ov, teachersPay, staffPay, teacherList, access] = await Promise.all([
        fetchFinanceOverview(),
        fetchPayroll('TEACHER'),
        fetchPayroll('STAFF'),
        fetchTeachers(),
        fetchMyRoleAccess(),
      ]);
      setCanWrite(canWriteFinance(access));
      setOverview(ov);
      setTeacherPayroll(teachersPay);
      setStaffPayroll(staffPay);
      setTeachers(teacherList);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const logout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const handleCreate = async (data: Parameters<typeof createPayroll>[0]) => {
    try {
      await createPayroll(data);
      toast.success('Paiement enregistré');
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPayrollPaid(id);
      toast.success('Paiement marqué comme effectué');
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePayroll(id);
      toast.success('Ligne supprimée');
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const sectionTitle =
    section === 'overview'
      ? 'Trésorerie & résultat'
      : section === 'teachers'
        ? 'Rémunération des enseignants'
        : 'Rémunération du personnel';

  return (
    <div className='flex min-h-svh bg-violet-50/40'>
      <aside className='flex w-64 shrink-0 flex-col border-r border-violet-900/30 bg-[#2e1065] text-violet-100'>
        <div className='flex items-center gap-2 border-b border-violet-800/60 px-4 py-4'>
          <AppLogo markClassName='app-logo__mark--compact' name='NewGee Finance' />
          <div>
            <p className='text-[10px] text-violet-300'>Back-office trésorerie</p>
          </div>
        </div>
        <nav className='flex-1 space-y-1 p-3'>
          {NAV.map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => setSection(item.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                section === item.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-violet-200 hover:bg-violet-900/60 hover:text-white'
              )}
            >
              <item.icon className='size-4 shrink-0' />
              {item.label}
            </button>
          ))}
        </nav>
        <div className='border-t border-violet-800/60 p-3'>
          <p className='truncate px-1 text-xs text-violet-300'>{user?.name}</p>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='mt-2 w-full justify-start gap-2 text-violet-200 hover:bg-violet-900/60 hover:text-white'
            onClick={logout}
          >
            <LogOut className='size-4' />
            Déconnexion
          </Button>
        </div>
      </aside>

      <main className='flex min-w-0 flex-1 flex-col'>
        <header className='border-b border-violet-100 bg-white px-6 py-4'>
          <h1 className='text-xl font-semibold text-foreground'>{sectionTitle}</h1>
          <p className='text-sm text-muted-foreground'>
            Gestion des recettes, charges salariales et suivi de la rentabilité.
            {role === 'teacher' && !canWrite && ' · Mode consultation'}
            {role === 'staff' && ' · Personnel autorisé à saisir les paiements'}
          </p>
        </header>
        <div className='flex-1 overflow-auto p-6'>
          {section === 'overview' && <FinanceOverviewPanel overview={overview} loading={loading} />}
          {section === 'teachers' && (
            <PayrollPanel
              employeeType='TEACHER'
              title='enseignants'
              description='Salaires, primes et vacations des enseignants. Sélectionnez un professeur ou saisissez un nom.'
              payments={teacherPayroll}
              teachers={teachers}
              onCreate={handleCreate}
              onMarkPaid={handleMarkPaid}
              onDelete={handleDelete}
              readOnly={!canWrite}
            />
          )}
          {section === 'staff' && (
            <PayrollPanel
              employeeType='STAFF'
              title='personnel'
              description='Salaires du personnel administratif, secrétariat, maintenance et autres agents.'
              payments={staffPayroll}
              onCreate={handleCreate}
              onMarkPaid={handleMarkPaid}
              onDelete={handleDelete}
              readOnly={!canWrite}
            />
          )}
        </div>
        <Separator />
        <footer className='px-6 py-2 text-[10px] text-muted-foreground'>
          Les recettes proviennent des reçus de frais scolaires enregistrés dans la console admin.
        </footer>
      </main>
    </div>
  );
}
