import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserStatsWithModal = ({ followers, following, totalLikes, userId }) => {
  const { nickname } = useParams();
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followType, setFollowType] = useState('followers');
  const [followList, setFollowList] = useState([]);

  useEffect(() => {
    setShowFollowModal(false); // 프로필 전환 시 모달 자동 닫기
  }, [nickname]);

  const openFollowModal = async (type) => {
    setShowFollowModal(false);
    setFollowList([]);
    setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/follow/${type}/${userId}`);
        setFollowList(res.data);
        setFollowType(type);
        setShowFollowModal(true);
      } catch (err) {
        console.error(`${type} 목록 불러오기 실패`, err);
      }
    }, 50);
  };

  return (
    <>
      {/* 📊 통계 가로 정렬 UI */}
      <div className="flex justify-between w-full max-w-xs text-center text-sm text-gray-600 mt-2 whitespace-nowrap">
        <button
          onClick={() => openFollowModal('followers')}
          className="flex-1 hover:bg-gray-100 rounded-lg py-1 transition"
        >
          <p className="text-xs text-gray-400">팔로워</p>
          <p className="font-semibold text-gray-800">{followers}</p>
        </button>
        <div className="border-l mx-2 h-full" />
        <button
          onClick={() => openFollowModal('following')}
          className="flex-1 hover:bg-gray-100 rounded-lg py-1 transition"
        >
          <p className="text-xs text-gray-400">팔로잉</p>
          <p className="font-semibold text-gray-800">{following}</p>
        </button>
        <div className="border-l mx-2 h-full" />
        <div className="flex-1 hover:bg-gray-100 rounded-lg py-1 transition cursor-default">
          <p className="text-xs text-gray-400">좋아요</p>
          <p className="font-semibold text-gray-800">{totalLikes}</p>
        </div>
      </div>

      {/* 👥 팔로워/팔로잉 모달 */}
      {showFollowModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
    onClick={() => setShowFollowModal(false)} // 바깥 영역 클릭 시 닫기
  >
    <div
      className="bg-white p-6 rounded-xl w-96 max-h-[60vh] overflow-y-auto shadow-xl"
      onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
    >
      <h3 className="text-lg font-bold mb-4">
        {followType === 'followers' ? '팔로워 목록' : '팔로잉 목록'}
      </h3>
      {followList.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          아직 {followType === 'followers' ? '팔로워가 없어요.' : '팔로잉한 유저가 없어요.'}
        </p>
      ) : (
        followList.map(user => (
          <div key={user._id} className="flex items-center gap-3 border-b py-2">
            <img src={user.profile || '/default-profile.png'} alt="프로필" className="w-8 h-8 rounded-full" />
            <a
              href={`/user/${encodeURIComponent(user.nickname)}`}
              className="text-blue-600 hover:underline"
            >
              {user.nickname}
            </a>
          </div>
        ))
      )}
      <button
        onClick={() => setShowFollowModal(false)}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded"
      >
        닫기
      </button>
    </div>
  </div>
)}

    </>
  );
};

export default UserStatsWithModal;
