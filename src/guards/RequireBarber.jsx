import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RequireBarber = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user || (role !== 'admin' && role !== 'barber')) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
};
