import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RequireBarber = ({ children }) => {
  const { user, claims, loading } = useAuth();

  if (loading) return null;

  if (!user || !['admin', 'barber'].includes(claims?.role)) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
};
