import { lazy } from 'react';

const Home = lazy(() => import('@/pages/Home/Home'));
const EconomyNews = lazy(() => import('@/pages/EconomyNews'));
const FindAccountPage = lazy(() => import('@/pages/FindAccountPage'));
const FindIdForm = lazy(() => import('@/pages/FindIdForm'));

export const etcRoutes = [
  { index: true, element: <Home /> },
  { path: 'news', element: <EconomyNews /> },
  { path: 'find-account', element: <FindAccountPage /> },
  { path: 'find-id', element: <FindIdForm /> }
];
