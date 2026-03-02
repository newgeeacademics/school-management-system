import type { AuthProvider } from '@refinedev/core';
import { User, SignUpPayload } from '@/types';
import { getStoredUsers, setStoredUsers } from '@/data/mockData';

const USER_STORAGE_KEY = 'user';

export const authProvider: AuthProvider = {
  register: async ({
    email,
    name,
    role,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return {
        success: false,
        error: {
          name: 'Registration failed',
          message: 'An account with this email already exists.',
        },
      };
    }
    const now = new Date().toISOString();
    const newUser: User = {
      id: `user-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      email,
      name,
      role: role ?? 'student',
      image,
      imageCldPubId,
    };
    users.push(newUser);
    setStoredUsers(users);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return { success: true, redirectTo: '/dashboard' };
  },

  login: async ({ email }) => {
    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return {
        success: false,
        error: {
          name: 'Login failed',
          message: 'No user found with this email. Use Register or try a mock email (e.g. admin@school.edu).',
        },
      };
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return { success: true, redirectTo: '/dashboard' };
  },

  logout: async () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    return { success: true, redirectTo: '/login' };
  },

  onError: async (error: unknown) => {
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 401) {
      return { logout: true };
    }
    return {};
  },

  check: async () => {
    return { authenticated: true };
  },

  getPermissions: async () => {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    if (!user) return null;
    const parsed = JSON.parse(user) as User;
    return { role: parsed.role };
  },

  getIdentity: async () => {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    if (!user) return null;
    const parsed = JSON.parse(user) as User;
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      image: parsed.image,
      role: parsed.role,
      imageCldPubId: parsed.imageCldPubId,
    };
  },
};
