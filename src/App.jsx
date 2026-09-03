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
import AuditLog from './pages/AuditLog.jsx';
import NotFound from './pages/NotFound.jsx';
import HandleCheckIn from './pages/HandleCheckIn.jsx';

// Dashboard routes — unit_admin or main_admin only. A plain member
// hitting these gets sent to their own portal instead of the login page,
// since they do have a valid session, just not this level of access.
function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (!isAdmin) return <Navigate to='/portal' replace />;
  return children;
}

function RequireMainAdmin({ children }) {
  const { isMainAdmin } = useAuth();
  if (!isMainAdmin) return <Navigate to='/' replace />;
  return children;
}

// The member portal — open to every signed-in account regardless of
// role, since admins are members too and can check in themselves.
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  return children;
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
        <Route path='/contributions' element={<Contributions />} />
        <Route path='/reports' element={<Reports />} />
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
        <Route
          path='/audit-log'
          element={
            <RequireMainAdmin>
              <AuditLog />
            </RequireMainAdmin>
          }
        />
      </Route>

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}
