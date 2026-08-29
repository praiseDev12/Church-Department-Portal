import { createContext, useContext, useState, useCallback } from 'react';
import { loadSession, saveSession, clearSession } from '../lib/session.js';

const AuthContext = createContext(null);
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

// One session for every role — member, unit_admin, main_admin. The
// backend issues one token type for everyone now; which UI a person
// sees is decided purely by user.role, not by which login page they used.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

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
