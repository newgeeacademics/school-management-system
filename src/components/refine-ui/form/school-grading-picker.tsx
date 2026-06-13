import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EVALUATION_TYPE_OPTIONS, GRADING_SCALE_OPTIONS, type EvaluationTypeId } from '@/lib/school-grading-types';

type Props = {
  gradingScale: string;
  evaluationTypes: EvaluationTypeId[];
  onGradingScaleChange: (value: string) => void;
  onEvaluationTypesChange: (value: EvaluationTypeId[]) => void;
};

export function SchoolGradingPicker({
  gradingScale,
  evaluationTypes,
  onGradingScaleChange,
  onEvaluationTypesChange,
}: Props) {
  const addType = (id: EvaluationTypeId) => {
    if (evaluationTypes.includes(id)) return;
    onEvaluationTypesChange([...evaluationTypes, id]);
  };

  const removeType = (id: EvaluationTypeId) => {
    onEvaluationTypesChange(evaluationTypes.filter((t) => t !== id));
  };

  const available = EVALUATION_TYPE_OPTIONS.filter((o) => !evaluationTypes.includes(o.id));

  return (
    <div className='space-y-4'>
      <div className='school-register__field'>
        <Label>Barème de notation</Label>
        <Select value={gradingScale || '20'} onValueChange={onGradingScaleChange}>
          <SelectTrigger>
            <SelectValue placeholder='Choisir le barème' />
          </SelectTrigger>
          <SelectContent>
            {GRADING_SCALE_OPTIONS.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='school-register__field school-register__series'>
        <Label>Types d&apos;évaluation utilisés</Label>
        <p className='text-xs text-muted-foreground mb-2'>
          Les enseignants pourront créer des évaluations avec ces types dans leur espace.
        </p>
        <div className='school-register__series-add'>
          <Select
            value=''
            onValueChange={(v) => addType(v as EvaluationTypeId)}
            disabled={available.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder='Ajouter un type' />
            </SelectTrigger>
            <SelectContent>
              {available.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {evaluationTypes.length > 0 ? (
          <ul className='school-register__series-list'>
            {evaluationTypes.map((id) => {
              const label = EVALUATION_TYPE_OPTIONS.find((o) => o.id === id)?.label ?? id;
              return (
                <li key={id} className='school-register__series-chip'>
                  {label}
                  <button
                    type='button'
                    className='school-register__series-remove'
                    onClick={() => removeType(id)}
                    aria-label={`Retirer ${label}`}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => onEvaluationTypesChange(['Devoir', 'Interro', 'Examen'])}
          >
            Utiliser Devoir, Interro, Examen
          </Button>
        )}
      </div>
    </div>
  );
}
