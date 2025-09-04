import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  userRole: string | null;
  userEmail: string | null;
  login: (data: { role: string; email?: string }) => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAuthSnapshot() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  return { isAuthenticated, userRole, userEmail };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ isAuthenticated, userRole, userEmail }, setAuth] = useState(getAuthSnapshot());

  const refresh = () => setAuth(getAuthSnapshot());

  const login: AuthContextValue['login'] = ({ role, email }) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    if (email) localStorage.setItem('userEmail', email);
    refresh();
    // Optional: dispatch a custom event for any listeners
    window.dispatchEvent(new Event('auth:refresh'));
  };

  const logout: AuthContextValue['logout'] = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    // Leave userEmail so we can still render it on the logout screen if desired, or clear it:
    // localStorage.removeItem('userEmail');
    refresh();
    window.dispatchEvent(new Event('auth:refresh'));
  };

  useEffect(() => {
    // Initial load
    refresh();

    // Cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated' || e.key === 'userRole' || e.key === 'userEmail' || e.key === null) {
        refresh();
      }
    };

    // Same-tab heuristics: route changes and focus/visibility
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const onCustom = () => refresh();

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('auth:refresh', onCustom as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('auth:refresh', onCustom as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    userRole: userRole ?? null,
    userEmail: userEmail ?? null,
    login,
    logout,
    refresh,
  }), [isAuthenticated, userRole, userEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
