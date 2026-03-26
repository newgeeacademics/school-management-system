/**
 * API client for the classroom backend.
 * Admin app is hosted separately and calls this API.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API = `${BASE}/api`;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const user = localStorage.getItem('admin_user');
  if (user) {
    try {
      const { role } = JSON.parse(user);
      if (role) (headers as Record<string, string>)['X-User-Role'] = role;
    } catch {
      // ignore
    }
  }
  return headers;
}

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string })?.error || res.statusText);
  return data as T;
}

// Auth
export const authApi = {
  signIn: (email: string, password: string) =>
    fetch(`${API}/auth/sign-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(handleRes<{ success: boolean; user: User }>),

  signOut: () =>
    fetch(`${API}/auth/sign-out`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleRes<{ success: boolean }>),
};

// Users
export const usersApi = {
  list: (params?: { page?: number; limit?: number; roles?: string; searchQuery?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.roles) q.set('roles', params.roles);
    if (params?.searchQuery) q.set('searchQuery', params.searchQuery);
    const query = q.toString();
    return fetch(`${API}/users${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(
      handleRes<{ data: User[]; pagination: { total: number } }>
    );
  },
  getOne: (id: string) =>
    fetch(`${API}/users/${id}`, { headers: getHeaders() }).then(
      handleRes<{ data: User[] }>
    ).then((r) => r.data[0]),
  create: (body: Partial<User>) =>
    fetch(`${API}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes<{ data: User[] }>).then((r) => r.data[0]),
  update: (id: string, body: Partial<User>) =>
    fetch(`${API}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes<{ data: User[] }>).then((r) => r.data[0]),
  delete: (id: string) =>
    fetch(`${API}/users/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleRes<unknown>),
};

// Subjects
export const subjectsApi = {
  list: (params?: { page?: number; limit?: number; department?: string; searchQuery?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.department) q.set('department', params.department);
    if (params?.searchQuery) q.set('searchQuery', params.searchQuery);
    const query = q.toString();
    return fetch(`${API}/subjects${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(
      handleRes<{ data: Subject[]; pagination: { total: number } }>
    );
  },
  getOne: (id: number) =>
    fetch(`${API}/subjects/${id}`, { headers: getHeaders() }).then(
      handleRes<{ data: Subject[] }>
    ).then((r) => r.data[0]),
  create: (body: Partial<Subject>) =>
    fetch(`${API}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes<{ data: Subject[] }>).then((r) => r.data[0]),
  update: (id: number, body: Partial<Subject>) =>
    fetch(`${API}/subjects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes<{ data: Subject[] }>).then((r) => r.data[0]),
  delete: (id: number) =>
    fetch(`${API}/subjects/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleRes<unknown>),
};

// Classes
export const classesApi = {
  list: (params?: { page?: number; limit?: number; subjectId?: number; teacherId?: string; searchQuery?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.subjectId != null) q.set('subjectId', String(params.subjectId));
    if (params?.teacherId) q.set('teacherId', params.teacherId);
    if (params?.searchQuery) q.set('searchQuery', params.searchQuery);
    const query = q.toString();
    return fetch(`${API}/classes${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(
      handleRes<{ data: Class[]; pagination: { total: number } }>
    );
  },
  getOne: (id: number) =>
    fetch(`${API}/classes/${id}`, { headers: getHeaders() }).then(
      handleRes<{ data: Class[] }>
    ).then((r) => r.data[0]),
  create: (body: Partial<Class>) =>
    fetch(`${API}/classes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes<{ data: Class[] }>).then((r) => r.data[0]),
  update: (id: number, body: Partial<Class>) =>
    fetch(`${API}/classes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes<{ data: Class[] }>).then((r) => r.data[0]),
  delete: (id: number) =>
    fetch(`${API}/classes/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleRes<unknown>),
};

// Enrollments
export const enrollmentsApi = {
  list: (params?: { page?: number; limit?: number; studentId?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.studentId) q.set('studentId', params.studentId);
    const query = q.toString();
    return fetch(`${API}/enrollments${query ? `?${query}` : ''}`, { headers: getHeaders() }).then(
      handleRes<{ data: Enrollment[]; pagination: { total: number } }>
    );
  },
};

// Types (match backend)
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  image?: string;
  imageCldPubId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  createdAt?: string;
}

export interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Class {
  id: number;
  name: string;
  subjectId: number;
  teacherId: string;
  capacity?: number;
  description?: string;
  status: 'active' | 'inactive';
  bannerUrl?: string;
  bannerCldPubId?: string;
  schedules?: ClassSchedule[];
  inviteCode?: string;
  subject?: Subject;
  teacher?: User;
  students?: { id: string; name: string; email: string; enrolledAt: string; enrollmentId: number }[];
}

export interface Enrollment {
  id: number;
  classId: number;
  studentId: string;
  enrolledAt: string;
  class?: Class;
}
