import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const CronCountdown = ({ cron, onCountdownEnd }) => {
  const [remaining, setRemaining] = useState({
    balance: "계산 중...",
    daily: "계산 중...",
  });

  const [triggered, setTriggered] = useState(false);
  const [balanceTriggered, setBalanceTriggered] = useState(false);

  useEffect(() => {
    if (!cron) return;

    const extractInterval = (exp) => {
      const match = exp?.match(/\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    const balanceIntervalMin = extractInterval(cron.assetBalanceCron);
    const dailyIntervalMin = extractInterval(cron.assetDailyCron);

    const timer = setInterval(() => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      console.log("⏱️ 타이머 작동 중", now.toLocaleTimeString());

      const balanceOffset = balanceIntervalMin - (minutes % balanceIntervalMin);
      const balanceRemaining = balanceOffset * 60 - seconds;
      const bDiff = dayjs.duration(balanceRemaining * 1000);

      let dailyRemaining = 0;
      if (dailyIntervalMin) {
        const dailyOffset = dailyIntervalMin - (minutes % dailyIntervalMin);
        dailyRemaining = dailyOffset * 60 - seconds;
      } else {
        const nextMidnight = new Date();
        nextMidnight.setDate(now.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);
        dailyRemaining = Math.floor((nextMidnight - now) / 1000);
      }

      const dDiff = dayjs.duration(dailyRemaining * 1000);
      setRemaining({
        balance: `${bDiff.minutes()}분 ${bDiff.seconds()}초`,
        daily: `${dDiff.hours()}시간 ${dDiff.minutes()}분 ${dDiff.seconds()}초`,
      });

      console.log("🧮 dailyRemaining:", dailyRemaining);
      console.log("🧮 balanceRemaining:", balanceRemaining);

      if (balanceRemaining > 2 && balanceTriggered) {
        setBalanceTriggered(false);
      }

      if (balanceRemaining <= 2 && !balanceTriggered) {
        const goalMin =
          Math.ceil(minutes / balanceIntervalMin) * balanceIntervalMin;
        const goal = new Date(now);
        goal.setMinutes(goalMin, 0, 0);
        console.log(
          `✅ [실행됨] 실시간 자산 갱신 트리거됨 (목표: ${goal.toLocaleTimeString()}, 실제: ${now.toLocaleTimeString()})`
        );
        setBalanceTriggered(true);
        if (typeof onCountdownEnd === "function") {
          onCountdownEnd();
        }
      }

      if (dailyRemaining > 2 && triggered) {
        setTriggered(false);
      }

      if (dailyRemaining <= 2 && !triggered) {
        const goal = new Date(now);
        goal.setHours(0, 0, 0, 0);
        console.log(
          `✅ [실행됨] 자산추이 갱신 트리거됨 (목표: ${goal.toLocaleTimeString()}, 실제: ${now.toLocaleTimeString()})`
        );
        setTriggered(true);
        if (typeof onCountdownEnd === "function") {
          onCountdownEnd();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cron, onCountdownEnd, triggered, balanceTriggered]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
        <p className="text-sm text-gray-500">💰 실시간 자산 갱신까지</p>
        <p className="text-lg font-semibold text-blue-600">
          {remaining.balance}
        </p>
      </div>
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center">
        <p className="text-sm text-gray-500">📊 자산 추이 갱신까지</p>
        <p className="text-lg font-semibold text-purple-600">
          {remaining.daily}
        </p>
      </div>
    </div>
  );
};

export default CronCountdown;
