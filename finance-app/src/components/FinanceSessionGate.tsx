import { Navigate } from 'react-router-dom';
import { getStoredRole, getStoredUser } from '@/lib/auth';
import { isFinanceAppRole } from '@/lib/finance-role';

export function FinanceSessionGate({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  const role = getStoredRole();

  if (!user || !isFinanceAppRole(role)) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}
