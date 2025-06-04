// ✅ UserProfile.jsx (React Query 기반 자동 갱신 적용)

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "@/pages/context/UserContext";
import useProfileUpload from "@/hooks/useProfileUpload";
import FollowButton from "@/components/FollowButton";
import UserStatsWithModal from "@/components/UserStatsWithModal";
import InvestmentOverview from "@/components/investment/InvestmentOverview";
import { useQuery } from "@tanstack/react-query";

const UserProfile = () => {
  const { nickname } = useParams();
  const encodedNickname = encodeURIComponent(nickname.trim());

  const { user } = useUser();
  const { uploadProfile } = useProfileUpload();

  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    totalLikes: 0,
  });
  const [activeTab, setActiveTab] = useState("posts");

  // ✅ 투자 정보 fetch 함수 (React Query)
  const fetchInvestment = async () => {
    if (!userId) return null;
    const { data } = await axios.get(`/api/investment/${userId}`);
    const { dailyAssets, rank, totalAssets, exchanges, assets } = data;
    return {
      userId,
      dailyAssets,
      rank,
      totalAssets,
      exchanges: Array.isArray(exchanges)
        ? exchanges.flat().filter((v, i, a) => v && a.indexOf(v) === i)
        : [exchanges],
      coins: Object.values(
        (assets || []).reduce((acc, coin) => {
          if (!coin?.currency) return acc;
          if (!acc[coin.currency]) acc[coin.currency] = { ...coin };
          else {
            acc[coin.currency].balance += coin.balance;
            acc[coin.currency].krw += coin.krw;
          }
          return acc;
        }, {})
      ),
    };
  };

  const { data: investmentData, refetch: refreshInvestment } = useQuery({
    queryKey: ["investment", userId],
    queryFn: fetchInvestment,
    enabled: !!userId,
    
  });

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    setIsOwner(storedNickname === nickname);

    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`/api/user/${encodedNickname}`);
        const uid = userRes.data._id;
        setUserId(uid);
        setOtherUserProfile(userRes.data.profile);

        const boardRes = await axios.get(`/api/board`);
        const myPosts = boardRes.data.filter((post) => {
          const writerId =
            typeof post.writer === "object" ? post.writer._id : post.writer;
          return String(writerId) === String(uid);
        });
        setPosts(myPosts);

        const commentList = [];
        for (const post of boardRes.data) {
          const full = await axios.get(`/api/board/${post._id}`);
          (full.data.comments || []).forEach((c) => {
            const writerId =
              typeof c.writer === "object" ? c.writer._id : c.writer;
            if (String(writerId) === String(uid)) {
              commentList.push({
                content: c.content,
                likes: c.likes || 0,
                createdAt: c.createdAt,
                postTitle: post.title,
                postId: post._id,
              });
            }
          });
        }
        setComments(commentList);

        const statRes = await axios.get(`/api/user/${encodedNickname}/stats`);
        setStats(statRes.data);
      } catch (err) {
        console.error("유저 데이터 로드 실패:", err);
      }
    };

    fetchUserData();
  }, [nickname]);

  const displayedProfile = isOwner
    ? user?.profile || "/default-profile.png"
    : otherUserProfile || "/default-profile.png";

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;
    const result = await uploadProfile(file, userId);
    if (!result.success) alert(result.message || "프로필 변경 실패");
  };

  const handleFollowChange = async () => {
    try {
      const res = await axios.get(`/api/user/${encodedNickname}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("팔로우 통계 갱신 실패:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <img
              src={displayedProfile}
              alt="프로필"
              className="w-20 h-20 rounded-full border object-cover"
            />
            {isOwner && (
              <label className="absolute bottom-0 right-0 bg-gray-400 hover:bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M4 7h2l2-3h8l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm8 10a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{nickname}</h2>
            <UserStatsWithModal
              followers={stats.followers}
              following={stats.following}
              totalLikes={stats.totalLikes}
              userId={userId}
            />
          </div>
        </div>
        {!isOwner && userId && (
          <FollowButton targetId={userId} onToggleFollow={handleFollowChange} />
        )}
      </div>

      <div className="flex gap-4 border-b mb-6">
        {["posts", "comments", "investments"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 transition-all duration-200 ${
              activeTab === tab
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-400"
            }`}
          >
            {tab === "posts" && `📄 작성한 게시글 (${posts.length})`}
            {tab === "comments" && `💬 작성한 댓글 (${comments.length})`}
            {tab === "investments" && `📊 투자현황`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === "posts" &&
          posts.map((post) => (
            <div
              key={post._id}
              className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <Link
                to={`/board/${post._id}`}
                className="text-blue-600 font-semibold hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-xs text-gray-400 mt-1">
                작성일: {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          ))}

        {activeTab === "comments" &&
          comments.map((c, i) => (
            <div key={i} className="p-4 border rounded-lg bg-gray-50 text-sm">
              <p className="text-gray-800">{c.content}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>
                  📌 관련 글:{" "}
                  <Link
                    to={`/board/${c.postId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {c.postTitle}
                  </Link>
                </span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}

        {activeTab === "investments" && investmentData && (
          <InvestmentOverview
            data={investmentData}
            onRefresh={refreshInvestment}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
