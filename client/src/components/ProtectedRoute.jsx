import React from 'react';
import { Navigate } from 'react-router-dom';

// ✅ 로그인 여부 확인 후 접근 제어
const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem('user');
  const isAuthenticated = !!storedUser;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
