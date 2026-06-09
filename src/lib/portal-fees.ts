import { apiFetch } from '@/lib/api';

export type PortalFeeCategory = 'SCOLARITE' | 'CANTINE' | 'TRANSPORT';

export type PortalFeeInstallment = {
  id: string;
  category: PortalFeeCategory;
  academicYear: string;
  label: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  description?: string;
  sortOrder: number;
};

const CATEGORY_LABELS: Record<PortalFeeCategory, string> = {
  SCOLARITE: 'Scolarité',
  CANTINE: 'Cantine',
  TRANSPORT: 'Transport',
};

export function portalFeeCategoryLabel(category: PortalFeeCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export async function fetchPortalFees(academicYear?: string): Promise<PortalFeeInstallment[]> {
  const query = academicYear ? `?academicYear=${encodeURIComponent(academicYear)}` : '';
  return apiFetch<PortalFeeInstallment[]>(`/api/portal/fees${query}`);
}
