import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UserPortalLoginPage } from '@/pages/UserPortalLoginPage';
import { PortalHomePage } from '@/pages/PortalHomePage';
import { PortalLayout } from '@/pages/PortalLayout';
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
                <PortalLayout />
              </PortalSessionGate>
            }
          >
            <Route index element={<PortalHomePage section='overview' />} />
            <Route path='classes' element={<PortalHomePage section='classes' />} />
            <Route path='students' element={<PortalHomePage section='students' />} />
            <Route path='schools' element={<PortalHomePage section='schools' />} />
            <Route path='schedule' element={<PortalHomePage section='schedule' />} />
            <Route path='grades' element={<PortalHomePage section='grades' />} />
            <Route path='canteen' element={<PortalHomePage section='canteen' />} />
            <Route path='transport' element={<PortalHomePage section='transport' />} />
            <Route path='messages' element={<PortalHomePage section='messages' />} />
          </Route>
          <Route path='*' element={<Navigate to='/connexion' replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
