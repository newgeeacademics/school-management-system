import type { PortalScheduleItem } from '@/hooks/usePortalFeed';

export const DAY_OPTIONS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

export function timeSortKey(time: string): number {
  const hhmm = time.match(/(\d{1,2})[:h](\d{2})/);
  if (hhmm) {
    return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  }
  return 0;
}

export function collectScheduleTimeRows(schedule: PortalScheduleItem[]): string[] {
  const fromData = [...new Set(schedule.map((s) => s.time).filter(Boolean))];
  return [...fromData].sort((a, b) => timeSortKey(a) - timeSortKey(b));
}

export function collectScheduleDays(schedule: PortalScheduleItem[]): string[] {
  const present = new Set(schedule.map((s) => s.day).filter(Boolean));
  return DAY_OPTIONS.filter((day) => present.has(day));
}
