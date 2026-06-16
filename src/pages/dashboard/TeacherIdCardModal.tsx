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
  body { font-family: system-ui, sans-serif; margin: 24px; }
  .id-card { border: 2px solid #1d4ed8; border-radius: 14px; overflow: hidden; max-width: 340px; background: #fff; }
  .id-card-header { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; padding: 12px 16px; }
  .id-card-school { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .id-card-city { font-size: 10px; opacity: 0.9; margin-top: 2px; }
  .id-card-body { display: flex; gap: 12px; padding: 14px 16px; align-items: flex-start; }
  .id-card-photo { width: 72px; height: 88px; border: 2px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f8fafc; flex-shrink: 0; }
  .id-card-name { font-size: 17px; font-weight: 700; line-height: 1.2; }
  .id-card-meta { font-size: 11px; color: #475569; margin-top: 4px; }
  .id-card-number { font-family: monospace; font-size: 12px; background: #eff6ff; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 6px; }
  .id-card-qr { text-align: center; padding: 10px 16px 14px; border-top: 1px solid #e2e8f0; }
  .id-card-year { font-size: 10px; color: #64748b; text-align: center; padding-bottom: 10px; }
`;

function TeacherIdCardVisual({ card }: { card: TeacherIdCardData }) {
  const displayName =
    [card.firstName, card.lastName].filter(Boolean).join(' ').trim() || card.teacherName;

  return (
    <div className='id-card overflow-hidden rounded-xl border-2 border-blue-700 bg-card shadow-sm'>
      <div className='id-card-header bg-gradient-to-br from-blue-700 to-blue-900 px-4 py-3 text-white'>
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
          className='id-card-photo flex size-[72px] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-muted/40'
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

      <div className='id-card-qr border-t border-border px-4 py-3 text-center'>
        <QRCodeSVG value={card.qrPayload} size={120} level='M' includeMargin />
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
          <div ref={printRef} className='px-4'>
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
