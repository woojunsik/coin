import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '@/pages/context/UserContext';
import UserStatsWithModal from '@/components/UserStatsWithModal';

const LoginSidebar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // ✅ 전역 유저 상태 사용

  const [form, setForm] = useState({ id: '', password: '' });
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    totalLikes: 0,
  });

  // ✅ 1. 마운트 시 유저 정보 불러오기 (자동 로그인)
useEffect(() => {
  const syncUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // ✅ 토큰 없으면 요청 안 보냄

    try {
      const res = await axios.get('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('유저 정보 동기화 실패:', err.message);
    }
  };

  syncUser();
}, []);


  // ✅ 2. 유저가 변경될 때마다 통계 갱신
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.nickname) return;

      try {
        const res = await axios.get(`/api/user/${user.nickname}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error('통계 불러오기 실패:', err.message);
      }
    };

    fetchStats();
  }, [user]);

  // ✅ 로그아웃 처리
  const handleLogout = () => {
    setForm({ id: '', password: '' });
    setError('');
    setUser(null);
    localStorage.clear();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  // ✅ 로그인 폼 입력 변경
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 로그인 시도
  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', form);
      const userData = res.data.user;
      const token = res.data.token;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('nickname', userData.nickname || userData.id);
      localStorage.setItem('userId', userData._id);

      setUser(userData);

      alert(`${userData.nickname}님 환영합니다!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인 실패');
      setForm({ id: '', password: '' });
    }
  };

  // ✅ 로그인된 상태
  if (user) {
    return (
      <div className="bg-white p-4 rounded shadow-md text-sm flex flex-col space-y-2">
        <div className="flex items-center space-x-4 w-full">
          <img
            src={user.profile || '/default-profile.png'}
            alt="프로필"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold">{user.nickname}님</p>
            <div className="flex space-x-6 text-gray-600 text-sm font-medium whitespace-nowrap">
              <UserStatsWithModal
                followers={stats.followers}
                following={stats.following}
                totalLikes={stats.totalLikes}
                userId={user?._id}
              />
            </div>
          </div>
        </div>

        {/* ✅ 마이페이지 및 로그아웃 (가로 배치) */}
        <div className="flex justify-center gap-4 pt-2 border-t mt-2">
          <Link
            to="/mypage"
            className="text-blue-600 text-sm hover:underline transition"
          >
            마이페이지
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-500 text-sm hover:underline transition"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // ✅ 로그인 폼 화면
  return (
    <div className="bg-white p-4 rounded shadow-md text-sm space-y-4">
      <h3 className="text-center font-bold text-lg">로그인</h3>

      <input
        name="id"
        value={form.id}
        onChange={onChange}
        placeholder="아이디"
        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="비밀번호"
        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && (
        <p className="text-red-500 text-xs text-center">{error}</p>
      )}

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        로그인
      </button>

      <div className="flex justify-between text-xs text-gray-600 px-1">
        <Link to="/find-account" className="hover:underline transition">
          아이디 찾기
        </Link>
        <Link to="/reset-password" className="hover:underline transition">
          비밀번호 찾기
        </Link>
        <Link to="/register" className="hover:underline transition">
          회원가입
        </Link>
      </div>
    </div>
  );
};

export default LoginSidebar;
