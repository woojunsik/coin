import { lazy } from 'react';

const NoticeWrite = lazy(() => import('@/pages/Notice/NoticeWrite'));
const NoticeEdit = lazy(() => import('@/pages/Notice/NoticeEdit'));
const NoticeDetail = lazy(() => import('@/pages/Notice/NoticeDetail'));

export const noticeRoutes = [
  {
    path: 'notice',
    children: [
      { path: 'write', element: <NoticeWrite /> },
      { path: 'edit/:id', element: <NoticeEdit /> },
      { path: ':id', element: <NoticeDetail /> }
    ]
  }
];
