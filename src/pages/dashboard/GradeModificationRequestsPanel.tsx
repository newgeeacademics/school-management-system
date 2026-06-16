import React from 'react';
import { Check, Clock, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { GradeModificationRequest } from './dashboardTypes';

type GradeModificationRequestsPanelProps = {
  requests: GradeModificationRequest[];
  isAdmin: boolean;
  onApprove: (id: string, adminNote?: string) => void | Promise<void>;
  onReject: (id: string, adminNote?: string) => void | Promise<void>;
};

export const GradeModificationRequestsPanel: React.FC<GradeModificationRequestsPanelProps> = ({
  requests,
  isAdmin,
  onApprove,
  onReject,
}) => {
  const pending = requests.filter((r) => r.status === 'PENDING');
  const recent = requests.filter((r) => r.status !== 'PENDING').slice(0, 5);

  if (!isAdmin && pending.length === 0 && recent.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <Clock className='size-4' />
          {isAdmin ? 'Demandes de modification de notes' : 'Mes demandes de modification'}
        </CardTitle>
        <CardDescription className='text-xs'>
          {isAdmin
            ? 'Les enseignants doivent obtenir votre autorisation avant de modifier une note déjà enregistrée.'
            : 'Pour changer une note existante, envoyez une demande à l\'administration.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 text-xs'>
        {pending.length === 0 ? (
          <p className='text-muted-foreground'>
            {isAdmin ? 'Aucune demande en attente.' : 'Aucune demande en cours.'}
          </p>
        ) : (
          <ul className='space-y-3'>
            {pending.map((req) => (
              <PendingRequestRow
                key={req.id}
                request={req}
                isAdmin={isAdmin}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </ul>
        )}

        {!isAdmin && recent.length > 0 && (
          <div className='pt-2 border-t'>
            <p className='text-[11px] font-medium text-muted-foreground mb-2'>Historique récent</p>
            <ul className='space-y-2'>
              {recent.map((req) => (
                <li key={req.id} className='rounded-lg border px-3 py-2'>
                  <p className='font-medium'>
                    {req.studentName} · {req.evaluationLabel}
                  </p>
                  <p className='text-muted-foreground'>
                    {req.currentScore} → {req.requestedScore}
                    {req.maxScore != null ? ` /${req.maxScore}` : ''} ·{' '}
                    <span
                      className={
                        req.status === 'APPROVED' ? 'text-emerald-600' : 'text-red-600'
                      }
                    >
                      {req.status === 'APPROVED' ? 'Approuvée' : 'Refusée'}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function PendingRequestRow({
  request,
  isAdmin,
  onApprove,
  onReject,
}: {
  request: GradeModificationRequest;
  isAdmin: boolean;
  onApprove: (id: string, adminNote?: string) => void | Promise<void>;
  onReject: (id: string, adminNote?: string) => void | Promise<void>;
}) {
  const [adminNote, setAdminNote] = React.useState('');

  return (
    <li className='rounded-lg border px-3 py-3 space-y-2'>
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div>
          <p className='font-medium text-foreground'>
            {request.studentName}
            {request.className ? ` · ${request.className}` : ''}
          </p>
          <p className='text-muted-foreground'>
            {request.evaluationLabel}
            {request.courseName ? ` (${request.courseName})` : ''}
          </p>
          <p className='mt-1'>
            Note actuelle : <strong>{request.currentScore}</strong>
            {request.maxScore != null ? `/${request.maxScore}` : ''} → demandée :{' '}
            <strong>{request.requestedScore}</strong>
          </p>
          <p className='mt-1 text-muted-foreground italic'>&laquo; {request.reason} &raquo;</p>
          <p className='text-[10px] text-muted-foreground mt-1'>
            Par {request.teacherName}
            {request.createdAt ? ` · ${new Date(request.createdAt).toLocaleString('fr-FR')}` : ''}
          </p>
        </div>
        {isAdmin && (
          <div className='flex flex-col gap-2 min-w-[200px]'>
            <div className='grid gap-1'>
              <Label htmlFor={`admin-note-${request.id}`} className='text-[10px]'>
                Commentaire admin (optionnel)
              </Label>
              <Input
                id={`admin-note-${request.id}`}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder='Motif de décision…'
                className='h-8 text-[11px]'
              />
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                size='sm'
                className='h-8 gap-1'
                onClick={() => void onApprove(request.id, adminNote)}
              >
                <Check className='size-3.5' />
                Approuver
              </Button>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='h-8 gap-1 text-destructive hover:text-destructive'
                onClick={() => void onReject(request.id, adminNote)}
              >
                <X className='size-3.5' />
                Refuser
              </Button>
            </div>
          </div>
        )}
        {!isAdmin && (
          <span className='rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-800'>
            En attente
          </span>
        )}
      </div>
    </li>
  );
}
