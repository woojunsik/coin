import { lazy } from 'react';

const MyPage = lazy(() => import('@/pages/User/MyPage'));
const UserProfile = lazy(() => import('@/pages/User/UserProfile'));


export const userRoutes = [
  { path: 'mypage', element: <MyPage /> },
  { path: 'user/:nickname', element: <UserProfile /> }
];
