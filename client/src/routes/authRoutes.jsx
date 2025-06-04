import { lazy } from 'react';

const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const LoginSidebar = lazy(() => import('@/pages/Auth/LoginSidebar'));
const RegisterPage = lazy(() => import('@/pages/Auth/RegisterPage'));
const EmailVerifySuccess = lazy(() => import('@/pages/Auth/EmailVerifySuccess'));
const ResetPasswordPage = lazy(() => import('@/pages/Auth/ResetPasswordPage'));


export const authRoutes = [
  { path: 'login', element: <LoginPage /> },
  { path: 'loginsidebar', element: <LoginSidebar /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'verify-success', element: <EmailVerifySuccess /> },
  { path: 'reset-password', element: <ResetPasswordPage /> }
];
