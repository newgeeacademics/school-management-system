import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type {
  NewPaymentReceiptFormState,
  NewPaymentReminderFormState,
  PaymentReceipt,
  PaymentReminder,
  SetStateAction,
} from './dashboardTypes';

type PaymentsSectionProps = {
  totalDue: number;
  amountPaid: number;
  currency?: string;
  isAdmin?: boolean;
  reminders?: PaymentReminder[];
  receipts?: PaymentReceipt[];
  newReminder?: NewPaymentReminderFormState;
  setNewReminder?: SetStateAction<NewPaymentReminderFormState>;
  onCreateReminder?: (e: React.FormEvent) => void;
  newReceipt?: NewPaymentReceiptFormState;
  setNewReceipt?: SetStateAction<NewPaymentReceiptFormState>;
  onCreateReceipt?: (e: React.FormEvent) => void;
};

const formatAmount = (value: number, currency: string) =>
  `${value.toLocaleString('fr-FR')} ${currency}`;

export const PaymentsSection: React.FC<PaymentsSectionProps> = ({
  totalDue,
  amountPaid,
  currency = 'XOF',
  isAdmin = false,
  reminders = [],
  receipts = [],
  newReminder,
  setNewReminder,
  onCreateReminder,
  newReceipt,
  setNewReceipt,
  onCreateReceipt,
}) => {
  const remaining = Math.max(0, totalDue - amountPaid);

  return (
    <section className='space-y-5'>
      <p className='text-sm text-muted-foreground'>
        Résumé de vos frais scolaires pour l&apos;année en cours.
      </p>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total à payer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {formatAmount(totalDue, currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Déjà payé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold text-green-600 dark:text-green-500'>
              {formatAmount(amountPaid, currency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Restant à payer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {formatAmount(remaining, currency)}
            </p>
            {remaining > 0 && (
              <p className='mt-1 text-xs text-muted-foreground'>
                À régler avant la date indiquée par l&apos;établissement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && newReminder && setNewReminder && onCreateReminder && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Envoyer un rappel de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)] items-end text-xs'
              onSubmit={onCreateReminder}
            >
              <div className='grid gap-2'>
                <Label htmlFor='reminder-parent'>Parent</Label>
                <Input
                  id='reminder-parent'
                  value={newReminder.parentName}
                  onChange={(e) =>
                    setNewReminder((r) => ({ ...r, parentName: e.target.value }))
                  }
                  placeholder='Nom du parent'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='reminder-student'>Enfant</Label>
                <Input
                  id='reminder-student'
                  value={newReminder.studentName}
                  onChange={(e) =>
                    setNewReminder((r) => ({ ...r, studentName: e.target.value }))
                  }
                  placeholder={`Nom de l'élève (optionnel)`}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='reminder-amount'>Montant</Label>
                <Input
                  id='reminder-amount'
                  type='number'
                  min='0'
                  value={newReminder.amount}
                  onChange={(e) =>
                    setNewReminder((r) => ({ ...r, amount: e.target.value }))
                  }
                  placeholder='Ex : 50 000'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='reminder-date'>Date limite</Label>
                <Input
                  id='reminder-date'
                  type='date'
                  value={newReminder.dueDate}
                  onChange={(e) =>
                    setNewReminder((r) => ({ ...r, dueDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='md:col-span-4 grid gap-2'>
                <Label htmlFor='reminder-note'>Message (optionnel)</Label>
                <Textarea
                  id='reminder-note'
                  rows={2}
                  value={newReminder.note}
                  onChange={(e) =>
                    setNewReminder((r) => ({ ...r, note: e.target.value }))
                  }
                  placeholder='Informations complémentaires pour le parent (ne sera envoyée que lorsque le système de notification sera connecté).'
                />
              </div>
              <div className='md:col-span-4 flex justify-end'>
                <button
                  type='submit'
                  className='inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90'
                >
                  Enregistrer le rappel (envoi simulé)
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isAdmin && newReceipt && setNewReceipt && onCreateReceipt && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Enregistrer un paiement / générer un reçu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)] items-end text-xs'
              onSubmit={onCreateReceipt}
            >
              <div className='grid gap-2'>
                <Label htmlFor='receipt-parent'>Parent</Label>
                <Input
                  id='receipt-parent'
                  value={newReceipt.parentName}
                  onChange={(e) =>
                    setNewReceipt((r) => ({ ...r, parentName: e.target.value }))
                  }
                  placeholder='Nom du parent'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='receipt-student'>Enfant</Label>
                <Input
                  id='receipt-student'
                  value={newReceipt.studentName}
                  onChange={(e) =>
                    setNewReceipt((r) => ({ ...r, studentName: e.target.value }))
                  }
                  placeholder={`Nom de l'élève (optionnel)`}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='receipt-amount'>Montant payé</Label>
                <Input
                  id='receipt-amount'
                  type='number'
                  min='0'
                  value={newReceipt.amount}
                  onChange={(e) =>
                    setNewReceipt((r) => ({ ...r, amount: e.target.value }))
                  }
                  placeholder='Ex : 50 000'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='receipt-date'>Date du paiement</Label>
                <Input
                  id='receipt-date'
                  type='date'
                  value={newReceipt.date}
                  onChange={(e) =>
                    setNewReceipt((r) => ({ ...r, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='grid gap-2 md:col-span-4'>
                <Label htmlFor='receipt-ref'>Référence (optionnel)</Label>
                <Input
                  id='receipt-ref'
                  value={newReceipt.reference}
                  onChange={(e) =>
                    setNewReceipt((r) => ({ ...r, reference: e.target.value }))
                  }
                  placeholder='Ex : RECU-2025-0001'
                />
              </div>
              <div className='md:col-span-4 flex justify-end'>
                <button
                  type='submit'
                  className='inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90'
                >
                  Enregistrer le paiement (reçu simulé)
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>
                Rappels enregistrés
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-xs'>
              {reminders.length === 0 ? (
                <p className='text-muted-foreground'>
                  Aucun rappel de paiement pour le moment.
                </p>
              ) : (
                <div className='space-y-2'>
                  {reminders.map((r) => (
                    <div
                      key={r.id}
                      className='rounded-md border border-border/70 px-3 py-2'
                    >
                      <p className='text-sm font-medium text-foreground'>
                        {r.parentName}
                        {r.studentName ? ` – ${r.studentName}` : ''}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>
                        Montant : {formatAmount(r.amount, currency)} • Échéance :{' '}
                        {r.dueDate || 'Non définie'}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>
                        Statut : {r.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>
                Reçus enregistrés
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-xs'>
              {receipts.length === 0 ? (
                <p className='text-muted-foreground'>
                  Aucun reçu enregistré pour le moment.
                </p>
              ) : (
                <div className='space-y-2'>
                  {receipts.map((r) => (
                    <div
                      key={r.id}
                      className='rounded-md border border-border/70 px-3 py-2'
                    >
                      <p className='text-sm font-medium text-foreground'>
                        Reçu pour {r.parentName}
                        {r.studentName ? ` – ${r.studentName}` : ''}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>
                        Montant : {formatAmount(r.amount, currency)} • Date :{' '}
                        {r.date || 'Non définie'}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>
                        Référence : {r.reference || 'Générée automatiquement'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};
