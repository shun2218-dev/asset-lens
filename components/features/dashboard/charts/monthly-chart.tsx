"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyChartProps {
  data: {
    name: string;
    income: number;
    expense: number;
  }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Calculate savings (net) and savings rate for each month
  const enrichedData = data.map((d) => ({
    ...d,
    savings: d.income - d.expense,
    savingsRate: d.income > 0 ? ((d.income - d.expense) / d.income) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={enrichedData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="amount"
          tickFormatter={(value) => `¥${value.toLocaleString()}`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="rate"
          orientation="right"
          tickFormatter={(value) => `${value}%`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          domain={[-100, 100]}
        />
        <ReferenceLine
          yAxisId="rate"
          y={0}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="3 3"
          strokeOpacity={0.4}
        />
        <Tooltip
          formatter={(value, name) => {
            if (typeof value === "number") {
              if (name === "貯蓄率") return `${value.toFixed(1)}%`;
              return `¥${value.toLocaleString()}`;
            }
            return String(value);
          }}
          cursor={{ fill: "transparent" }}
        />
        <Legend />
        <Bar
          yAxisId="amount"
          dataKey="income"
          name="収入"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="amount"
          dataKey="expense"
          name="支出"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="rate"
          type="monotone"
          dataKey="savingsRate"
          name="貯蓄率"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3, fill: "#6366f1" }}
          activeDot={{ r: 5 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
