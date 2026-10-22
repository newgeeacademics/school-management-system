import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import type { TeacherIdCardData } from './dashboardTypes';

type TeacherIdCardModalProps = {
  open: boolean;
  onClose: () => void;
  card: TeacherIdCardData | null;
  loading?: boolean;
};

const CARD_PRINT_STYLES = `
  body { font-family: system-ui, sans-serif; margin: 24px; display: flex; justify-content: center; }
  .id-card { border: 1px solid #e7e5e4; border-radius: 14px; overflow: hidden; max-width: 340px; width: 100%; background: #ffffff; }
  .id-card-header { background: #0f766e; color: #f0fdfa; padding: 12px 16px; }
  .id-card-school { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .id-card-city { font-size: 10px; opacity: 0.9; margin-top: 2px; }
  .id-card-body { display: flex; gap: 12px; padding: 14px 16px; align-items: flex-start; }
  .id-card-photo { width: 72px; height: 88px; border: 2px dashed #d6d3d1; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f5f0e8; flex-shrink: 0; }
  .id-card-name { font-size: 17px; font-weight: 700; line-height: 1.2; color: #1c1917; }
  .id-card-meta { font-size: 11px; color: #57534e; margin-top: 4px; }
  .id-card-number { font-family: monospace; font-size: 12px; background: #f5f0e8; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 6px; }
  .id-card-qr { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 16px 14px; border-top: 1px solid #e7e5e4; }
  .id-card-qr svg { display: block; margin: 0 auto; }
  .id-card-year { font-size: 10px; color: #57534e; text-align: center; padding-bottom: 10px; }
`;

function TeacherIdCardVisual({ card }: { card: TeacherIdCardData }) {
  const displayName =
    [card.firstName, card.lastName].filter(Boolean).join(' ').trim() || card.teacherName;

  return (
    <div className='id-card mx-auto w-full max-w-[340px] overflow-hidden rounded-xl border border-[#e7e5e4] bg-white shadow-sm'>
      <div className='id-card-header bg-[#0f766e] px-4 py-3 text-[#f0fdfa]'>
        <p className='id-card-school text-xs font-bold uppercase tracking-wide'>
          {card.schoolName || 'Établissement'}
        </p>
        {card.schoolCity ? (
          <p className='id-card-city text-[10px] opacity-90'>{card.schoolCity}</p>
        ) : null}
        <p className='mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80'>
          Carte enseignant
        </p>
      </div>

      <div className='id-card-body flex gap-3 px-4 py-3'>
        <div
          className='id-card-photo flex size-[72px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#d6d3d1] bg-[#f5f0e8]'
          aria-hidden
        >
          <User className='size-8 text-muted-foreground/50' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='id-card-name text-base font-bold leading-tight text-foreground'>{displayName}</p>
          <p className='id-card-meta text-[11px] text-muted-foreground'>
            {card.subject ? `Matière : ${card.subject}` : 'Matière non renseignée'}
          </p>
          {card.staffId ? (
            <p className='id-card-number mt-1.5 font-mono text-[11px] text-foreground'>
              N° personnel : <strong>{card.staffId}</strong>
            </p>
          ) : null}
        </div>
      </div>

      <div className='id-card-qr flex flex-col items-center justify-center border-t border-border px-4 py-3'>
        <QRCodeSVG
          value={card.qrPayload}
          size={120}
          level='M'
          includeMargin
          className='mx-auto block'
        />
      </div>

      {card.academicYear ? (
        <p className='id-card-year pb-3 text-center text-[10px] text-muted-foreground'>
          Année scolaire {card.academicYear}
        </p>
      ) : null}
    </div>
  );
}

export const TeacherIdCardModal: React.FC<TeacherIdCardModalProps> = ({
  open,
  onClose,
  card,
  loading = false,
}) => {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank', 'width=420,height=640');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Carte enseignant</title>
      <style>${CARD_PRINT_STYLES}</style></head><body>
      ${printRef.current.innerHTML}
      <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side='right' className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Carte enseignant</SheetTitle>
          <SheetDescription>
            Carte d&apos;identification personnelle avec QR code.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>Génération…</p>
        ) : card ? (
          <div ref={printRef} className='flex justify-center px-4'>
            <TeacherIdCardVisual card={card} />
          </div>
        ) : (
          <p className='px-4 py-8 text-center text-sm text-muted-foreground'>
            Impossible de charger la carte.
          </p>
        )}

        <SheetFooter>
          <Button variant='outline' onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={handlePrint} disabled={!card || loading}>
            Imprimer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
