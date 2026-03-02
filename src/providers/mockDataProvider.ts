import type { DataProvider } from '@refinedev/core';
import type { User, Subject, Class } from '@/types';
import {
  getStoredUsers,
  setStoredUsers,
  getStoredSubjects,
  setStoredSubjects,
  getStoredClasses,
  setStoredClasses,
  getStoredEnrollments,
  setStoredEnrollments,
  type EnrollmentRecord,
} from '@/data/mockData';

function enrichClass(cls: Class, subjects: Subject[], users: User[]): Class {
  const subject = subjects.find((s) => s.id === cls.subjectId);
  const teacher = users.find((u) => u.id === cls.teacherId);
  return { ...cls, subject, teacher };
}

function buildEnrollmentItem(
  rec: EnrollmentRecord,
  classes: Class[],
  subjects: Subject[],
  users: User[]
) {
  const cls = classes.find((c) => c.id === rec.classId);
  if (!cls) return null;
  const enriched = enrichClass(cls, subjects, users);
  return {
    id: rec.id,
    enrollmentId: String(rec.id),
    studentId: rec.studentId,
    classId: rec.classId,
    enrolledAt: rec.enrolledAt,
    class: enriched,
  };
}

const getPage = (pagination: { current?: number; currentPage?: number; pageSize?: number } | undefined) => {
  const p = pagination as { current?: number; currentPage?: number; pageSize?: number } | undefined;
  return {
    page: p?.current ?? p?.currentPage ?? 1,
    pageSize: p?.pageSize ?? 10,
  };
};

