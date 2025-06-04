import React, { useEffect, useState } from 'react';
import axios from 'axios';

import RankingTabs from '@/components/ranking/RankingTabs';
import TopThreeCard from '@/components/ranking/TopThreeCard';
import Top100List from '@/components/ranking/Top100List';

const RankingPage = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState('all'); // 탭 선택 상태

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await axios.get(`/api/ranking/${selected}`);
        console.log('[🔥 데이터 확인]', res.data);
        setUsers(res.data || []); // fallback 처리
      } catch (err) {
        console.error('[랭킹 불러오기 실패]', err);
        setUsers([]); // 에러시 비우기
      }
    };
    fetchRanking();
  }, [selected]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(0, 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">📊 자산 랭킹</h1>
      <RankingTabs selected={selected} onChange={setSelected} />
      <TopThreeCard users={top3} />
      <Top100List users={rest} />
    </div>
  );
};

export default RankingPage;
