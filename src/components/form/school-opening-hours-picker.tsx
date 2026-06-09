import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import {
  buildTimeOptions,
  DEFAULT_OPENING_HOURS,
  formatOpeningHours,
  OPENING_ORGANIZATION_IDS,
  OPENING_WEEKDAY_IDS,
  organizationLabelKey,
  weekdaysLabelKey,
  type OpeningHoursDraft,
} from '@/lib/school-opening-hours';

type SchoolOpeningHoursPickerProps = {
  value: string;
  onChange: (formatted: string) => void;
};

export function SchoolOpeningHoursPicker({ value, onChange }: SchoolOpeningHoursPickerProps) {
  const { t } = useTranslation();
  const timeOptions = useMemo(() => buildTimeOptions(), []);
  const [draft, setDraft] = useState<OpeningHoursDraft>(DEFAULT_OPENING_HOURS);

  const applyDraft = useCallback(
    (next: OpeningHoursDraft) => {
      setDraft(next);
      onChange(formatOpeningHours(next, t));
    },
    [onChange, t]
  );

  const update = <K extends keyof OpeningHoursDraft>(key: K, next: OpeningHoursDraft[K]) => {
    applyDraft({ ...draft, [key]: next });
  };

  const preview = value || formatOpeningHours(draft, t);

  return (
    <div className='school-register__field school-register__opening-hours'>
      <span>{t('school.openingHours')}</span>
      <p className='school-register__hint school-register__hint--inline'>{t('school.openingHoursHint')}</p>

      <div className='school-register__opening-grid'>
        <label className='school-register__opening-item'>
          <span>{t('school.openingOrganization')}</span>
          <select
            value={draft.organization}
            onChange={(e) => update('organization', e.target.value as OpeningHoursDraft['organization'])}
          >
            <option value=''>{t('school.openingChoose')}</option>
            {OPENING_ORGANIZATION_IDS.map((id) => (
              <option key={id} value={id}>
                {t(organizationLabelKey(id))}
              </option>
            ))}
          </select>
        </label>

        <label className='school-register__opening-item'>
          <span>{t('school.openingWeekdays')}</span>
          <select
            value={draft.weekdays}
            onChange={(e) => update('weekdays', e.target.value as OpeningHoursDraft['weekdays'])}
          >
            <option value=''>{t('school.openingChoose')}</option>
            {OPENING_WEEKDAY_IDS.map((id) => (
              <option key={id} value={id}>
                {t(weekdaysLabelKey(id))}
              </option>
            ))}
          </select>
        </label>

        <label className='school-register__opening-item'>
          <span>{t('school.openingStart')}</span>
          <select value={draft.startTime} onChange={(e) => update('startTime', e.target.value)}>
            {timeOptions.map((slot) => (
              <option key={`start-${slot}`} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>

        <label className='school-register__opening-item'>
          <span>{t('school.openingEnd')}</span>
          <select value={draft.endTime} onChange={(e) => update('endTime', e.target.value)}>
            {timeOptions.map((slot) => (
              <option key={`end-${slot}`} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className='school-register__opening-lunch'>
        <input
          type='checkbox'
          checked={draft.lunchEnabled}
          onChange={(e) => update('lunchEnabled', e.target.checked)}
        />
        <span>{t('school.openingLunchEnabled')}</span>
      </label>

      {draft.lunchEnabled ? (
        <div className='school-register__opening-grid school-register__opening-grid--lunch'>
          <label className='school-register__opening-item'>
            <span>{t('school.openingLunchStart')}</span>
            <select value={draft.lunchStart} onChange={(e) => update('lunchStart', e.target.value)}>
              {timeOptions.map((slot) => (
                <option key={`lunch-start-${slot}`} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className='school-register__opening-item'>
            <span>{t('school.openingLunchEnd')}</span>
            <select value={draft.lunchEnd} onChange={(e) => update('lunchEnd', e.target.value)}>
              {timeOptions.map((slot) => (
                <option key={`lunch-end-${slot}`} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {preview ? (
        <p className='school-register__opening-preview'>{preview}</p>
      ) : (
        <p className='school-register__hint school-register__hint--inline'>{t('school.openingHoursEmpty')}</p>
      )}
    </div>
  );
}
