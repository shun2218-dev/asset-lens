"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CATEGORY_LABELS } from "@/lib/constants";

interface CategoryPieProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function CategoryPie({ data }: CategoryPieProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center text-muted-foreground">
        今月のデータがありません
      </div>
    );
  }

  // データを日本語ラベルに変換
  const translatedData = data.map((item) => ({
    ...item,
    name: CATEGORY_LABELS[item.name] || item.name, // マップにない場合はそのまま表示
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={translatedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {translatedData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string | undefined) => {
            if (typeof value === "number") {
              return `¥${value.toLocaleString()}`;
            }
            return value;
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
