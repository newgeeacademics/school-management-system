import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassItem,
  SetStateAction,
  Student,
} from './dashboardTypes';

type AttendanceSectionProps = {
  classes: ClassItem[];
  students: Student[];
  records: AttendanceRecord[];
  setRecords: SetStateAction<AttendanceRecord[]>;
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'Présent', label: 'Présent', color: 'bg-emerald-500' },
  { value: 'Absent', label: 'Absent', color: 'bg-red-500' },
  { value: 'Retard', label: 'Retard', color: 'bg-amber-500' },
];

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  classes,
  students,
  records,
  setRecords,
}) => {
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const [date, setDate] = React.useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );

  const classStudents = React.useMemo(
    () =>
      students.filter((s) =>
        selectedClassId ? s.classId === selectedClassId : true,
      ),
    [students, selectedClassId],
  );

  const getStatusFor = (studentId: string): AttendanceStatus | undefined => {
    const rec = records.find(
      (r) => r.studentId === studentId && r.date === date && r.classId === selectedClassId,
    );
    return rec?.status;
  };

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.studentId === studentId && r.date === date && r.classId === selectedClassId,
      );
      const next: AttendanceRecord = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `att-${Date.now()}-${studentId}`,
        studentId,
        classId: selectedClassId || undefined,
        date,
        status,
      };
      if (existingIndex >= 0) {
        const clone = [...prev];
        clone[existingIndex] = next;
        return clone;
      }
      return [...prev, next];
    });
  };

  const presentCount = records.filter(
    (r) =>
      r.date === date &&
      r.classId === (selectedClassId || undefined) &&
      r.status === 'Présent',
  ).length;

  const totalCount = classStudents.length || students.length || 0;
  const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Appel du jour
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 text-xs'>
            <div className='grid gap-3 md:grid-cols-3'>
              <div className='grid gap-2'>
                <Label htmlFor='attendance-date'>Date</Label>
                <Input
                  id='attendance-date'
                  type='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className='grid gap-2 md:col-span-2'>
                <Label htmlFor='attendance-class'>Classe (optionnel)</Label>
                <select
                  id='attendance-class'
                  className='border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-background'
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value=''>Toutes les classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='border rounded-md divide-y max-h-[320px] overflow-auto'>
              {classStudents.length === 0 ? (
                <div className='px-3 py-3 text-[11px] text-muted-foreground'>
                  Aucune élève pour la sélection actuelle. Ajoutez d&apos;abord des
                  élèves dans la section dédiée.
                </div>
              ) : (
                classStudents.map((student) => {
                  const status = getStatusFor(student.id);
                  return (
                    <div
                      key={student.id}
                      className='flex items-center justify-between gap-3 px-3 py-2'
                    >
                      <div className='flex flex-col'>
                        <span className='text-xs font-medium'>{student.name}</span>
                        <span className='text-[11px] text-muted-foreground'>
                          {classes.find((c) => c.id === student.classId)?.name ??
                            'Classe non définie'}
                        </span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        {STATUS_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            type='button'
                            size='xs'
                            variant={status === opt.value ? 'default' : 'outline'}
                            className={
                              status === opt.value
                                ? `${opt.color} hover:${opt.color}/90 text-white border-transparent h-7 px-2 text-[11px]`
                                : 'h-7 px-2 text-[11px]'
                            }
                            onClick={() => updateStatus(student.id, opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Résumé de la journée
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex items-baseline justify-between'>
              <div>
                <p className='text-xs text-muted-foreground mb-1'>
                  Présence moyenne du jour
                </p>
                <p className='text-2xl font-semibold'>
                  {rate.toString().padStart(2, '0')}%
                </p>
              </div>
              <Badge variant='outline' className='text-[11px]'>
                {selectedClassId
                  ? classes.find((c) => c.id === selectedClassId)?.name ?? 'Classe'
                  : 'Tous niveaux'}
              </Badge>
            </div>

            <ul className='space-y-1.5 text-xs text-muted-foreground'>
              <li>
                <span className='font-medium text-foreground'>{presentCount}</span>{' '}
                élèves marqués présents.
              </li>
              <li>
                Basé sur les marquages effectués pour la date sélectionnée. Le
                backend gérera plus tard les statistiques détaillées.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

