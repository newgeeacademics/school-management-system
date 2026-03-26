import React from 'react';

import { AuthPage } from '@/pages/auth';

export const LoginPage: React.FC = () => {
  return <AuthPage initialMode='login' />;
};
