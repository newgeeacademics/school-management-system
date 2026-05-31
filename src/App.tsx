import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UserPortalLoginPage } from '@/pages/UserPortalLoginPage';
import { PortalHomePage } from '@/pages/PortalHomePage';
import { PortalSessionGate } from '@/components/PortalSessionGate';

export function App() {
  return (
    <>
      <Toaster richColors position='top-center' />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate to='/connexion' replace />} />
          <Route path='/connexion' element={<UserPortalLoginPage />} />
          <Route
            path='/accueil'
            element={
              <PortalSessionGate>
                <PortalHomePage />
              </PortalSessionGate>
            }
          />
          <Route path='*' element={<Navigate to='/connexion' replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
