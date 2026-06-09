import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import type { StudentIdCardData } from './dashboardTypes';

type StudentIdCardModalProps = {
  open: boolean;
  onClose: () => void;
  card: StudentIdCardData | null;
  loading?: boolean;
};

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  open,
  onClose,
  card,
  loading = false,
}) => {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Carte scolaire</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 24px; }
        .card { border: 2px solid #0d9488; border-radius: 12px; padding: 20px; max-width: 320px; }
        .school { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .name { font-size: 20px; font-weight: 700; margin: 8px 0 4px; }
        .meta { font-size: 13px; color: #475569; margin-bottom: 12px; }
        .matricule { font-family: monospace; font-size: 14px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .qr { margin-top: 16px; text-align: center; }
      </style></head><body>
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
          <SheetTitle>Carte scolaire</SheetTitle>
          <SheetDescription>
            Matricule et QR code d&apos;identification de l&apos;élève.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>Génération…</p>
        ) : card ? (
          <div ref={printRef} className='px-4'>
            <div className='card rounded-xl border-2 border-teal-600 p-5'>
              <p className='school text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                {card.schoolName || 'Établissement'}
              </p>
              <p className='name text-xl font-bold text-foreground'>{card.studentName}</p>
              <p className='meta text-sm text-muted-foreground'>
                {card.className ? `Classe : ${card.className}` : 'Classe non renseignée'}
              </p>
              <p className='matricule font-mono text-sm'>
                Matricule : <strong>{card.matricule}</strong>
              </p>
              <div className='qr mt-4 flex justify-center'>
                <QRCodeSVG value={card.qrPayload} size={140} level='M' includeMargin />
              </div>
            </div>
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
