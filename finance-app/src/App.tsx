import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EnvConfigBanner } from '@/components/EnvConfigBanner';
import { FinanceSessionGate } from '@/components/FinanceSessionGate';
import { FinanceDashboardPage } from '@/pages/FinanceDashboardPage';
import { LoginPage } from '@/pages/LoginPage';

export const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Toaster richColors position='top-center' />
      <EnvConfigBanner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  );
};
