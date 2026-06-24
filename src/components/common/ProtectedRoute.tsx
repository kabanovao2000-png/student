import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated, getUser } from '../../utils/auth';
import type { UserRole } from '../../types/user';

interface Props {
  children: ReactNode;
  role: UserRole;
}

export const ProtectedRoute = ({ children, role }: Props) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (user?.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};