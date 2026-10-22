import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EnvConfigBanner } from '@/components/EnvConfigBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RegistrationHandoff } from '@/components/RegistrationHandoff';
import { SetRoleFromQuery } from '@/components/SetRoleFromQuery';

// Route-level code splitting: the landing page no longer downloads the dashboard,
// the registration wizard (country/city data) or the maps.
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const PlansPage = lazy(() => import('./pages/PlansPage').then((m) => ({ default: m.PlansPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const VerifyEmailPage = lazy(() =>
  import('./pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage }))
);
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const IdCardScanPage = lazy(() => import('./pages/IdCardScanPage').then((m) => ({ default: m.IdCardScanPage })));
const UserPortalRedirectPage = lazy(() =>
  import('./pages/UserPortalRedirectPage').then((m) => ({ default: m.UserPortalRedirectPage }))
);

function RouteFallback() {
  return (
    <div className='route-loader' role='status' aria-label='Chargement'>
      <span className='route-loader__spinner' />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/plans' element={<PlansPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/verify-email' element={<VerifyEmailPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/connexion' element={<UserPortalRedirectPage />} />
          <Route path='/carte/:type/:id' element={<IdCardScanPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Toaster richColors position='top-center' />
      <EnvConfigBanner />
      <BrowserRouter>
        <RegistrationHandoff />
        <SetRoleFromQuery />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  );
};
