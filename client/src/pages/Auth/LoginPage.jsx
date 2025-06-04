import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  // ✅ 로그인 폼 상태
  const [form, setForm] = useState({ id: '', password: '' });
  const [error, setError] = useState('');

  // ✅ 입력값 변경 핸들러
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 로그인 요청 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 🔐 로그인 API 요청
      const res = await axios.post('/api/auth/login', form);
      const user = res.data.user;

      // ✅ 1. 전체 사용자 객체는 JSON으로 저장 (마이페이지 등에서 사용됨)
      localStorage.setItem('user', JSON.stringify(user));

      // ✅ 2. 닉네임은 문자열로 별도 저장 (게시판 작성자용)
      // - BoardWrite.jsx 등에서 writer = nickname 으로 사용
      localStorage.setItem('nickname', user.nickname || user.id);

      alert(`${user.nickname}님 환영합니다!`);
      window.location.href = '/'; // 홈 또는 메인페이지로 리다이렉트
    } catch (err) {
      const msg = err.response?.data?.message || '로그인 실패';
      setError(msg);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white shadow p-6 rounded text-sm">
      <h2 className="text-xl font-bold mb-4 text-center">로그인</h2>

      {/* ✅ 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 🔸 아이디 입력 */}
        <div>
          <label className="block mb-1 font-medium">아이디</label>
          <input
            type="text"
            name="id"
            value={form.id}
            onChange={onChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 🔸 비밀번호 입력 */}
        <div>
          <label className="block mb-1 font-medium">비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* 🔸 에러 메시지 출력 */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* 🔸 로그인 버튼 */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          로그인
        </button>
      </form>

      {/* 🔹 아이디/비번 찾기 링크 */}
      <div className="text-center mt-4">
        <Link to="/find-account" className="text-blue-600 text-sm hover:underline">
          아이디 / 비밀번호 찾기
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
