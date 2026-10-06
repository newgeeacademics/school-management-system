import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'sonner';
import { TrackingSessionGate } from '@/components/TrackingSessionGate';
import { LoginPage } from '@/pages/LoginPage';
import { TrackingDashboardPage } from '@/pages/TrackingDashboardPage';

/** One broken page never blanks the app; navigating elsewhere clears the error. */
function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
}

export function App() {
  return (
    <>
      <Toaster richColors position='top-center' />
      <BrowserRouter>
        <RouteErrorBoundary>
        <Routes>
          <Route path='/' element={<Navigate to='/connexion' replace />} />
          <Route path='/connexion' element={<LoginPage />} />
          <Route
            path='/suivi'
            element={
              <TrackingSessionGate>
                <TrackingDashboardPage />
              </TrackingSessionGate>
            }
          />
          <Route path='*' element={<Navigate to='/connexion' replace />} />
        </Routes>
        </RouteErrorBoundary>
      </BrowserRouter>
    </>
  );
}
