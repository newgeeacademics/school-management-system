import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useList, useCreate, useInvalidate } from '@refinedev/core';
import { User } from '@/types';
import { useTranslation } from '@/i18n';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
}

export const AddStudentsModal = ({
  open,
  onOpenChange,
  classId,
}: AddStudentsModalProps) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const invalidate = useInvalidate();

  const { result: enrollmentsResult } = useList<{ id: number; classId: number; studentId: string }>({
    resource: 'enrollments',
    filters: [{ field: 'classId', operator: 'eq' as const, value: classId }],
    pagination: { pageSize: 500 },
    queryOptions: { enabled: open },
  });

  const { result: usersResult, query: usersQuery } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq' as const, value: 'student' }],
    pagination: { pageSize: 200 },
    queryOptions: { enabled: open },
  });

  const enrolledStudentIds = useMemo(() => {
    const list = enrollmentsResult?.data ?? [];
    return new Set(list.map((e) => e.studentId));
  }, [enrollmentsResult?.data]);

  const students = useMemo(() => {
    const list = usersResult?.data ?? [];
    return list.filter((u) => !enrolledStudentIds.has(u.id));
  }, [usersResult?.data, enrolledStudentIds]);

  const { mutateAsync: createEnrollment, mutation: { isPending } } = useCreate();

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;
    for (const studentId of selectedIds) {
      await createEnrollment({
        resource: 'enrollments',
        values: { classId, studentId },
      });
    }
    setSelectedIds(new Set());
    invalidate({ resource: 'enrollments', invalidates: ['list'] });
    invalidate({ resource: 'classes', invalidates: ['detail'], id: String(classId) });
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedIds(new Set());
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addStudentsModal.title')}</DialogTitle>
          <DialogDescription>{t('addStudentsModal.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {usersQuery?.isFetching ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : (usersResult?.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('addStudentsModal.noStudentsInSystem')}
            </p>
          ) : students.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('addStudentsModal.noStudentsAvailable')}</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  {selectedIds.size === students.length ? t('addStudentsModal.deselectAll') : t('addStudentsModal.selectAll')}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size} {t('addStudentsModal.selected')}
                </span>
              </div>
              <ScrollArea className="h-[280px] rounded-md border p-2">
                <div className="flex flex-col gap-2">
                  {students.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggle(user.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  disabled={selectedIds.size === 0 || isPending}
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPending ? t('addStudentsModal.adding') : t('addStudentsModal.addSelected')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
