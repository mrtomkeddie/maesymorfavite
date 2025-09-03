import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export type AllowedRole = 'parent' | 'admin' | 'teacher';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AllowedRole[];
  redirectTo: string;
}

export default function ProtectedRoute({ children, allowedRoles, redirectTo }: ProtectedRouteProps) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = (localStorage.getItem('userRole') || '') as AllowedRole | '';

    setAuthorized(Boolean(isAuthenticated) && allowedRoles.includes(userRole as AllowedRole));
    setReady(true);
  }, [location.pathname, allowedRoles]);

  if (!ready) return null;

  if (!authorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}