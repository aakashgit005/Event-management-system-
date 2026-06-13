import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user = null;

  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  }

  // If not logged in, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If route is restricted by role and user doesn't match, redirect to home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
