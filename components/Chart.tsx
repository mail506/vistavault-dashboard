"use client";

import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SensorLog } from "@/lib/supabase";
import { T, rgba } from "@/lib/tokens";

const CHART_H = 156;

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}

function EmptyState() {
  return (
    <div
      style={{
        height: CHART_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Grotesk'",
        fontSize: 11,
        color: T.txtDim,
      }}
    >
      この期間にデータがありません
    </div>
  );
}

interface SingleProps {
  data: SensorLog[];
  dataKey: keyof SensorLog;
  color: string;
  unit: string;
  target?: number | null;
}

export function SingleChart({ data, dataKey, color, unit, target }: SingleProps) {
  const hasData = data.some((d) => d[dataKey] != null);
  if (!hasData) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={CHART_H}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={rgba(color, 0.18)} />
            <stop offset="100%" stopColor={rgba(color, 0)} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="recorded_at"
          tickFormatter={fmtTime}
          tick={{ fontSize: 8, fill: T.txtDim, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: T.border }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 8, fill: T.txtDim, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={34}
        />
        {target != null && (
          <ReferenceLine
            y={target}
            stroke={T.gold}
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{
              value: `${target}%`,
              position: "right",
              fill: T.gold,
              fontSize: 8,
              fontFamily: "JetBrains Mono",
            }}
          />
        )}
        <Tooltip
          labelFormatter={(v) => fmtTime(v as string)}
          formatter={(val: number) => [`${val?.toFixed(1)}${unit}`, ""]}
          contentStyle={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        />
        <Area
          type="monotone"
          dataKey={dataKey as string}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DualCurrentChart({ data }: { data: SensorLog[] }) {
  const hasData = data.some(
    (d) => d.rosahl_dehumid_current_ma != null || d.rosahl_humid_current_ma != null
  );
  if (!hasData) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={CHART_H}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
        <XAxis
          dataKey="recorded_at"
          tickFormatter={fmtTime}
          tick={{ fontSize: 8, fill: T.txtDim, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: T.border }}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 8, fill: T.txtDim, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={34}
        />
        <Tooltip
          labelFormatter={(v) => fmtTime(v as string)}
          formatter={(val: number, name: string) => [`${val?.toFixed(0)} mA`, name]}
          contentStyle={{ background: T.bgCard, border: `1px solid ${T.border}` }}
        />
        <Line
          type="monotone"
          dataKey="rosahl_dehumid_current_ma"
          name="DEHUM"
          stroke={T.colDh}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="rosahl_humid_current_ma"
          name="HUMID"
          stroke={T.colHm}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
