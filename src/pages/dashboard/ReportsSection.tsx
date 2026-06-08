import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  AttendanceRecord,
  ClassItem,
  PaymentReceipt,
  PaymentReminder,
  Student,
} from './dashboardTypes';

type ReportsSectionProps = {
  classes: ClassItem[];
  students: Student[];
  attendance: AttendanceRecord[];
  reminders: PaymentReminder[];
  receipts: PaymentReceipt[];
};

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  classes,
  students,
  attendance,
  reminders,
  receipts,
}) => {
  const byClass = React.useMemo(() => {
    return classes.map((cls) => {
      const classStudents = students.filter((s) => s.classId === cls.id);
      const classAttendance = attendance.filter((r) => r.classId === cls.id);
      const presentCount = classAttendance.filter(
        (r) => r.status === 'Présent',
      ).length;
      const totalLines = classAttendance.length || classStudents.length || 0;
      const rate =
        totalLines > 0 ? Math.round((presentCount / totalLines) * 100) : 0;
      return {
        id: cls.id,
        name: cls.name,
        level: cls.level,
        studentCount: classStudents.length,
        attendanceRate: rate,
      };
    });
  }, [attendance, classes, students]);

  const totalStudents = students.length;
  const overallAttendanceRate =
    byClass.length > 0
      ? Math.round(
          byClass.reduce((acc, c) => acc + c.attendanceRate, 0) /
            byClass.length,
        )
      : 0;

  const totalReminders = reminders.length;
  const totalReceipts = receipts.length;
  const totalAmountReceived = receipts.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );

  return (
    <section className='space-y-5'>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground'>
              Élèves suivis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {totalStudents.toString().padStart(2, '0')}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Répartis sur {classes.length} classes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground'>
              Taux de présence global (exemple)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-semibold'>
              {overallAttendanceRate.toString().padStart(2, '0')}%
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Calculé à partir des feuilles d&apos;appel simulées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground'>
              Paiements (exemple)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lg font-semibold'>
              {totalAmountReceived.toLocaleString('fr-FR')} XOF
            </p>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              {totalReceipts} reçus enregistrés • {totalReminders} rappels
              créés.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>
            Présence par classe (démo)
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-xs'>
          {byClass.length === 0 ? (
            <p className='text-muted-foreground'>
              Ajoutez des classes et des élèves, puis enregistrez quelques
              présences pour voir des statistiques par classe.
            </p>
          ) : (
            <div className='border rounded-md divide-y'>
              {byClass.map((cls) => (
                <div
                  key={cls.id}
                  className='flex items-center justify-between gap-3 px-3 py-2'
                >
                  <div>
                    <p className='text-xs font-medium'>{cls.name}</p>
                    <p className='text-[11px] text-muted-foreground'>
                      {cls.level} • {cls.studentCount} élèves
                    </p>
                  </div>
                  <p className='text-sm font-semibold'>
                    {cls.attendanceRate.toString().padStart(2, '0')}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

