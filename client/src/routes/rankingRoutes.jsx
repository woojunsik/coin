import { lazy } from 'react';

const RankingPage = lazy(() => import('@/pages/Ranking/RankingPage'));

export const rankingRoutes = [
  { path: 'ranking', element: <RankingPage /> }
];
