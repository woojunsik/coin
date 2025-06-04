import React from "react";

const TopThreeCard = ({ users = [] }) => {
  if (users.length === 0) return null;

  const [first, second, third] = users;

  const Card = ({ user, rank }) => (
    <div className="flex flex-col items-center px-4">
      <div
        className={`w-20 h-20 rounded-full border-4 ${
          rank === 1
            ? "border-yellow-400"
            : rank === 2
            ? "border-gray-400"
            : "border-orange-400"
        } overflow-hidden`}
      >
        <img
          src={user?.profile || "/default-profile.png"}
          alt={user?.nickname}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-2 text-sm font-semibold">
        {user?.nickname || "익명"}
      </div>
      <div className="text-xs text-gray-500">
        ₩ {Math.floor(user.totalKRW || 0).toLocaleString("ko-KR")}
      </div>
    </div>
   
  );

  return (
    <div className="flex justify-center items-end gap-6 mb-8">
      {third && <Card user={third} rank={3} />}
      {first && <Card user={first} rank={1} />}
      {second && <Card user={second} rank={2} />}
    </div>
    
  );
};

export default TopThreeCard;
