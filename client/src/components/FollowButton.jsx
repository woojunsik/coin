import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/pages/context/UserContext'; // ✅ 전역 유저 상태 접근

const FollowButton = ({ targetId, onToggleFollow }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [valid, setValid] = useState(true);

  const { refreshUserStats } = useUser(); // ✅ 팔로우 후 로그인사이드바 통계 동기화

  // ✅ JWT에서 유저 ID 추출
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !token.includes('.') || token.split('.').length !== 3) {
      console.warn('유효하지 않은 토큰, FollowButton 렌더링 생략');
      setValid(false);
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decoded);
      setUserId(payload.id);
    } catch (e) {
      console.error('토큰 파싱 실패', e);
      setValid(false);
    }
  }, []);

  // ✅ 현재 팔로잉 여부 확인
  useEffect(() => {
    if (!userId || !targetId || userId === targetId) return;

    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`/api/follow/following/${userId}`);
        const isFollowed = res.data.some((user) => user._id === targetId);
        setIsFollowing(isFollowed);
      } catch (err) {
        console.error('[팔로우 확인 실패]', err.message);
      }
    };

    fetchFollowing();
  }, [userId, targetId]);

  // ✅ 팔로우/언팔로우 실행
  const toggleFollow = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      if (isFollowing) {
        await axios.delete(`/api/follow/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/follow/${targetId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsFollowing(!isFollowing);

      // ✅ 외부 콜백 실행 (UserProfile의 통계 갱신)
      if (onToggleFollow) onToggleFollow();

      // ✅ 로그인 사이드바 통계 동기화
      await refreshUserStats();

    } catch (err) {
      alert('팔로우 처리 실패');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 본인 대상일 경우 버튼 비노출
  if (!valid || userId === targetId) return null;

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`text-sm px-3 py-1 rounded border ${
        isFollowing
          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
      }`}
    >
      {loading ? '처리 중...' : isFollowing ? '팔로잉 취소' : '팔로우'}
    </button>
  );
};

export default FollowButton;
