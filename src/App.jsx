import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext.jsx';

import AppLayout from './components/layout/AppLayout.jsx';

import MemberLayout from './components/layout/MemberLayout.jsx';

import Login from './pages/Login.jsx';

import Onboard from './pages/Onboard.jsx';

import MemberRegister from './pages/MemberRegister.jsx';

import MemberHome from './pages/MemberHome.jsx';

import ProfileSettings from './pages/ProfileSettings.jsx';

import Dashboard from './pages/Dashboard.jsx';

import Members from './pages/Members.jsx';

import CheckIn from './pages/CheckIn.jsx';

import Contributions from './pages/Contributions.jsx';

import Reports from './pages/Reports.jsx';

import Units from './pages/Units.jsx';

import NotFound from './pages/NotFound.jsx';

import HandleCheckIn from './pages/HandleCheckIn.jsx';

import AttendanceReport from './pages/AttendanceReport.jsx';

import ForgotPassword from './pages/ForgotPassword.jsx';

import ResetPassword from './pages/ResetPassword.jsx';
import MemberContributions from './pages/MemberContributions.jsx';
import MemberAttendance from './pages/MembersAttendance.jsx';

// Checks for authentication and admin privileges
function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (!isAdmin) {
    return <Navigate to='/portal' replace />;
  }

  return children;
}

// Checks for authentication and main admin privileges
function RequireMainAdmin({ children }) {
  const { isMainAdmin } = useAuth();

  if (!isMainAdmin) {
    return <Navigate to='/' replace />;
  }

  return children;
}

// Checks for authentication
function RequireAuth({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return children;
}

// Chooses the correct layout for the shared Check-In page
function CheckInShell() {
  const { isAdmin } = useAuth();

  return isAdmin ? <AppLayout /> : <MemberLayout />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path='/login' element={<Login />} />

      <Route path='/onboard' element={<Onboard />} />

      <Route path='/register' element={<MemberRegister />} />

      <Route path='/forgot-password' element={<ForgotPassword />} />

      <Route path='/reset-password/:token' element={<ResetPassword />} />

      {/* Member-only routes */}
      <Route
        element={
          <RequireAuth>
            <MemberLayout />
          </RequireAuth>
        }
      >
        <Route path='/portal' element={<MemberHome />} />
        <Route path='/profile' element={<ProfileSettings />} />
        <Route path='/portal/contributions' element={<MemberContributions />} />
        <Route path='/portal/attendance' element={<MemberAttendance />} />
        <Route path='/profile' element={<ProfileSettings />} />
      </Route>

      {/* Shared Check-In route */}
      <Route
        path='/check-in'
        element={
          <RequireAuth>
            <CheckInShell />
          </RequireAuth>
        }
      >
        <Route index element={<CheckIn />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <RequireAdmin>
            <AppLayout />
          </RequireAdmin>
        }
      >
        <Route path='/' element={<Dashboard />} />

        <Route path='/members' element={<Members />} />

        <Route path='/attendance' element={<AttendanceReport />} />

        <Route
          path='/reports'
          element={
            <RequireMainAdmin>
              <Reports />
            </RequireMainAdmin>
          }
        />

        <Route
          path='/contributions'
          element={
            <RequireMainAdmin>
              <Contributions />
            </RequireMainAdmin>
          }
        />

        <Route
          path='/units'
          element={
            <RequireMainAdmin>
              <Units />
            </RequireMainAdmin>
          }
        />

        <Route
          path='/admin-checkin'
          element={
            <RequireMainAdmin>
              <HandleCheckIn />
            </RequireMainAdmin>
          }
        />
      </Route>

      {/* Not found */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}
