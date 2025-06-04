// ✅ MyPage.jsx (lastUpdatedAt 기반 자동 반영)
import React, { useEffect, useState } from "react";
import axios from "axios";
import useProfileUpload from "@/hooks/useProfileUpload";
import ExchangeManager from "@/components/exchange/ExchangeManager";
import UserStatsWithModal from "@/components/UserStatsWithModal";
import MyActivityList from "@/components/activity/MyActivityList";
import { useUser } from "@/pages/context/UserContext";
import InvestmentOverview from "@/components/investment/InvestmentOverview";
import { useQuery } from "@tanstack/react-query";

const MyPage = () => {
  const { user, setUser } = useUser();
  const { uploadProfile } = useProfileUpload();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPosts, setShowPosts] = useState("");
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/";
      }, 2000);
    }
  }, [success]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/user/${user.nickname}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("통계 정보 불러오기 실패:", err);
      }
    };
    if (user?.nickname) fetchStats();
  }, [user]);

  const fetchInvestmentData = async () => {
    const { data } = await axios.get(`/api/investment/${user._id}`);
    const {
      dailyAssets,
      dailyAssetsByExchange,
      rank,
      totalAssets,
      exchanges,
      assets,
      lastUpdatedAt,
    } = data;
    return {
      userId: user._id,
      dailyAssets,
      dailyAssetsByExchange,
      rank,
      totalAssets,
      lastUpdatedAt,
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
    queryKey: ["investment", user._id],
    queryFn: fetchInvestmentData,
    enabled: !!user._id,
  });

  const validatePassword = (value) => {
    const pwReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    setPwError(
      pwReg.test(value)
        ? ""
        : "비밀번호는 특수문자, 대소문자 포함 8자 이상이어야 합니다."
    );
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?._id) return;

    const result = await uploadProfile(file, user._id);
    if (!result.success) return alert(result.message || "프로필 변경 실패");

    const token = localStorage.getItem("token");
    const refreshed = await axios.get("/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(refreshed.data);
    localStorage.setItem("user", JSON.stringify(refreshed.data));
    alert("프로필이 변경되었습니다.");
  };

  const handlePasswordChange = async () => {
    try {
      await axios.post(
        "/api/auth/change-password",
        { id: user._id || user.id, currentPassword, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setPwError("");
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "비밀번호 변경 실패");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-600">
        로그인이 필요합니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">마이페이지</h2>

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "activity"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("activity")}
        >
          나의 활동
        </button>
        <button
          className={`ml-4 px-4 py-2 font-medium border-b-2 ${
            activeTab === "exchange"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("exchange")}
        >
          거래소 등록
        </button>
        <button
          className={`ml-4 px-4 py-2 font-medium border-b-2 ${
            activeTab === "investments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("investments")}
        >
          📊 투자현황
        </button>
      </div>

      {activeTab === "activity" && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              <span className="text-lg font-bold text-black">
                {user.nickname}님
              </span>
              과 함께한 지{" "}
              <span className="text-lg font-bold text-black">
                {user.createdAt
                  ? Math.floor(
                      (Date.now() - new Date(user.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    ) + 1
                  : "0"}
                일
              </span>{" "}
              째 입니다.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">
                주기적으로 비밀번호 변경을 권장합니다.
              </span>
              <button
                onClick={() => {
                  setShowPasswordForm((prev) => !prev);
                  setShowPosts("");
                }}
                className="text-blue-600 font-medium hover:underline"
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20">
                <img
                  src={user.profile || "/default-profile.png"}
                  alt="프로필"
                  className="w-20 h-20 rounded-full border object-cover"
                />
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
              </div>
              <div className="mt-2">
                <UserStatsWithModal
                  followers={stats.followers}
                  following={stats.following}
                  totalLikes={stats.totalLikes}
                  userId={user._id}
                />
              </div>
            </div>

            <div className="w-[450px] border rounded p-2 divide-y divide-gray-200 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">이메일</span>
                <span className="text-right truncate">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">가입일자</span>
                <span className="text-right">
                  {user.createdAt && !isNaN(new Date(user.createdAt))
                    ? new Date(user.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })
                    : "없음"}
                </span>
              </div>
              {["written", "comments", "liked"].map((type) => (
                <div
                  key={type}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-gray-500">
                    {type === "written"
                      ? "내가 쓴 글"
                      : type === "comments"
                      ? "내가 쓴 댓글"
                      : "좋아요 한 글"}
                  </span>
                  <button
                    onClick={() => {
                      setShowPosts(type);
                      setShowPasswordForm(false);
                    }}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    보기
                  </button>
                </div>
              ))}
            </div>
          </div>

          {showPosts && <MyActivityList type={showPosts} userId={user._id} />}

          {showPasswordForm && (
            <div className="mt-4">
              <label className="block mb-1 font-medium">기존 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              <label className="block mt-3 mb-1 font-medium">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewPassword(val);
                  validatePassword(val);
                }}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              {pwError && (
                <p className="text-red-500 text-xs mt-1">{pwError}</p>
              )}
              <button
                onClick={handlePasswordChange}
                disabled={!!pwError || !newPassword}
                className={`mt-3 px-4 py-1 rounded text-sm text-white ${
                  pwError || !newPassword
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                비밀번호 변경
              </button>
              {message && (
                <p className="text-sm mt-2 text-red-500">{message}</p>
              )}
              {success && (
                <p className="text-green-600 text-sm mt-1">
                  ✅ 비밀번호가 변경되었습니다. 잠시 후 로그아웃됩니다...
                </p>
              )}
            </div>
          )}

          <div className="mt-8 text-right">
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}

      {activeTab === "exchange" && (
        <div className="bg-white shadow rounded-lg p-6">
          <ExchangeManager onUpdate={refreshInvestment} />
        </div>
      )}

      {activeTab === "investments" && (
        <InvestmentOverview
          data={investmentData}
          onRefresh={refreshInvestment}
        />
      )}
    </div>
  );
};

export default MyPage;
