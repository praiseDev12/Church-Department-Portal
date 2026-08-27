import { createContext, useContext, useState, useCallback } from 'react';
import {
  loadMemberSession,
  saveMemberSession,
  clearMemberSession,
} from '../lib/memberSession.js';

const MemberAuthContext = createContext(null);

export function MemberAuthProvider({ children }) {
  const [session, setSession] = useState(loadMemberSession);

  const login = useCallback((sessionData) => {
    saveMemberSession(sessionData);
    setSession(sessionData);
  }, []);

  const logout = useCallback(() => {
    clearMemberSession();
    setSession(null);
  }, []);

  const member = session?.member ?? null;
  const token = session?.token ?? null;

  return (
    <MemberAuthContext.Provider value={{ member, token, login, logout }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx)
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  return ctx;
}
