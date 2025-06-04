// ✅ AssetTable.jsx 개선된 전일 대비 비교
import React from "react";

const AssetTable = ({
  coins,
  exchange,
  totalAssets,
  diff,
  percent,
  showChange,
  hideChange,
}) => {
  const hasEnoughHistory =
    typeof diff === "number" && typeof percent === "string";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mt-6">
      <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold mb-3 text-gray-800">
          📊 보유 자산 목록
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2 border">코인</th>
                <th className="px-4 py-2 border">보유량</th>
                <th className="px-4 py-2 border">현재 가치</th>
              </tr>
            </thead>
            <tbody>
              {coins.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-3 text-center text-gray-400"
                  >
                    보유 중인 코인이 없습니다.
                  </td>
                </tr>
              ) : (
                coins.map((coin, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {coin.currency}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {coin.currency === "KRW"
                        ? "-"
                        : `${coin.balance} ${coin.currency}`}
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {Math.floor(coin.krw).toLocaleString()}원
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
