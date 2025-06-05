import React from "react";
import { Link } from "react-router-dom";
import NotificationDropdown from "@/components/cccccccNotificationDropdown"; // ✅ 경로 확인

const TopNav = () => {
  return (
    <div className="border-b bg-white">
      {/* 🔵 상단: 로고 + 검색창 */}
      <div className="relative max-w-6xl mx-auto flex items-center px-6 pt-6 pb-3">
        {/* 🔹 로고 (왼쪽) */}
        <Link
          to="/"
          className="text-3xl lg:text-4xl font-extrabold text-blue-700 tracking-wider z-10"
        >
          AlphaDrop
        </Link>

        {/* 🔍 중앙 검색창 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-sm">
          <div className="flex items-center border border-blue-700 rounded overflow-hidden">
            <input
              type="text"
              placeholder="통합검색"
              className="w-full px-3 py-1 outline-none text-sm"
            />
            <button className="bg-blue-700 px-2.5 py-1 text-white">🔍</button>
          </div>
        </div>

        {/* 🔔 알림 드롭다운 (오른쪽) */}
        <div className="ml-auto">
          <NotificationDropdown />
        </div>
      </div>

      {/* 🔵 하단 메뉴바 (고정) */}
      <div className="bg-blue-800 text-white text-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-8 px-6 py-2">
          <Link to="/" className="hover:underline">
            홈
          </Link>
          <Link to="/notice" className="hover:underline">
            공지사항
          </Link>
          <Link to="/ranking" className="hover:underline">
            자산랭킹
          </Link>
          <Link to="/profit" className="hover:underline">
            수익 인증
          </Link>
          <Link to="/board" className="hover:underline">
            자유게시판
          </Link>

          <span className="ml-auto text-xs text-gray-300">
            어제 <span className="text-green-300 font-bold">919,743</span>개
            게시글 등록
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
