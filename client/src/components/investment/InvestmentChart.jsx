import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";

const InvestmentChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">그래프에 표시할 데이터가 없습니다.</p>;
  }

  const formatted = data.map((d) => ({
    ...d,
    date: dayjs(d.date).format("MM/DD"),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formatted}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="2 4"
          stroke="#e5e7eb"
        />
        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => `₩${Math.floor(v).toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            color: "#111827",
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          }}
          formatter={(value) => [`₩${value.toLocaleString()}`, "총 자산"]}
        />
        <Bar dataKey="totalKRW" fill="#3b82f6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    
  );
  <InvestmentOverview
  key={user._id + (investmentData?.lastUpdatedAt || "")}
  data={investmentData}
  onRefresh={refetch}
/>
};

export default InvestmentChart;
