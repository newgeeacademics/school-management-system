import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { UserPortalLoginPage } from '@/pages/UserPortalLoginPage';
import { IdCardScanPage } from '@/pages/IdCardScanPage';
import { PortalHomePage } from '@/pages/PortalHomePage';
import { PortalClassHubView } from '@/pages/PortalClassHubView';
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
          <Route path='/carte/:type/:id' element={<IdCardScanPage />} />
          <Route
            path='/accueil'
            element={
              <PortalSessionGate>
                <PortalLayout />
              </PortalSessionGate>
            }
          >
            <Route index element={<PortalHomePage section='overview' />} />
            <Route path='classes' element={<PortalClassHubView />} />
            <Route path='classes/:classId' element={<PortalClassHubView />} />
            <Route path='directory' element={<PortalHomePage section='directory' />} />
            <Route path='students' element={<PortalHomePage section='students' />} />
            <Route path='schools' element={<PortalHomePage section='schools' />} />
            <Route path='schedule' element={<PortalHomePage section='schedule' />} />
            <Route path='calendar' element={<PortalHomePage section='calendar' />} />
            <Route path='grades' element={<PortalHomePage section='grades' />} />
            <Route path='presence' element={<PortalHomePage section='presence' />} />
            <Route path='absences' element={<PortalHomePage section='absences' />} />
            <Route path='notifications' element={<PortalHomePage section='notifications' />} />
            <Route path='canteen' element={<PortalHomePage section='canteen' />} />
            <Route path='transport' element={<PortalHomePage section='transport' />} />
            <Route path='messages' element={<PortalHomePage section='messages' />} />
            <Route path='announcements' element={<PortalHomePage section='announcements' />} />
            <Route path='fees' element={<PortalHomePage section='fees' />} />
          </Route>
          <Route path='*' element={<Navigate to='/connexion' replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
