import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300 font-sans text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          Verifying Permissions...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ROLE_PASSENGER') return <Navigate to="/passenger" replace />;
    if (user.role === 'ROLE_DRIVER') return <Navigate to="/driver" replace />;
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
