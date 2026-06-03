import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SetRoleFromQuery } from '@/components/SetRoleFromQuery';
import { RegistrationHandoff } from '@/components/RegistrationHandoff';
import { EnvConfigBanner } from '@/components/EnvConfigBanner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserPortalRedirectPage } from './pages/UserPortalRedirectPage';

export const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Toaster richColors position='top-center' />
      <EnvConfigBanner />
      <BrowserRouter>
        <RegistrationHandoff />
        <SetRoleFromQuery />
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/connexion' element={<UserPortalRedirectPage />} />
          <Route path='/' element={<Navigate to='/login' replace />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};
