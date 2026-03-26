import type { AuthProvider } from '@refinedev/core';
import { User, SignUpPayload } from '@/types';
import { BACKEND_BASE_URL } from '@/constants';

const LOCAL_USERS_KEY = 'newgee_local_users';

// Simplified auth provider - calls backend API (no validation)
export const authProvider: AuthProvider = {
  register: async ({
    email,
    password,
    name,
    role,
    image,
    imageCldPubId,
  }: SignUpPayload) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          image,
          imageCldPubId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: {
            name: 'Registration failed',
            message: data.error || 'Unable to create account. Please try again.',
          },
        };
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));

      return {
        success: true,
        redirectTo: '/dashboard',
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: {
          name: 'Registration failed',
          message: 'Unable to create account. Please try again.',
        },
      };
    }
  },
  login: async ({ email, password, username }) => {
    const loginId = email || username || '';
    if (!loginId || !password) {
      return {
        success: false,
        error: { name: 'Login failed', message: 'Email/username and password required.' },
      };
    }

    try {
      const localUsers: Array<{ id: string; email: string; username: string; name: string; role: string; schoolId: string; password: string; createdAt: string; updatedAt: string }> =
        JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const localUser = localUsers.find(
        (u) => (u.email && u.email === loginId) || (u.username && u.username === loginId)
      );
      if (localUser && localUser.password === password) {
        const { password: _p, ...userForSession } = localUser;
        localStorage.setItem('user', JSON.stringify(userForSession));
        return { success: true, redirectTo: '/dashboard' };
      }

      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || undefined, username: username || undefined, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: {
            name: 'Login failed',
            message: data.error || 'Please try again later.',
          },
        };
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, redirectTo: '/dashboard' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          name: 'Login failed',
          message: 'Please try again later.',
        },
      };
    }
  },
  logout: async () => {
    try {
      await fetch(`${BACKEND_BASE_URL}/api/auth/sign-out`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('user');
    return {
      success: true,
      redirectTo: '/',
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    const user = localStorage.getItem('user');

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        name: 'Unauthorized',
        message: 'Check failed',
      },
    };
  },
  getPermissions: async () => {
    const user = localStorage.getItem('user');

    if (!user) return null;
    const parsedUser: User = JSON.parse(user);

    return {
      role: parsedUser.role,
    };
  },
  getIdentity: async () => {
    const user = localStorage.getItem('user');

    if (!user) return null;
    const parsedUser: User = JSON.parse(user);
    

    return {
      id: parsedUser.id,
      name: parsedUser.name,
      email: parsedUser.email,
      image: parsedUser.image,
      role: parsedUser.role,
      imageCldPubId: parsedUser.imageCldPubId,
    };
  },
};
