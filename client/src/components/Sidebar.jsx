import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTrophy, FaBullhorn, FaCoins, FaComments, FaUser } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menu = [
    { to: '/', label: '홈', icon: <FaHome /> },
    { to: '/ranking', label: '자산 랭킹', icon: <FaTrophy /> },
    { to: '/notice', label: '공지사항', icon: <FaBullhorn /> },
    { to: '/profit', label: '수익 인증', icon: <FaCoins /> },
    { to: '/board', label: '자유게시판', icon: <FaComments /> },
    { to: '/mypage', label: '마이페이지', icon: <FaUser /> },
  ];

  return (
    <aside className="w-56 h-screen bg-white shadow fixed top-0 left-0 z-40 hidden md:block">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-6">AlphaDrop</h2>
        <nav className="space-y-4">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-100 transition ${
                currentPath === item.to ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
