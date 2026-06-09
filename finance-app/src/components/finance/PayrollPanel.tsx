import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PayrollEmployeeType, PayrollPayment, TeacherOption } from '@/types/finance';

const formatXof = (n: number) => `${n.toLocaleString('fr-FR')} XOF`;

const STATUS_LABELS: Record<PayrollPayment['status'], string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  CANCELLED: 'Annulé',
};

type NewPayrollForm = {
  employeeId: string;
  employeeName: string;
  amount: string;
  periodLabel: string;
  paymentDate: string;
  notes: string;
};

type Props = {
  employeeType: PayrollEmployeeType;
  title: string;
  description: string;
  payments: PayrollPayment[];
  teachers?: TeacherOption[];
  onCreate: (data: {
    employeeType: PayrollEmployeeType;
    employeeId?: string;
    employeeName: string;
    amount: number;
    periodLabel: string;
    paymentDate: string;
    notes?: string;
  }) => Promise<void>;
  onMarkPaid: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  readOnly?: boolean;
};

const emptyForm = (): NewPayrollForm => ({
  employeeId: '',
  employeeName: '',
  amount: '',
  periodLabel: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: '',
});

export function PayrollPanel({
  employeeType,
  title,
  description,
  payments,
  teachers = [],
  onCreate,
  onMarkPaid,
  onDelete,
  readOnly = false,
}: Props) {
  const [form, setForm] = React.useState<NewPayrollForm>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeName.trim() || !form.amount.trim() || !form.periodLabel.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        employeeType,
        employeeId: form.employeeId || undefined,
        employeeName: form.employeeName.trim(),
        amount: Number(form.amount),
        periodLabel: form.periodLabel.trim(),
        paymentDate: form.paymentDate,
        notes: form.notes.trim() || undefined,
      });
      setForm(emptyForm());
    } finally {
      setSubmitting(false);
    }
  };

  const pickTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    setForm((f) => ({
      ...f,
      employeeId: teacherId,
      employeeName: teacher?.name ?? f.employeeName,
    }));
  };

  return (
    <section className='space-y-5'>
      <p className='text-sm text-muted-foreground'>{description}</p>

      {!readOnly && (
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Nouveau paiement — {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className='grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-xs' onSubmit={handleSubmit}>
            {employeeType === 'TEACHER' && teachers.length > 0 && (
              <div className='grid gap-2'>
                <Label>Enseignant (liste)</Label>
                <Select value={form.employeeId || '__none'} onValueChange={(v) => pickTeacher(v === '__none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Choisir…' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none'>Saisie manuelle</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className='grid gap-2'>
              <Label>Nom</Label>
              <Input
                value={form.employeeName}
                onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Montant (XOF)</Label>
              <Input
                type='number'
                min={0}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Période</Label>
              <Input
                value={form.periodLabel}
                onChange={(e) => setForm((f) => ({ ...f, periodLabel: e.target.value }))}
                placeholder='Mars 2026'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Date prévue / payée</Label>
              <Input
                type='date'
                value={form.paymentDate}
                onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                required
              />
            </div>
            <div className='grid gap-2 md:col-span-2'>
              <Label>Notes (opt.)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
            <Button
              type='submit'
              size='sm'
              disabled={submitting}
              className='w-fit bg-violet-600 text-white hover:bg-violet-700'
            >
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {readOnly && (
        <p className='rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800'>
          Consultation seule — la saisie des paiements est réservée à la direction et au personnel.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Historique ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {payments.length === 0 ? (
            <p className='text-muted-foreground'>Aucun paiement enregistré.</p>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className='flex flex-wrap items-start justify-between gap-2 rounded-md border border-border/80 px-3 py-2'
              >
                <div>
                  <p className='text-sm font-medium'>{p.employeeName}</p>
                  <p className='text-lg font-semibold'>{formatXof(p.amount)}</p>
                  <p className='text-[11px] text-muted-foreground'>
                    {p.periodLabel} · {p.paymentDate}
                  </p>
                  {p.notes && <p className='mt-1 text-[11px] text-muted-foreground'>{p.notes}</p>}
                </div>
                <div className='flex flex-col items-end gap-2'>
                  <Badge variant={p.status === 'PAID' ? 'default' : 'secondary'}>
                    {STATUS_LABELS[p.status]}
                  </Badge>
                  {!readOnly && (
                    <div className='flex gap-1'>
                      {p.status === 'PENDING' && (
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          className='border-violet-300 text-violet-700 hover:bg-violet-50'
                          onClick={() => void onMarkPaid(p.id)}
                        >
                          Marquer payé
                        </Button>
                      )}
                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        className='text-destructive'
                        onClick={() => {
                          if (confirm(`Supprimer le paiement pour « ${p.employeeName} » ?`)) {
                            void onDelete(p.id);
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
