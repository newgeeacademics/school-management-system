import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SetRoleFromQuery } from '@/components/SetRoleFromQuery';
import { RegistrationHandoff } from '@/components/RegistrationHandoff';
import { EnvConfigBanner } from '@/components/EnvConfigBanner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserPortalRedirectPage } from './pages/UserPortalRedirectPage';

/** One broken page never blanks the app; navigating elsewhere clears the error. */
function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
}

export const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Toaster richColors position='top-center' />
      <EnvConfigBanner />
      <BrowserRouter>
        <RegistrationHandoff />
        <SetRoleFromQuery />
        <RouteErrorBoundary>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/connexion' element={<UserPortalRedirectPage />} />
          <Route path='/' element={<Navigate to='/login' replace />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
        </RouteErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  );
};
