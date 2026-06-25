import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../utils/auth';
import type { UserRole } from '../../types/user';

interface Props {
  children: React.ReactNode;
  role: UserRole;
}

export const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (getUserRole() !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};