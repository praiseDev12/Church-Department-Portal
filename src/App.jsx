import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useMemberAuth } from './context/MemberAuthContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Onboard from './pages/Onboard.jsx';
import UnitHeadSignup from './pages/UnitHeadSignup.jsx';
import MemberRegister from './pages/MemberRegister.jsx';
import MemberLogin from './pages/MemberLogin.jsx';
import MemberHome from './pages/MemberHome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import CheckIn from './pages/CheckIn.jsx';
import Contributions from './pages/Contributions.jsx';
import Reports from './pages/Reports.jsx';
import Units from './pages/Units.jsx';
import AuditLog from './pages/AuditLog.jsx';
import NotFound from './pages/NotFound.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login-admin' replace />;
  return children;
}

function RequireMainAdmin({ children }) {
  const { isMainAdmin } = useAuth();
  if (!isMainAdmin) return <Navigate to='/' replace />;
  return children;
}

function RequireMemberAuth({ children }) {
  const { member } = useMemberAuth();
  if (!member) return <Navigate to='/member-login' replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path='/login-admin' element={<Login />} />
      <Route path='/onboard' element={<Onboard />} />
      <Route path='/unit-head-signup' element={<UnitHeadSignup />} />
      <Route path='/register' element={<MemberRegister />} />
      <Route path='/member-login' element={<MemberLogin />} />

      <Route
        path='/portal'
        element={
          <RequireMemberAuth>
            <MemberHome />
          </RequireMemberAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
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
