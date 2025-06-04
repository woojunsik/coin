import React from 'react';
import TopNav from '@/components/TopNav';
import TickerTable from '@/components/TickerTable';
import LoginSidebar from "@/pages/Auth/LoginSidebar";
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ 상단 네비게이션 */}
      <TopNav />

      {/* ✅ 시세판 + 로그인 + 콘텐츠 */}
      <div className="max-w-[1100px] mx-auto flex justify-center gap-6 px-4 pt-4">
        {/* 좌측: 시세판 + 콘텐츠 */}
        <div className="flex-[2] space-y-6">
          <TickerTable />
          <Outlet /> {/* 자유게시판 등 각 페이지 */}
        </div>

        {/* 우측: 로그인 영역 */}
        <div className="w-[260px]">
          <LoginSidebar />
        </div>
      </div>
    </div>
  );
};

export default Layout;
