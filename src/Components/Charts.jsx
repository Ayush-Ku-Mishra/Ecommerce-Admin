import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "JAN", TotalUsers: 0, TotalSales: 0 },
  { month: "FEB", TotalUsers: 0, TotalSales: 0 },
  { month: "MAR", TotalUsers: 0, TotalSales: 1200000 },
  { month: "APRIL", TotalUsers: 0, TotalSales: 13200000 },
  { month: "MAY", TotalUsers: 0, TotalSales: 12800000 },
  { month: "JUNE", TotalUsers: 0, TotalSales: 1800000 },
  { month: "JULY", TotalUsers: 0, TotalSales: 25245261 },
  { month: "AUG", TotalUsers: 0, TotalSales: 0 },
  { month: "SEP", TotalUsers: 0, TotalSales: 0 },
  { month: "OCT", TotalUsers: 0, TotalSales: 0 },
  { month: "NOV", TotalUsers: 0, TotalSales: 0 },
  { month: "DEC", TotalUsers: 0, TotalSales: 0 },
];

const Charts = () => {
  const [hoveredData, setHoveredData] = useState(null);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
          <p className="text-yellow-400 font-bold">{label}</p>
          <p className="text-cyan-400">
            TotalSales: {d.TotalSales.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}000000`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
  <div className="mb-4 sm:mb-6">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
      Total Users & Total Sales
    </h2>
    <div className="flex items-center space-x-4 sm:space-x-6 text-sm text-gray-600">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span>Total Users</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-600"></div>
        <span>Total Sales</span>
      </div>
    </div>
  </div>

  {/* Wrapper div for horizontal scroll */}
  <div
    className="relative custom-scrollbar"
    style={{ overflowX: "auto", overflowY: "hidden", height: "520px" }}
  >
    <div style={{ minWidth: "1150px", height: "500px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="10%"
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              const { activeLabel, activePayload } = state;
              if (activePayload && activePayload.length) {
                setHoveredData({
                  month: activeLabel,
                  sales: activePayload[0].payload.TotalSales,
                });
              }
            }
          }}
          onMouseLeave={() => setHoveredData(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#666" }}
            axisLine={{ stroke: "#4a5568" }}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            tick={{ fontSize: 12, fill: "#666" }}
            axisLine={{ stroke: "#4a5568" }}
            domain={[0, 30000000]}
            ticks={[0, 7500000, 15000000, 22500000, 30000000]}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="rect"
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar
            dataKey="TotalUsers"
            fill="#3b82f6"
            name="TotalUsers"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="TotalSales"
            fill="#16A34A"
            name="TotalSales"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {hoveredData && hoveredData.month === "JULY" && hoveredData.sales > 0 && (
      <div className="absolute top-12 right-8 bg-gray-800 text-white p-3 rounded shadow-lg z-10">
        <div className="text-yellow-400 font-bold text-sm">JULY</div>
        <div className="text-cyan-400 text-sm">
          TotalSales : {hoveredData.sales.toLocaleString()}
        </div>
      </div>
    )}
  </div>
</div>

  );
};

export default Charts;
