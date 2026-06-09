import { ACCESS_TOKEN_KEY, BASE_URL } from '@/constants';
import { parseApiErrorResponse, wrapFetchError } from '@/lib/api-error';
import type { FinanceOverview, PayrollEmployeeType, PayrollPayment, TeacherOption } from '@/types/finance';

export function isBackendApiConfigured(): boolean {
  if (import.meta.env.DEV) return true;
  return Boolean(import.meta.env.VITE_API_URL?.trim());
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function financeApiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if (!res.ok) {
      throw new Error(await parseApiErrorResponse(res, `Erreur API ${res.status}`));
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (err) {
    throw wrapFetchError(err, 'Erreur de communication avec le serveur');
  }
}

export type AuthLoginResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
};

export async function loginAdmin(email: string, password: string) {
  return financeApiFetch<AuthLoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export async function fetchFinanceOverview(): Promise<FinanceOverview> {
  return financeApiFetch<FinanceOverview>('/api/finance/overview');
}

export async function fetchPayroll(type?: PayrollEmployeeType): Promise<PayrollPayment[]> {
  const query = type ? `?type=${type}` : '';
  return financeApiFetch<PayrollPayment[]>(`/api/finance/payroll${query}`);
}

export async function createPayroll(item: {
  employeeType: PayrollEmployeeType;
  employeeId?: string;
  employeeName: string;
  amount: number;
  periodLabel: string;
  paymentDate: string;
  status?: PayrollPayment['status'];
  notes?: string;
}) {
  return financeApiFetch<PayrollPayment>('/api/finance/payroll', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

export async function updatePayroll(
  id: string,
  item: {
    employeeType: PayrollEmployeeType;
    employeeId?: string;
    employeeName: string;
    amount: number;
    periodLabel: string;
    paymentDate: string;
    status?: PayrollPayment['status'];
    notes?: string;
  }
) {
  return financeApiFetch<PayrollPayment>(`/api/finance/payroll/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

export async function markPayrollPaid(id: string) {
  return financeApiFetch<PayrollPayment>(`/api/finance/payroll/${id}/mark-paid`, {
    method: 'POST',
  });
}

export async function deletePayroll(id: string) {
  await financeApiFetch(`/api/finance/payroll/${id}`, { method: 'DELETE' });
}

export async function fetchMyRoleAccess() {
  return financeApiFetch<{
    role: string;
    modules: Record<string, 'NONE' | 'READ' | 'WRITE'>;
  }>('/api/role-access/my');
}

export async function fetchTeachers(): Promise<TeacherOption[]> {
  const rows = await financeApiFetch<Record<string, unknown>[]>('/api/teachers');
  return rows.map((t) => ({
    id: String(t.id),
    name: String(t.name ?? ''),
  }));
}
