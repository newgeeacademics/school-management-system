import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TrackingSessionGate } from '@/components/TrackingSessionGate';
import { LoginPage } from '@/pages/LoginPage';
import { TrackingDashboardPage } from '@/pages/TrackingDashboardPage';

export function App() {
  return (
    <>
      <Toaster richColors position='top-center' />
      <BrowserRouter>
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
      </BrowserRouter>
    </>
  );
}
