import { createContext, useContext, useState, useCallback } from 'react';
import { loadSession, saveSession, clearSession } from '../lib/session.js';

const AuthContext = createContext(null);
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  // Called with the full { token, user } response from /onboard or /login
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

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isMainAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
