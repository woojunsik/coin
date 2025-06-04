import { lazy } from 'react';

const FreeBoard = lazy(() => import('@/pages/Board/FreeBoard'));
const BoardWrite = lazy(() => import('@/pages/Board/BoardWrite'));
const BoardEdit = lazy(() => import('@/pages/Board/BoardEdit'));
const BoardDetail = lazy(() => import('@/pages/Board/BoardDetail'));
const NoticeBoard = lazy(() => import('@/pages/Board/NoticeBoard'));


export const boardRoutes = [
  {
    path: 'board',
    children: [
      { index: true, element: <FreeBoard /> },
      { path: 'write', element: <BoardWrite /> },
      { path: 'edit/:id', element: <BoardEdit /> },
      { path: ':id', element: <BoardDetail /> }
    ]
  },
  {
    path: 'notice',
    element: <NoticeBoard />
  }
];
