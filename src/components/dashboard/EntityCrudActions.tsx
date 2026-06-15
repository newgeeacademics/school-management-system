import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

type EntityCrudActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editing?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
};

export function EntityCrudActions({
  onEdit,
  onDelete,
  editing = false,
  onCancel,
  onSave,
  saveLabel = 'Enregistrer',
}: EntityCrudActionsProps) {
  if (editing) {
    return (
      <div className='mt-2 flex flex-wrap gap-1'>
        <Button type='button' size='sm' onClick={onSave}>
          {saveLabel}
        </Button>
        <Button type='button' size='sm' variant='outline' onClick={onCancel}>
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <div className='mt-2 flex flex-wrap gap-1'>
      <Button type='button' size='sm' variant='outline' className='h-7 gap-1 px-2 text-[11px]' onClick={onEdit}>
        <Pencil className='h-3 w-3' />
        Modifier
      </Button>
      <Button
        type='button'
        size='sm'
        variant='ghost'
        className='h-7 gap-1 px-2 text-[11px] text-destructive hover:text-destructive'
        onClick={onDelete}
      >
        <Trash2 className='h-3 w-3' />
        Supprimer
      </Button>
    </div>
  );
}
