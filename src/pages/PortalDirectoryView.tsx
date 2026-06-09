import { useEffect, useState } from 'react';
import { Phone, Mail, BookOpen } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { fetchPortalDirectory, type PortalTeacherContact } from '@/lib/portal-class-hub';

export function PortalDirectoryView() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<PortalTeacherContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchPortalDirectory()
      .then((data) => {
        if (!cancelled) setTeachers(data.teachers);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('portalDirectory.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) {
    return <p className='text-sm text-muted-foreground'>{t('portalDirectory.loading')}</p>;
  }

  if (error) {
    return <p className='text-sm text-destructive'>{error}</p>;
  }

  if (teachers.length === 0) {
    return <p className='text-sm italic text-muted-foreground'>{t('portalDirectory.empty')}</p>;
  }

  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted-foreground'>{t('portalDirectory.intro')}</p>
      {teachers.map((teacher) => (
        <article
          key={`${teacher.classId}-${teacher.teacherId}`}
          className='rounded-xl border border-border bg-card p-4 shadow-sm'
        >
          <div className='flex items-start gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <BookOpen className='size-5' aria-hidden />
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <p className='font-semibold text-foreground'>{teacher.teacherName}</p>
              <p className='text-xs text-muted-foreground'>
                {teacher.subject ?? t('portalDirectory.subjectUnknown')}
                {teacher.className ? ` · ${teacher.className}` : ''}
              </p>
              {teacher.studentName ? (
                <p className='text-xs text-muted-foreground'>
                  {t('portalDirectory.forChild', { name: teacher.studentName })}
                </p>
              ) : null}
              <div className='flex flex-wrap gap-3 pt-2 text-sm'>
                {teacher.phone ? (
                  <a
                    href={`tel:${teacher.phone}`}
                    className='inline-flex items-center gap-1.5 text-primary hover:underline'
                  >
                    <Phone className='size-4' aria-hidden />
                    {teacher.phone}
                  </a>
                ) : (
                  <span className='text-xs text-muted-foreground'>{t('portalDirectory.noPhone')}</span>
                )}
                {teacher.email ? (
                  <a
                    href={`mailto:${teacher.email}`}
                    className='inline-flex items-center gap-1.5 text-primary hover:underline'
                  >
                    <Mail className='size-4' aria-hidden />
                    {teacher.email}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
