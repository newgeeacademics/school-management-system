import { BACKEND_BASE_URL } from "@/constants";
import { DataProvider } from "@refinedev/core";
import axios from "axios";
import { authProvider } from "./authProvider";

const ANNOUNCEMENTS_KEY = "newgee_announcements";
const LOCAL_USERS_KEY = "newgee_local_users";
const LOCAL_SUBJECTS_KEY = "newgee_local_subjects";
const LOCAL_CLASSES_KEY = "newgee_local_classes";
const LOCAL_CLASS_GROUPS_KEY = "newgee_local_class_groups";
const LOCAL_ENROLLMENTS_KEY = "newgee_local_enrollments";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const apiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Interceptor to automatically add role to headers
apiClient.interceptors.request.use(async (config) => {
  const permissions = authProvider && typeof authProvider.getPermissions === "function"
    ? await authProvider.getPermissions()
    : undefined;
  
   if (permissions && typeof permissions === "object" && "role" in permissions) {
    config.headers["X-User-Role"] = (permissions as { role: string })["role"];
  }
  return config;
});

function getAnnouncements(): { id: string; title: string; message: string; priority: string; date: string }[] {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

type LocalClass = {
  id: number;
  name: string;
  subjectId: number;
  teacherId: string;
  classGroupId?: number;
  term?: string;
  capacity?: number;
  description?: string;
  status: string;
  bannerUrl?: string;
  bannerCldPubId?: string;
  inviteCode?: string;
  schedules?: { day: string; startTime: string; endTime: string }[];
  createdAt?: string;
};

function getLocalClassGroups(): { id: number; name: string; capacity: number; term?: string }[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLASS_GROUPS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function getLocalClassesEnriched(): (LocalClass & { subject?: unknown; teacher?: unknown })[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLASSES_KEY);
    const list: LocalClass[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const subjects: { id: number; name: string; code: string; description: string; department: string }[] =
      JSON.parse(localStorage.getItem(LOCAL_SUBJECTS_KEY) || "[]");
    const usersRaw = localStorage.getItem(LOCAL_USERS_KEY) || "[]";
    type UserShape = { id: string; name: string; email: string; role: string; department?: string; password?: string };
    const users = (JSON.parse(usersRaw) as UserShape[]).map(
      ({ password: _p, ...u }) => ({ ...u, department: u.department ?? "" })
    );
    const classGroups = getLocalClassGroups();
    return list.map((c) => ({
      ...c,
      subject: subjects.find((s) => s.id === c.subjectId) ?? { id: c.subjectId, name: "", code: "", description: "", department: "" },
      teacher: users.find((u) => u.id === c.teacherId) ?? { id: c.teacherId, name: "", email: "", role: "teacher", department: "" },
      classGroup: c.classGroupId != null ? classGroups.find((g) => g.id === c.classGroupId) : undefined,
    }));
  } catch {
    return [];
  }
}

export const dataProvider: DataProvider = {
  getList: (async ({ resource, pagination, filters }) => {
    if (resource === "announcements") {
      const list = getAnnouncements();
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;
      const start = (page - 1) * pageSize;
      const data = list.slice(start, start + pageSize);
      return { success: true, data, total: list.length };
    }

    if (resource === "class-groups" && typeof window !== "undefined") {
      try {
        const list: { id: number; name: string; capacity: number; term?: string }[] =
          JSON.parse(localStorage.getItem(LOCAL_CLASS_GROUPS_KEY) || "[]");
        const page = pagination?.currentPage ?? 1;
        const pageSize = pagination?.pageSize ?? 10;
        const start = (page - 1) * pageSize;
        const data = list.slice(start, start + pageSize);
        return { success: true, data, total: list.length };
      } catch {
        return { success: true, data: [], total: 0 };
      }
    }

    const page = pagination?.currentPage ?? 1;
    const pageSize = pagination?.pageSize ?? 10;

    const params: Record<string, string | number> = {
      page,
      limit: pageSize
    };

    filters?.forEach((filter) => {
      if ('field' in filter && 'value' in filter && filter.value) {
        const value = String(filter.value);
        if (resource === 'users') {
          if (filter.field === 'role') params.roles = value;
          if (filter.field === 'name') params.searchQuery = value;
        }
        if (resource === 'subjects') {
          if (filter.field === 'department') params.department = value;
          if (filter.field === 'name') params.searchQuery = value;
        }
        if (resource === 'classes') {
          if (filter.field === 'subjectId') params.subjectId = value;
          if (filter.field === 'teacherId') params.teacherId = value;
          if (filter.field === 'name') params.searchQuery = value;
        }
        if (resource === 'enrollments') {
          if (filter.field === 'studentId') params.studentId = value;
        }
      }
    });

    let data: unknown[];
    let total: number;
    try {
      const response = await apiClient.get(`/${resource}`, { params });
      data = response.data.data || response.data;
      total = response.data.pagination?.total ?? (Array.isArray(data) ? data.length : 0);
    } catch {
      data = [];
      total = 0;
    }

    if (resource === "users" && typeof window !== "undefined") {
      try {
        type UserRow = { id: string; name: string; email: string; role: string; username?: string; department?: string; password?: string };
        const localParsed = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]") as UserRow[];
        const localUsers = localParsed.map(({ password: _p, ...u }) => ({ ...u, department: u.department ?? "" }));
        const apiData = Array.isArray(data) ? (data as UserRow[]) : [];
        const apiIds = new Set(apiData.map((u) => u.id));
        let merged: { id: string; name: string; email: string; role: string; username?: string; department?: string }[] = [...apiData, ...localUsers.filter((u) => !apiIds.has(u.id))];
        const roleFilter = filters?.find((f) => "field" in f && f.field === "role");
        if (roleFilter && "value" in roleFilter && roleFilter.value) {
          const roleVal = String(roleFilter.value);
          if (roleVal !== "teacher,admin" && roleVal !== "all") {
            merged = merged.filter((u) => u.role === roleVal);
          }
        }
        data = merged;
        total = merged.length;
      } catch {
        /* ignore */
      }
    }

    if (resource === "subjects" && typeof window !== "undefined") {
      try {
        type SubjectRow = { id: number; name: string; code: string; description: string; department: string };
        const local: SubjectRow[] =
          JSON.parse(localStorage.getItem(LOCAL_SUBJECTS_KEY) || "[]");
        const apiData = Array.isArray(data) ? (data as SubjectRow[]) : [];
        const apiIds = new Set(apiData.map((s) => s.id));
        const merged: SubjectRow[] = [...apiData, ...local.filter((s) => !apiIds.has(s.id))];
        data = merged;
        total = merged.length;
      } catch {
        /* ignore */
      }
    }

    if (resource === "classes" && typeof window !== "undefined") {
      try {
        const localEnriched = getLocalClassesEnriched();
        type ClassRow = { id: number };
        const apiData = Array.isArray(data) ? (data as ClassRow[]) : [];
        const apiIds = new Set(apiData.map((c) => c.id));
        const merged = [...apiData, ...localEnriched.filter((c) => !apiIds.has(c.id))];
        data = merged;
        total = merged.length;
      } catch {
        /* ignore */
      }
    }

    if (resource === "enrollments" && typeof window !== "undefined") {
      try {
        type EnrollmentRow = { id: number; classId: number; studentId: string; enrolledAt: string };
        const local: EnrollmentRow[] =
          JSON.parse(localStorage.getItem(LOCAL_ENROLLMENTS_KEY) || "[]");
        const apiData = Array.isArray(data) ? (data as EnrollmentRow[]) : [];
        const apiIds = new Set(apiData.map((e) => e.id));
        const merged: EnrollmentRow[] = [...apiData, ...local.filter((e) => !apiIds.has(e.id))];
        if (filters?.length) {
          const classIdFilter = filters.find((f) => "field" in f && f.field === "classId");
          const studentIdFilter = filters.find((f) => "field" in f && f.field === "studentId");
          let filtered = merged;
          if (classIdFilter && "value" in classIdFilter && classIdFilter.value != null) {
            const cid = Number(classIdFilter.value);
            filtered = filtered.filter((e) => e.classId === cid);
          }
          if (studentIdFilter && "value" in studentIdFilter && studentIdFilter.value != null) {
            const sid = String(studentIdFilter.value);
            filtered = filtered.filter((e) => e.studentId === sid);
          }
          data = filtered;
          total = filtered.length;
        } else {
          data = merged;
          total = merged.length;
        }
      } catch {
        /* ignore */
      }
    }

    return { success: true, data, total };
  }) as DataProvider["getList"],

  update: async ({ resource, id, variables }) => {
    if (resource === "announcements") {
      const list = getAnnouncements();
      const idx = list.findIndex((a) => String(a.id) === String(id));
      if (idx === -1) return { success: false, data: null };
      list[idx] = { ...list[idx], ...variables } as typeof list[0];
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(list));
      return { success: true, data: list[idx] };
    }
    const response = await apiClient.put(`/${resource}/${id}`, variables);
    return { success: true, data: response.data?.data?.[0] ?? response.data?.[0] };
  },

  getOne: async ({ resource, id }) => {
    if (resource === "announcements") {
      const list = getAnnouncements();
      const one = list.find((a) => String(a.id) === String(id));
      return one ? { success: true, data: one } : { success: false, data: null };
    }
    if (resource === "classes" && typeof window !== "undefined") {
      try {
        const response = await apiClient.get(`/${resource}/${id}`);
        const raw = response.data?.data;
        const one = Array.isArray(raw) ? raw[0] : raw ?? response.data?.[0];
        if (one) return { success: true, data: one };
      } catch {
        /* fall through to local */
      }
      const localEnriched = getLocalClassesEnriched();
      const numId = typeof id === "string" ? parseInt(id, 10) : Number(id);
      const one = localEnriched.find((c) => c.id === numId);
      return one ? { success: true, data: one } : { success: false, data: null };
    }
    const response = await apiClient.get(`/${resource}/${id}`);
    return { success: true, data: response.data?.data?.[0] ?? response.data?.[0] };
  },

  create: (async ({ resource, variables }) => {
    if (resource === "announcements") {
      const list = getAnnouncements();
      const newId = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
      const newItem = {
        id: newId,
        title: (variables as { title?: string }).title ?? "",
        message: (variables as { message?: string }).message ?? "",
        priority: (variables as { priority?: string }).priority ?? "normal",
        date: (variables as { date?: string }).date ?? new Date().toISOString().slice(0, 10),
      };
      list.unshift(newItem);
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(list));
      return { success: true, data: newItem, redirectTo: "/announcements" };
    }

    if (resource === "users" && typeof window !== "undefined") {
      try {
        const v = variables as { name?: string; email?: string; role?: string; department?: string };
        const now = new Date().toISOString();
        const userId = generateId();
        const username = (v.email ?? "").split("@")[0] || userId;
        const newUser = {
          id: userId,
          username,
          email: String(v.email ?? "").trim(),
          name: String(v.name ?? "").trim(),
          role: v.role === "teacher" || v.role === "admin" || v.role === "student" ? v.role : "student",
          password: "",
          department: String(v.department ?? "").trim(),
          schoolId: null,
          createdAt: now,
          updatedAt: now,
        };
        let list: unknown[];
        try {
          const raw = localStorage.getItem(LOCAL_USERS_KEY) || "[]";
          list = JSON.parse(raw);
        } catch {
          list = [];
        }
        if (!Array.isArray(list)) list = [];
        (list as typeof newUser[]).push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
        const { password: _p, ...safe } = newUser;
        return { success: true, data: safe, redirectTo: "/users" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create user";
        return { success: false, data: null, error: { message } } as any;
      }
    }

    if (resource === "subjects" && typeof window !== "undefined") {
      const v = variables as { name?: string; code?: string; description?: string; department?: string };
      const list: { id: number; name: string; code: string; description: string; department: string }[] =
        JSON.parse(localStorage.getItem(LOCAL_SUBJECTS_KEY) || "[]");
      const maxId = list.length ? Math.max(...list.map((s) => s.id), 0) : 0;
      const newSubject = {
        id: maxId + 1,
        name: v.name ?? "",
        code: v.code ?? "",
        description: v.description ?? "",
        department: v.department ?? "",
      };
      list.push(newSubject);
      localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(list));
      return { success: true, data: newSubject, redirectTo: "/subjects" };
    }

    if (resource === "class-groups" && typeof window !== "undefined") {
      try {
        const v = variables as { name?: string; capacity?: number; term?: string };
        const name = String(v.name ?? "").trim();
        const capacity = Number(v.capacity) || 0;
        let list: { id: number; name: string; capacity: number; term?: string }[];
        try {
          list = JSON.parse(localStorage.getItem(LOCAL_CLASS_GROUPS_KEY) || "[]");
        } catch {
          list = [];
        }
        if (!Array.isArray(list)) list = [];
        const maxId = list.length ? Math.max(...list.map((g) => g.id), 0) : 0;
        const newGroup = { id: maxId + 1, name, capacity, term: v.term ? String(v.term).trim() : undefined };
        list.push(newGroup);
        localStorage.setItem(LOCAL_CLASS_GROUPS_KEY, JSON.stringify(list));
        return { success: true, data: newGroup, redirectTo: "/class-groups" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create class group";
        return { success: false, data: null, error: { message } } as any;
      }
    }

    if (resource === "classes" && typeof window !== "undefined") {
      try {
        const v = variables as {
          name?: string; term?: string; subjectId?: number; teacherId?: string; capacity?: number; classGroupId?: number;
          description?: string; status?: string; bannerUrl?: string; bannerCldPubId?: string;
          inviteCode?: string; schedules?: { day: string; startTime: string; endTime: string }[];
        };
        const classGroupId = v.classGroupId != null ? Number(v.classGroupId) : undefined;
        const groups = getLocalClassGroups();
        const group = classGroupId != null ? groups.find((g) => g.id === classGroupId) : undefined;
        const name = group ? group.name : String(v.name ?? "").trim();
        const capacity = group ? group.capacity : (v.capacity != null ? Number(v.capacity) : undefined);
        let list: LocalClass[];
        try {
          list = JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY) || "[]");
        } catch {
          list = [];
        }
        if (!Array.isArray(list)) list = [];
        const maxId = list.length ? Math.max(...list.map((c) => c.id), 0) : 0;
        const now = new Date().toISOString();
        const newClass: LocalClass = {
          id: maxId + 1,
          name,
          subjectId: Number(v.subjectId) || 0,
          teacherId: String(v.teacherId ?? "").trim(),
          classGroupId: classGroupId ?? undefined,
          term: v.term ? String(v.term).trim() : undefined,
          capacity,
          description: v.description ? String(v.description).trim() : undefined,
          status: v.status === "inactive" ? "inactive" : "active",
          bannerUrl: v.bannerUrl ? String(v.bannerUrl) : undefined,
          bannerCldPubId: v.bannerCldPubId ? String(v.bannerCldPubId) : undefined,
          inviteCode: v.inviteCode ? String(v.inviteCode) : undefined,
          schedules: Array.isArray(v.schedules) ? v.schedules : undefined,
          createdAt: now,
        };
        list.push(newClass);
        localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(list));
        const enriched = getLocalClassesEnriched().find((c) => c.id === newClass.id) ?? newClass;
        return { success: true, data: enriched, redirectTo: "/classes" };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create class";
        return { success: false, data: null, error: { message } } as any;
      }
    }

    if (resource === "enrollments" && typeof window !== "undefined") {
      const v = variables as { classId?: number; studentId?: string };
      const classId = Number(v.classId);
      const studentId = String(v.studentId ?? "");
      if (!classId || !studentId) {
        return { success: false, data: null } as any;
      }
      const list: { id: number; classId: number; studentId: string; enrolledAt: string }[] =
        JSON.parse(localStorage.getItem(LOCAL_ENROLLMENTS_KEY) || "[]");
      if (list.some((e) => e.classId === classId && e.studentId === studentId)) {
        const existing = list.find((e) => e.classId === classId && e.studentId === studentId);
        return { success: true, data: existing, redirectTo: "/classes" };
      }
      const newId = list.length ? Math.max(...list.map((e) => e.id), 0) + 1 : 1;
      const newEnrollment = {
        id: newId,
        classId,
        studentId,
        enrolledAt: new Date().toISOString(),
      };
      list.push(newEnrollment);
      localStorage.setItem(LOCAL_ENROLLMENTS_KEY, JSON.stringify(list));
      return { success: true, data: newEnrollment, redirectTo: false };
    }

    const response = await apiClient.post(`/${resource}`, variables);
    const data = response.data?.data?.[0] ?? response.data?.[0];
    return { success: true, data, redirectTo: `/${resource}` };
  }) as DataProvider["create"],

  deleteOne: async ({ resource, id }) => {
    if (resource === "announcements") {
      const list = getAnnouncements().filter((a) => String(a.id) !== String(id));
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(list));
      return { success: true, data: {} };
    }
    if (resource === "enrollments" && typeof window !== "undefined") {
      const list: { id: number; classId: number; studentId: string; enrolledAt: string }[] =
        JSON.parse(localStorage.getItem(LOCAL_ENROLLMENTS_KEY) || "[]");
      const numId = typeof id === "string" ? parseInt(id, 10) : Number(id);
      const filtered = list.filter((e) => e.id !== numId);
      if (filtered.length < list.length) {
        localStorage.setItem(LOCAL_ENROLLMENTS_KEY, JSON.stringify(filtered));
        return { success: true, data: {} };
      }
    }
    const response = await apiClient.delete(`/${resource}/${id}`);
    return { success: true, data: response.data };
  },

  custom: async ({ url }) => {
    const response = await apiClient.post(url);
    return { success: true, data: response.data };
  },

  getApiUrl: function (): string {
    throw new Error("Function not implemented.");
  }
};
