import type { ScheduleItem } from '@/pages/dashboard/dashboardTypes';

/** "08:00" → "8h00" */
export function formatFrenchTime(hhmm: string): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':');
  const hour = parseInt(h ?? '0', 10);
  const minute = (m ?? '00').padStart(2, '0');
  return `${hour}h${minute}`;
}


export function formatTimeRange(start: string, end: string): string {
  if (!start || !end) return '';
  return `${formatFrenchTime(start)} – ${formatFrenchTime(end)}`;
}


export function timeSortKey(time: string): number {
  const hhmm = time.match(/(\d{1,2})[:h](\d{2})/);
  if (hhmm) {
    return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  }
  return 0;
}

/** Unique sorted time rows from schedule data (falls back to presets). */
export function collectScheduleTimeRows(
  schedule: ScheduleItem[],
  fallbackPresets: string[]
): string[] {
  const fromData = [...new Set(schedule.map((s) => s.time).filter(Boolean))];
  const merged = fromData.length > 0 ? fromData : fallbackPresets;
  return [...merged].sort((a, b) => timeSortKey(a) - timeSortKey(b));
}
