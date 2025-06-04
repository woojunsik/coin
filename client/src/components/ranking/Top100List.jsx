import React from "react";

const Top100List = ({ users = [] }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">순위</th>
            <th className="px-4 py-2 text-left">닉네임</th>
            <th className="px-4 py-2 text-left">보유코인</th>
            <th className="px-4 py-2 text-right">총 보유자산 (₩)</th>
            <th className="px-4 py-2 text-center">보기</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2 font-medium flex items-center gap-2">
                {user.profile && (
                  <img
                    src={user.profile}
                    alt="프로필"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                {user.nickname || "익명"}
              </td>
              <td className="px-4 py-2">{user.assets?.length || 0}개</td>
              <td className="px-4 py-2 text-right">
                ₩ {Math.floor(user.totalKRW || 0).toLocaleString("ko-KR")}
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() =>
                    alert(
                      user.assets
                        ?.map((a) => `${a.currency}: ${a.balance}`)
                        .join("\n") || "정보 없음"
                    )
                  }
                  className="text-blue-600 hover:underline text-xs"
                >
                  리스트 보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Top100List;
