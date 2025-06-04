// 📁 pages/context/UserContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // ✅ 1. localStorage에서 초기값 불러오기
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // ✅ 2. 서버에서 유저 정보 다시 받아오기 (자동 로그인 or 갱신)
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('유저 갱신 실패:', err);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // ✅ 3. 로그인사이드바 통계만 새로 받아오기
  const refreshUserStats = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user?.nickname) return;

    try {
      const res = await axios.get(`/api/user/${user.nickname}/stats`);
      const updated = {
        ...user,
        followers: res.data.followers,
        following: res.data.following,
        totalLikes: res.data.totalLikes,
      };

      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (err) {
      console.error('통계 갱신 실패:', err);
    }
  };

  // ✅ 4. 앱 시작 시 자동 로그인 시도
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, refreshUserStats }}>
      {children}
    </UserContext.Provider>
  );
};
