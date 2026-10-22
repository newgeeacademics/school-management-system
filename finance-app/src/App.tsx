import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EnvConfigBanner } from '@/components/EnvConfigBanner';
import { FinanceSessionGate } from '@/components/FinanceSessionGate';
import { FinanceDashboardPage } from '@/pages/FinanceDashboardPage';
import { LoginPage } from '@/pages/LoginPage';

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
        <RouteErrorBoundary>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route
            path='/'
            element={
              <FinanceSessionGate>
                <FinanceDashboardPage />
              </FinanceSessionGate>
            }
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
        </RouteErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  );
};
