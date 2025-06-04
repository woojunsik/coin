// ✅ 리팩터링된 InvestmentOverview.jsx (신규 대시보드 UI)
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import InvestmentChart from "./InvestmentChart";
import AssetTable from "./AssetTable";
import AssetPieChart from "./AssetPieChart";
import CronCountdown from "./CronCountdown";
import SummaryCard from "./SummaryCard";
import ExchangeTabs from "./ExchangeTabs";
import RankBox from "./RankBox";
import ChangeBox from "./ChangeBox";

const InvestmentOverview = ({ data, onRefresh }) => {
  const [activeExchange, setActiveExchange] = useState("all");
  const [dailyAssets, setDailyAssets] = useState([]);
  const [cron, setCron] = useState(null);
  const [rank, setRank] = useState(null);
  const [lastKnownUpdate, setLastKnownUpdate] = useState(data?.lastUpdatedAt);

  const fetchCronSettings = useCallback(async () => {
    try {
      const res = await axios.get("/api/settings");
      setCron(res.data);
    } catch (err) {
      console.error("CRON 설정 로드 실패", err);
    }
  }, []);

  const fetchRank = useCallback(async () => {
    try {
      const path =
        activeExchange === "all"
          ? "/api/ranking/all"
          : `/api/ranking/${activeExchange}`;
      const res = await axios.get(path);
      const myRank = res.data.findIndex((r) => r.userId === data.userId) + 1;
      setRank(myRank || null);
    } catch (err) {
      console.error("랭킹 불러오기 실패", err);
    }
  }, [data?.userId, activeExchange]);

  const checkAndRefresh = useCallback(async () => {
    try {
      const res = await axios.get(`/api/investment/${data.userId}`);
      const updated = res.data.lastUpdatedAt;
      if (updated !== lastKnownUpdate) {
        setLastKnownUpdate(updated);
        onRefresh();
      } else {
        setTimeout(checkAndRefresh, 10000);
      }
    } catch (err) {
      console.error("서버 갱신 확인 실패", err);
    }
  }, [data?.userId, lastKnownUpdate, onRefresh]);

  useEffect(() => {
    fetchCronSettings();
  }, [fetchCronSettings]);

  useEffect(() => {
    if (data?.userId) fetchRank();
  }, [data?.userId, activeExchange]);

  useEffect(() => {
    if (!data) return;
    const assets =
      activeExchange === "all"
        ? data.dailyAssets
        : data.dailyAssetsByExchange?.[activeExchange] || [];
    setDailyAssets(assets);
  }, [data, activeExchange]);

  if (!data || data.coins.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-500">
        📭 연결된 거래소 자산이 없습니다.
      </div>
    );
  }

  const connectedExchanges = [
    ...new Set(data.coins.map((c) => c.exchange).filter(Boolean)),
  ];
  const allExchanges = Object.keys(data.dailyAssetsByExchange || {});
  const mergedExchanges = [
    "all",
    ...new Set([...connectedExchanges, ...allExchanges]),
  ];
  const filteredCoins =
    activeExchange === "all"
      ? data.coins
      : data.coins.filter((c) => c.exchange === activeExchange);
  const totalAssets =
    activeExchange === "all"
      ? data.totalAssets || 0
      : filteredCoins.reduce((sum, c) => sum + (c.krw || 0), 0);
  const last = dailyAssets.at(-2)?.totalKRW || 0;
  const today = dailyAssets.at(-1)?.totalKRW || 0;
  const diff = today - last;
  const percent = last > 0 ? ((diff / last) * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 space-y-8">
      <ExchangeTabs
        mergedExchanges={mergedExchanges}
        activeExchange={activeExchange}
        setActiveExchange={setActiveExchange}
        connectedExchanges={connectedExchanges}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="총 자산"
          value={`₩ ${totalAssets.toLocaleString()}`}
          highlight
        />
        <SummaryCard
          title="연결된 거래소"
          value={`${connectedExchanges.length}개`}
        />
        <SummaryCard title="등록된 코인" value={`${filteredCoins.length}개`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RankBox rank={rank} activeExchange={activeExchange} />
        <ChangeBox diff={diff} percent={percent} />
      </div>

      <AssetTable
        coins={filteredCoins}
        exchange={activeExchange}
        totalAssets={totalAssets}
        diff={diff}
        percent={percent}
        showChange={last > 0 || today > 0}
        hideChange={totalAssets === 0 && today === 0}
      />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <AssetPieChart coins={filteredCoins} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h4 className="text-md font-semibold mb-3 text-gray-800">
          📈 자산 변화 추이
        </h4>
        {dailyAssets.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-6">
            📉 아직 자산 변화 기록이 없습니다.
          </div>
        ) : (
          <InvestmentChart data={dailyAssets} />
        )}
      </div>

      <div className="pt-2">
        <CronCountdown cron={cron} onCountdownEnd={checkAndRefresh} />
        <div className="text-xs text-gray-400 text-center mt-2">
          ⏳ 다음 자산 갱신 후 전체 데이터가 자동으로 반영됩니다.
        </div>
      </div>
    </div>
  );
};

export default InvestmentOverview;
