"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function VisitsChart({
  data,
}: {
  data: { date: string; visits: number }[];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "dd MMM"),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            interval={Math.ceil(chartData.length / 8)}
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="visits"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