export const mockDataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters }) => {
    const { page, pageSize } = getPage(pagination as { current?: number; currentPage?: number; pageSize?: number });

    if (resource === 'users') {
      let data = getStoredUsers();
      filters?.forEach((f) => {
        if ('field' in f && 'value' in f && f.value !== undefined) {
          if (f.field === 'role') data = data.filter((u) => u.role === f.value);
          if (f.field === 'name' && String(f.value))
            data = data.filter((u) => u.name?.toLowerCase().includes(String(f.value).toLowerCase()));
        }
      });
      const total = data.length;
      const start = (page - 1) * pageSize;
      const paged = data.slice(start, start + pageSize);
      return { data: paged, total };
    }

    if (resource === 'subjects') {
      let data = getStoredSubjects();
      filters?.forEach((f) => {
        if ('field' in f && 'value' in f && f.value !== undefined) {
          if (f.field === 'department') data = data.filter((s) => s.department === f.value);
          if (f.field === 'name' && String(f.value))
            data = data.filter((s) => s.name?.toLowerCase().includes(String(f.value).toLowerCase()));
        }
      });
      const total = data.length;
      const start = (page - 1) * pageSize;
      const paged = data.slice(start, start + pageSize);
      return { data: paged, total };
    }

    if (resource === 'classes') {
      const users = getStoredUsers();
      const subjects = getStoredSubjects();
      let classes = getStoredClasses().map((c) => enrichClass(c, subjects, users));
      filters?.forEach((f) => {
        if ('field' in f && 'value' in f && f.value !== undefined) {
          if (f.field === 'subjectId') classes = classes.filter((c) => c.subjectId === Number(f.value));
          if (f.field === 'teacherId') classes = classes.filter((c) => c.teacherId === f.value);
          if (f.field === 'name' && String(f.value))
            classes = classes.filter((c) => c.name?.toLowerCase().includes(String(f.value).toLowerCase()));
        }
      });
      const total = classes.length;
      const start = (page - 1) * pageSize;
      const paged = classes.slice(start, start + pageSize);
      return { data: paged, total };
    }

    if (resource === 'enrollments') {
      const users = getStoredUsers();
      const subjects = getStoredSubjects();
      const classes = getStoredClasses();
      let enrollments = getStoredEnrollments();
      filters?.forEach((f) => {
        if ('field' in f && 'value' in f && f.value !== undefined) {
          if (f.field === 'studentId') enrollments = enrollments.filter((e) => e.studentId === f.value);
        }
      });
      const items = enrollments
        .map((rec) => buildEnrollmentItem(rec, classes, subjects, users))
        .filter(Boolean) as ReturnType<typeof buildEnrollmentItem>[];
      const total = items.length;
      const start = (page - 1) * pageSize;
      const paged = items.slice(start, start + pageSize);
      return { data: paged, total };
    }

    return { data: [], total: 0 };
  },

  getOne: async ({ resource, id }) => {
    const users = getStoredUsers();
    const subjects = getStoredSubjects();
    const classes = getStoredClasses();

    if (resource === 'users') {
      const user = getStoredUsers().find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      return { data: user };
    }

    if (resource === 'subjects') {
      const subject = getStoredSubjects().find((s) => s.id === Number(id));
      if (!subject) throw new Error('Subject not found');
      return { data: subject };
    }

    if (resource === 'classes') {
      const cls = getStoredClasses().find((c) => c.id === Number(id));
      if (!cls) throw new Error('Class not found');
      const enriched = enrichClass(cls, subjects, users);
      const enrollments = getStoredEnrollments().filter((e) => e.classId === Number(id));
      const studentIds = enrollments.map((e) => e.studentId);
      const students = users.filter((u) => studentIds.includes(u.id)).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        enrolledAt: enrollments.find((e) => e.studentId === u.id)?.enrolledAt ?? '',
        enrollmentId: String(enrollments.find((e) => e.studentId === u.id)?.id ?? ''),
      }));
      return { data: { ...enriched, students } };
    }

    throw new Error(`getOne not supported for resource: ${resource}`);
  },

  create: async ({ resource, variables }) => {
    if (resource === 'users') {
      const users = getStoredUsers();
      const newUser: User = {
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: (variables as User).email,
        name: (variables as User).name,
        role: (variables as User).role ?? 'student',
        image: (variables as User).image,
        imageCldPubId: (variables as User).imageCldPubId,
        department: (variables as User).department,
      };
      users.push(newUser);
      setStoredUsers(users);
      return { data: newUser };
    }

    if (resource === 'subjects') {
      const subjects = getStoredSubjects();
      const maxId = subjects.length ? Math.max(...subjects.map((s) => s.id)) : 0;
      const newSubject: Subject = {
        id: maxId + 1,
        name: (variables as Subject).name,
        code: (variables as Subject).code,
        description: (variables as Subject).description ?? '',
        department: (variables as Subject).department,
        createdAt: new Date().toISOString(),
      };
      subjects.push(newSubject);
      setStoredSubjects(subjects);
      return { data: newSubject };
    }

    if (resource === 'classes') {
      const classes = getStoredClasses();
      const subjects = getStoredSubjects();
      const maxId = classes.length ? Math.max(...classes.map((c) => c.id)) : 0;
      const v = variables as Partial<Class>;
      const newClass: Class = {
        id: maxId + 1,
        name: v.name ?? '',
        subjectId: Number(v.subjectId),
        teacherId: String(v.teacherId),
        capacity: v.capacity ?? 30,
        description: v.description ?? '',
        status: (v.status as 'active' | 'inactive') ?? 'active',
        inviteCode: v.inviteCode ?? Math.random().toString(36).slice(2, 8).toUpperCase(),
        schedules: v.schedules ?? [],
      };
      classes.push(newClass);
      setStoredClasses(classes);
      const enriched = enrichClass(newClass, subjects, getStoredUsers());
      return { data: enriched };
    }

    if (resource === 'enrollments') {
      const enrollments = getStoredEnrollments();
      const maxId = enrollments.length ? Math.max(...enrollments.map((e) => e.id)) : 0;
      const v = variables as { studentId: string; classId: number };
      const newEnrollment: EnrollmentRecord = {
        id: maxId + 1,
        studentId: v.studentId,
        classId: v.classId,
        enrolledAt: new Date().toISOString(),
      };
      enrollments.push(newEnrollment);
      setStoredEnrollments(enrollments);
      return { data: newEnrollment };
    }

    throw new Error(`create not supported for resource: ${resource}`);
  },

  update: async ({ resource, id, variables }) => {
    if (resource === 'users') {
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('User not found');
      users[idx] = { ...users[idx], ...variables, updatedAt: new Date().toISOString() } as User;
      setStoredUsers(users);
      return { data: users[idx] };
    }

    if (resource === 'subjects') {
      const subjects = getStoredSubjects();
      const idx = subjects.findIndex((s) => s.id === Number(id));
      if (idx === -1) throw new Error('Subject not found');
      subjects[idx] = { ...subjects[idx], ...variables } as Subject;
      setStoredSubjects(subjects);
      return { data: subjects[idx] };
    }

    if (resource === 'classes') {
      const classes = getStoredClasses();
      const idx = classes.findIndex((c) => c.id === Number(id));
      if (idx === -1) throw new Error('Class not found');
      const v = variables as Partial<Class>;
      classes[idx] = {
        ...classes[idx],
        ...v,
        id: classes[idx].id,
        subjectId: v.subjectId !== undefined ? Number(v.subjectId) : classes[idx].subjectId,
        teacherId: v.teacherId !== undefined ? String(v.teacherId) : classes[idx].teacherId,
      } as Class;
      setStoredClasses(classes);
      return { data: classes[idx] };
    }

    throw new Error(`update not supported for resource: ${resource}`);
  },

  deleteOne: async ({ resource, id }) => {
    if (resource === 'users') {
      const users = getStoredUsers().filter((u) => u.id !== id);
      setStoredUsers(users);
      return { data: {} };
    }
    if (resource === 'subjects') {
      const subjects = getStoredSubjects().filter((s) => s.id !== Number(id));
      setStoredSubjects(subjects);
      return { data: {} };
    }
    if (resource === 'classes') {
      const classes = getStoredClasses().filter((c) => c.id !== Number(id));
      setStoredClasses(classes);
      return { data: {} };
    }
    if (resource === 'enrollments') {
      const enrollments = getStoredEnrollments().filter((e) => e.id !== Number(id));
      setStoredEnrollments(enrollments);
      return { data: {} };
    }
    throw new Error(`deleteOne not supported for resource: ${resource}`);
  },

  getApiUrl: () => '',
} as DataProvider;
