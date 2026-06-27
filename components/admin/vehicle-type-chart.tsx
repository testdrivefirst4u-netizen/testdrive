"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface VehicleTypeStat {
  type: string;
  count: number;
}

const TYPE_COLORS: Record<string, string> = {
  CAR:        "#3b82f6",
  BIKE:       "#8b5cf6",
  SCOOTER:    "#f59e0b",
  EV:         "#10b981",
  COMMERCIAL: "#ef4444",
};

const TYPE_LABELS: Record<string, string> = {
  CAR:        "Car",
  BIKE:       "Bike",
  SCOOTER:    "Scooter",
  EV:         "EV",
  COMMERCIAL: "Commercial",
};

interface Props {
  data: VehicleTypeStat[];
}

export function VehicleTypeChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name:  TYPE_LABELS[d.type] ?? d.type,
    count: d.count,
    type:  d.type,
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No vehicles added yet
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#cbd5e1" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            cursor={{ fill: "#f8fafc" }}
            formatter={(value: number) => [value, "Vehicles"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.type} fill={TYPE_COLORS[entry.type] ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {chartData.map((d) => (
          <div key={d.type} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: TYPE_COLORS[d.type] ?? "#6366f1" }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              {d.name} <span className="text-gray-400">({d.count})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
