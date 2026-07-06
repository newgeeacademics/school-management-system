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

/** Current school year label (e.g. 2025-2026), aligned with the French academic calendar. */
export function currentAcademicYear(reference = new Date()): string {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export async function fetchPortalFees(academicYear?: string): Promise<PortalFeeInstallment[]> {
  const year = academicYear ?? currentAcademicYear();
  const data = await apiFetch<PortalFeeInstallment[]>(
    `/api/portal/fees?academicYear=${encodeURIComponent(year)}`,
  );
  if (data.length > 0) {
    return data;
  }
  return apiFetch<PortalFeeInstallment[]>('/api/portal/fees');
}
