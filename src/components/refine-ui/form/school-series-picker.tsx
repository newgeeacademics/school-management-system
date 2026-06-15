import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getSeriesOptionsForSystem } from '@/lib/school-series';

type SchoolSeriesPickerProps = {
  system: string;
  schoolType: string;
  value: string[];
  onChange: (next: string[]) => void;
};

export function SchoolSeriesPicker({ system, schoolType, value, onChange }: SchoolSeriesPickerProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const options = useMemo(() => getSeriesOptionsForSystem(system), [system]);
  const available = useMemo(() => options.filter((opt) => !value.includes(opt)), [options, value]);

  const addSeries = () => {
    if (!draft || value.includes(draft)) return;
    onChange([...value, draft]);
    setDraft('');
  };

  const addAllSeries = () => {
    if (available.length === 0) return;
    onChange([...options]);
    setDraft('');
  };

  const removeSeries = (item: string) => {
    onChange(value.filter((s) => s !== item));
  };

  if (schoolType !== 'lycee') {
    return (
      <div className='school-register__field'>
        <span>{t('school.series')}</span>
        <p className='school-register__hint school-register__hint--inline'>{t('school.seriesLyceeOnly')}</p>
      </div>
    );
  }

  if (!system) {
    return (
      <div className='school-register__field'>
        <span>{t('school.series')}</span>
        <p className='school-register__hint school-register__hint--inline'>{t('school.seriesSelectSystem')}</p>
      </div>
    );
  }

  return (
    <div className='school-register__field school-register__series'>
      <span>{t('school.series')}</span>
      <p className='school-register__hint school-register__hint--inline'>{t('school.seriesHint')}</p>

      <div className='school-register__series-add'>
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={available.length === 0}
          aria-label={t('school.seriesChoose')}
        >
          <option value=''>{t('school.seriesChoose')}</option>
          {available.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type='button'
          className='school-register__series-add-btn'
          onClick={addSeries}
          disabled={!draft}
        >
          <Plus className='size-4' aria-hidden />
          {t('school.seriesAdd')}
        </button>
        <button
          type='button'
          className='school-register__series-add-btn school-register__series-add-btn--secondary'
          onClick={addAllSeries}
          disabled={available.length === 0}
        >
          {t('school.seriesAddAll')}
        </button>
      </div>

      {value.length > 0 ? (
        <ul className='school-register__series-list'>
          {value.map((item) => (
            <li key={item} className='school-register__series-chip'>
              <span>{item}</span>
              <button
                type='button'
                className='school-register__series-remove'
                onClick={() => removeSeries(item)}
                aria-label={t('school.seriesRemove', { name: item })}
              >
                <X className='size-3.5' aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className='school-register__hint school-register__hint--inline'>{t('school.seriesEmpty')}</p>
      )}
    </div>
  );
}
