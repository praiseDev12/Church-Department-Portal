import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { loadSession, saveSession, clearSession } from '../lib/session.js';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const navigate = useNavigate();

  const login = useCallback((sessionData) => {
    saveSession(sessionData);
    setSession(sessionData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const user = session?.user ?? null;
  const token = session?.token ?? null;

  const isMainAdmin = user?.role === 'main_admin';
  const isUnitAdmin = user?.role === 'unit_admin';
  const isAdmin = isMainAdmin || isUnitAdmin;
  const isMember = user?.role === 'member';

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.clear();
        navigate('/login');
      }
    } catch {
      // malformed token — clear it
      localStorage.clear();
      navigate('/login');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isMainAdmin,
        isUnitAdmin,
        isAdmin,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
