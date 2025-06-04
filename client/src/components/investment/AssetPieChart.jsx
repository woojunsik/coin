import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"];

const AssetPieChart = ({ coins }) => {
  const pieData = coins.filter((c) => c.krw > 0).map((c) => ({ name: c.currency, value: c.krw }));

  return (
    <div className="mt-8">
      <h4 className="text-md font-semibold mb-3 text-gray-800">📊 자산 구성 비율</h4>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {pieData.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₩${value.toLocaleString()}`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetPieChart;