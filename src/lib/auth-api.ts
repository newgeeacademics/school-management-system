import { adminApiFetch } from '@/lib/dashboard-backend';

type MessageResponse = { message?: string };

export function requestPasswordReset(email: string) {
  return adminApiFetch<MessageResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return adminApiFetch<MessageResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export function verifyEmailToken(token: string) {
  const params = new URLSearchParams({ token });
  return adminApiFetch<MessageResponse>(`/api/auth/verify-email?${params}`);
}
