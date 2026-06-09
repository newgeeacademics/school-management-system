import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslation } from '@/i18n';
import {
  getInstructionLanguageOptions,
  instructionLanguageLabelKey,
  type InstructionLanguageId,
} from '@/lib/school-languages';

type SchoolLanguagesPickerProps = {
  value: InstructionLanguageId[];
  onChange: (next: InstructionLanguageId[]) => void;
};

export function SchoolLanguagesPicker({ value, onChange }: SchoolLanguagesPickerProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<InstructionLanguageId | ''>('');

  const options = useMemo(() => getInstructionLanguageOptions(), []);
  const available = useMemo(() => options.filter((opt) => !value.includes(opt)), [options, value]);

  const addLanguage = () => {
    if (!draft || value.includes(draft)) return;
    onChange([...value, draft]);
    setDraft('');
  };

  const removeLanguage = (id: InstructionLanguageId) => {
    onChange(value.filter((item) => item !== id));
  };

  return (
    <div className='school-register__field school-register__series'>
      <span>{t('school.languagesOffered')}</span>

      <div className='school-register__series-add'>
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value as InstructionLanguageId | '')}
          disabled={available.length === 0}
          aria-label={t('school.languagesChoose')}
        >
          <option value=''>{t('school.languagesChoose')}</option>
          {available.map((id) => (
            <option key={id} value={id}>
              {t(instructionLanguageLabelKey(id))}
            </option>
          ))}
        </select>
        <button
          type='button'
          className='school-register__series-add-btn'
          onClick={addLanguage}
          disabled={!draft}
        >
          <Plus className='size-4' aria-hidden />
          {t('school.languagesAdd')}
        </button>
      </div>

      {value.length > 0 ? (
        <ul className='school-register__series-list'>
          {value.map((id) => (
            <li key={id} className='school-register__series-chip'>
              <span>{t(instructionLanguageLabelKey(id))}</span>
              <button
                type='button'
                className='school-register__series-remove'
                onClick={() => removeLanguage(id)}
                aria-label={t('school.languagesRemove', { name: t(instructionLanguageLabelKey(id)) })}
              >
                <X className='size-3.5' aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className='school-register__hint school-register__hint--inline'>{t('school.languagesEmpty')}</p>
      )}
    </div>
  );
}
