import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LandingPage } from './pages/LandingPage';
import { PlansPage } from './pages/PlansPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IdCardScanPage } from './pages/IdCardScanPage';
import { UserPortalRedirectPage } from './pages/UserPortalRedirectPage';
import { EnvConfigBanner } from '@/components/EnvConfigBanner';
import { RegistrationHandoff } from '@/components/RegistrationHandoff';
import { SetRoleFromQuery } from '@/components/SetRoleFromQuery';

export const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Toaster richColors position='top-center' />
      <EnvConfigBanner />
      <BrowserRouter>
        <RegistrationHandoff />
        <SetRoleFromQuery />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/plans' element={<PlansPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/connexion' element={<UserPortalRedirectPage />} />
          <Route path='/carte/:type/:id' element={<IdCardScanPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};
