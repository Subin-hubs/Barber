import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RequireAdmin = ({ children }) => {
  const { user, claims, loading } = useAuth();

  if (loading) return null;

  if (!user || claims?.role !== 'admin') {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
};
