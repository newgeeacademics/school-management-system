import { Authenticated, Refine } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';

import { useMemo } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import './App.css';
import { ErrorComponent } from './components/refine-ui/layout/error-component';
import { Layout } from './components/refine-ui/layout/layout';
import { Toaster } from './components/refine-ui/notification/toaster';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Landing } from './pages/landing';
import { Dashboard } from './pages/dashboard';
import { authProvider } from './providers/authProvider';
import { UsersList } from './pages/users/list';
import { UsersCreate } from './pages/users/create';
import { SubjectsList } from './pages/subjects/list';
import { SubjectsCreate } from './pages/subjects/create';
import { ClassesList } from './pages/classes/list';
import { EnrollmentList } from './pages/enrollments';
import { EnrollmentsCreate } from './pages/enrollments/create';
import { dataProvider } from './providers/dataProvider';
import { UsersEdit } from './pages/users/edit';
import { SubjectsEdit } from './pages/subjects/edit';
import { ClassesCreate } from './pages/classes/create';
import { ClassesEdit } from './pages/classes/edit';
import { ClassesShow } from './pages/classes/show';
import { AnnouncementsList } from './pages/announcements/list';
import { AnnouncementsCreate } from './pages/announcements/create';
import { ProfilePage } from './pages/profile';
import { ClassGroupsList } from './pages/class-groups/list';
import { ClassGroupsCreate } from './pages/class-groups/create';
import { BookOpen, GraduationCap, Home, Layers, User, Megaphone, UserCircle, Users } from 'lucide-react';

/** Renders Landing at "/" when not authenticated; redirects to dashboard when authenticated. No Refine context. */
function LandingOrRedirect() {
  if (typeof window !== 'undefined' && localStorage.getItem('user')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Landing />;
}

function App() {
  const resources = useMemo(
    () => [
      {
        name: 'dashboard',
        list: '/dashboard',
        meta: {
          label: 'Dashboard',
          icon: <Home className='text-gray-200' />,
        },
      },
      {
        name: 'enrollments',
        list: '/enrollments',
        create: '/enrollments/create',
        meta: {
          label: 'Join Classes',
          icon: <Layers className='text-gray-200' />,
        },
      },
      {
        name: 'users',
        list: '/users',
        create: '/users/create',
        edit: '/users/edit/:id',
        show: '/users/show/:id',
        meta: {
          label: 'Faculty',
          icon: <User className='text-gray-200' />,
        },
      },
      {
        name: 'subjects',
        list: '/subjects',
        create: '/subjects/create',
        edit: '/subjects/edit/:id',
        show: '/subjects/show/:id',
        meta: {
          label: 'Subjects',
          icon: <BookOpen className='text-gray-200' />,
        },
      },
      {
        name: 'class-groups',
        list: '/class-groups',
        create: '/class-groups/create',
        meta: {
          label: 'Class groups',
          icon: <Users className='text-gray-200' />,
        },
      },
      {
        name: 'classes',
        list: '/classes',
        create: '/classes/create',
        edit: '/classes/edit/:id',
        show: '/classes/show/:id',
        meta: {
          label: 'Classes',
          icon: <GraduationCap className='text-gray-200' />,
        },
      },
      {
        name: 'announcements',
        list: '/announcements',
        create: '/announcements/create',
        meta: {
          label: 'Announcements',
          icon: <Megaphone className='text-gray-200' />,
        },
      },
      {
        name: 'profile',
        list: '/profile',
        meta: {
          label: 'Profile',
          icon: <UserCircle className='text-gray-200' />,
        },
      },
    ],
    []
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing at "/" – handled outside Refine so it always renders */}
        <Route path='/' element={<LandingOrRedirect />} />

        {/* All other routes run inside Refine (auth, data, resources) */}
        <Route
          path='/*'
          element={
            <RefineKbarProvider>
              <DevtoolsProvider>
                <Refine
                  routerProvider={routerProvider}
                  authProvider={authProvider}
                  dataProvider={dataProvider}
                  resources={resources}
                >
                  <RefineRoutes />
                  <Toaster />
                  <RefineKbar />
                  <UnsavedChangesNotifier />
                </Refine>
              </DevtoolsProvider>
              <DevtoolsPanel />
            </RefineKbarProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function RefineRoutes() {
  return (
    <Routes>
              {/* Public Routes */}
              <Route
                element={
                  <Authenticated key='public-routes' fallback={<Outlet />}>
                    <NavigateToResource fallbackTo='/dashboard' />
                  </Authenticated>
                }
              >
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route
                element={
                  <Authenticated key='protected-routes'>
                    <Layout>
                      <Outlet />
                    </Layout>
                  </Authenticated>
                }
              >
                {/* Default route after login */}
                <Route
                  index
                  element={<NavigateToResource fallbackTo='/dashboard' />}
                />

                <Route path='/dashboard' element={<Dashboard />} />

                <Route path='users'>
                  <Route index element={<UsersList />} />
                  <Route path='create' element={<UsersCreate />} />
                  <Route path='edit/:id' element={<UsersEdit />} />
                </Route>

                <Route path='subjects'>
                  <Route index element={<SubjectsList />} />
                  <Route path='create' element={<SubjectsCreate />} />
                  <Route path='edit/:id' element={<SubjectsEdit />} />
                </Route>

                <Route path='class-groups'>
                  <Route index element={<ClassGroupsList />} />
                  <Route path='create' element={<ClassGroupsCreate />} />
                </Route>

                <Route path='classes'>
                  <Route index element={<ClassesList />} />
                  <Route path='create' element={<ClassesCreate />} />
                  <Route path='edit/:id' element={<ClassesEdit />} />
                  <Route path='show/:id' element={<ClassesShow />} />
                </Route>

                <Route path='/enrollments' element={<EnrollmentList />} />
                <Route path='/enrollments/create' element={<EnrollmentsCreate />} />

                <Route path='announcements'>
                  <Route index element={<AnnouncementsList />} />
                  <Route path='create' element={<AnnouncementsCreate />} />
                </Route>

                <Route path='/profile' element={<ProfilePage />} />

                {/* Refine resource routes */}
                <Route path='/*' element={<Outlet />} />

                {/* Catch-all */}
                <Route path='*' element={<ErrorComponent />} />
              </Route>
    </Routes>
  );
}

export default App;
