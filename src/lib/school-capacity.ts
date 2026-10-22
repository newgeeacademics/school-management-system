import type { ClassItem } from '@/pages/dashboard/dashboardTypes';

export type CapacityCheck = {
  licensed: number | null;
  currentPlanned: number;
  projectedPlanned: number;
  overBy: number;
  isOver: boolean;
  remaining: number | null;
};

export function sumClassPlannedEnrollment(classes: Pick<ClassItem, 'studentsCount'>[]): number {
  return classes.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
}

export function checkPlannedCapacity(
  licensed: number | null | undefined,
  classes: Pick<ClassItem, 'id' | 'studentsCount'>[],
  newClassCount: number,
  excludeClassId?: string,
): CapacityCheck {
  const cap = licensed != null && licensed > 0 ? licensed : null;
  const currentPlanned = classes
    .filter((c) => !excludeClassId || c.id !== excludeClassId)
    .reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  const safeCount = Math.max(0, Number(newClassCount) || 0);
  const projectedPlanned = currentPlanned + safeCount;
  const overBy = cap != null ? Math.max(0, projectedPlanned - cap) : 0;

  return {
    licensed: cap,
    currentPlanned,
    projectedPlanned,
    overBy,
    isOver: overBy > 0,
    remaining: cap != null ? Math.max(0, cap - projectedPlanned) : null,
  };
}

export function checkEnrolledCapacity(
  licensed: number | null | undefined,
  enrolledCount: number,
): { licensed: number | null; isOver: boolean; remaining: number | null } {
  const cap = licensed != null && licensed > 0 ? licensed : null;
  const enrolled = Math.max(0, enrolledCount);
  return {
    licensed: cap,
    isOver: cap != null && enrolled >= cap,
    remaining: cap != null ? Math.max(0, cap - enrolled) : null,
  };
}

export function capacityOverMessage(check: CapacityCheck): string {
  if (!check.isOver || check.licensed == null) return '';
  return `Effectif planifié dépassé : ${check.projectedPlanned} élèves prévus pour ${check.licensed} places souscrites (+${check.overBy}). Augmentez votre abonnement dans Facturation.`;
}

export function enrolledOverMessage(licensed: number, enrolled: number): string {
  return `Limite d'élèves atteinte (${enrolled} / ${licensed}). Augmentez votre abonnement dans Facturation pour inscrire d'autres élèves.`;
}
