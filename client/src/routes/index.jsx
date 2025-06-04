// === client/src/routes/index.jsx ===
import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import Layout from '@/components/Layout';

import { authRoutes } from '@/routes/authRoutes';
import { boardRoutes } from '@/routes/boardRoutes';
import { noticeRoutes } from '@/routes/noticeRoutes';
import { userRoutes } from '@/routes/userRoutes';
import { rankingRoutes } from '@/routes/rankingRoutes';
import { etcRoutes } from '@/routes/etcRoutes';

const AppRoutes = () => {
  const element = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        ...authRoutes,
        ...boardRoutes,
        ...noticeRoutes,
        ...userRoutes,
        ...rankingRoutes,
        ...etcRoutes
      ]
    }
  ]);

  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
};

export default AppRoutes;
