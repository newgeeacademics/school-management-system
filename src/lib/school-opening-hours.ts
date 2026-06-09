export const OPENING_ORGANIZATION_IDS = [
  'morning_only',
  'morning_afternoon',
  'full_day',
  'evening',
] as const;

export type OpeningOrganizationId = (typeof OPENING_ORGANIZATION_IDS)[number];

export const OPENING_WEEKDAY_IDS = ['mon_fri', 'mon_sat'] as const;

export type OpeningWeekdaysId = (typeof OPENING_WEEKDAY_IDS)[number];

export type OpeningHoursDraft = {
  organization: OpeningOrganizationId | '';
  startTime: string;
  endTime: string;
  lunchEnabled: boolean;
  lunchStart: string;
  lunchEnd: string;
  weekdays: OpeningWeekdaysId | '';
};

export const DEFAULT_OPENING_HOURS: OpeningHoursDraft = {
  organization: '',
  startTime: '08:00',
  endTime: '17:00',
  lunchEnabled: true,
  lunchStart: '12:00',
  lunchEnd: '14:00',
  weekdays: 'mon_fri',
};

export function organizationLabelKey(id: OpeningOrganizationId): string {
  return `school.openingOrg_${id}`;
}

export function weekdaysLabelKey(id: OpeningWeekdaysId): string {
  return `school.openingDays_${id}`;
}

export function buildTimeOptions(): string[] {
  const slots: string[] = [];
  for (let h = 6; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m > 0) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

type LabelResolver = (key: string) => string;

export function formatOpeningHours(draft: OpeningHoursDraft, t: LabelResolver): string {
  if (!draft.organization || !draft.weekdays) return '';

  const parts = [
    t(organizationLabelKey(draft.organization)),
    `${draft.startTime}–${draft.endTime}`,
    t(weekdaysLabelKey(draft.weekdays)),
  ];

  if (draft.lunchEnabled && draft.lunchStart && draft.lunchEnd) {
    parts.push(`${t('school.openingLunchBreak')} ${draft.lunchStart}–${draft.lunchEnd}`);
  }

  return parts.join(' · ');
}

export function isOpeningHoursComplete(draft: OpeningHoursDraft): boolean {
  if (!draft.organization || !draft.startTime || !draft.endTime || !draft.weekdays) {
    return false;
  }
  if (draft.startTime >= draft.endTime) return false;
  if (draft.lunchEnabled) {
    if (!draft.lunchStart || !draft.lunchEnd) return false;
    if (draft.lunchStart >= draft.lunchEnd) return false;
  }
  return true;
}
