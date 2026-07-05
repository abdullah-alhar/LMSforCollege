import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin, requireSuperAdmin }) => {
  const { user } = useAuth();

  if (!user) {
    // First visit in this browser session → show splash screen
    // Subsequent visits (back button, refresh) → go straight to login
    const splashShown = sessionStorage.getItem('splashShown');
    return <Navigate to={splashShown ? '/login' : '/splash'} replace />;
  }

  if (requireAdmin && user.role === 'STUDENT') {
    return <Navigate to="/" replace />;
  }
  if (requireSuperAdmin && !user.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
