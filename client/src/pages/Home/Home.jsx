import React from 'react';
import CryptoHotNews from '@/components/CryptoHotNews';
import HotBoardPreview from '@/components/HotBoardPreview';

const Home = () => {
  return (
    <div className="space-y-6">
      {/* 🔥 핫 뉴스 */}
      <CryptoHotNews />

      {/* 📝 자유게시판 인기글 미리보기 */}
      <HotBoardPreview />
    </div>
  );
};

export default Home;
