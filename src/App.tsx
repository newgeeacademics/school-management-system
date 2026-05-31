import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Toaster richColors position='top-center' />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};
