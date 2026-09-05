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

// checks for authentication and admin privileges before rendering the children components
function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (!isAdmin) return <Navigate to='/portal' replace />;
  return children;
}

// checks for authentication and main admin privileges before rendering the children components
function RequireMainAdmin({ children }) {
  const { isMainAdmin } = useAuth();
  if (!isMainAdmin) return <Navigate to='/' replace />;
  return children;
}

// checks for authentication before rendering the children components
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  return children;
}

// renders the appropriate layout based on the user's admin status
function CheckInShell() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AppLayout /> : <MemberLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/onboard' element={<Onboard />} />
      <Route path='/register' element={<MemberRegister />} />

      <Route
        element={
          <RequireAuth>
            <MemberLayout />
          </RequireAuth>
        }
      >
        <Route path='/portal' element={<MemberHome />} />
        <Route path='/profile' element={<ProfileSettings />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <CheckInShell />
          </RequireAuth>
        }
      >
        <Route path='/check-in' element={<CheckIn />} />
      </Route>

      <Route
        element={
          <RequireAdmin>
            <AppLayout />
          </RequireAdmin>
        }
      >
        <Route path='/' element={<Dashboard />} />
        <Route path='/members' element={<Members />} />
        <Route path='/check-in' element={<CheckIn />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/attendance' element={<AttendanceReport />} />

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

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}
