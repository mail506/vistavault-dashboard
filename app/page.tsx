"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLatest,
  fetchOpLogs,
  fetchSensorLogs,
  OperationLog,
  RANGE_HOURS,
  resolvePreset,
  resolveShutters,
  SensorLog,
  supabase,
} from "@/lib/supabase";
import { T } from "@/lib/tokens";
import { DualCurrentChart, SingleChart } from "@/components/Chart";
import {
  ChartLabel,
  ControlBar,
  Hero,
  Navbar,
  OpLog,
  Segmented,
} from "@/components/Panels";

const REFRESH_MS = 30_000;

function computeDataAge(latest: SensorLog | null): string {
  if (!latest) return "";
  const deltaMin = (Date.now() - new Date(latest.recorded_at).getTime()) / 60000;
  if (deltaMin < 2) return "";
  if (deltaMin < 60) return `${Math.floor(deltaMin)}分前`;
  if (deltaMin < 1440) return `${Math.floor(deltaMin / 60)}時間前`;
  return `${Math.floor(deltaMin / 1440)}日前`;
}

export default function Dashboard() {
  const [latest, setLatest] = useState<SensorLog | null>(null);
  const [series, setSeries] = useState<SensorLog[]>([]);
  const [ops, setOps] = useState<OperationLog[]>([]);
  const [timeRange, setTimeRange] = useState("24H");
  const [logFilter, setLogFilter] = useState("ALL");
  const [clock, setClock] = useState("--:--:--");
  const [err, setErr] = useState<string | null>(null);

  const loadSeries = useCallback(async (range: string) => {
    try {
      const s = await fetchSensorLogs(RANGE_HOURS[range]);
      setSeries(s);
    } catch (e) {
      setErr(String(e));
    }
  }, []);

  const loadCore = useCallback(async () => {
    try {
      const [l, o] = await Promise.all([fetchLatest(), fetchOpLogs()]);
      setLatest(l);
      setOps(o);
      setErr(null);
    } catch (e) {
      setErr(String(e));
    }
  }, []);

  // initial + polling
  useEffect(() => {
    loadCore();
    loadSeries(timeRange);
    const iv = setInterval(() => {
      loadCore();
      loadSeries(timeRange);
    }, REFRESH_MS);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // range change → reload series
  useEffect(() => {
    loadSeries(timeRange);
  }, [timeRange, loadSeries]);

  // clock
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Tokyo",
        })
      );
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Supabase realtime → refresh on new insert
  useEffect(() => {
    const ch = supabase
      .channel("sensor_logs_stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_logs" },
        () => {
          loadCore();
          loadSeries(timeRange);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "operation_logs" },
        () => loadCore()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const { preset, target } = resolvePreset(ops);
  const { dehum, humid } = resolveShutters(ops);
  const dataAge = computeDataAge(latest);

  return (
    <main style={{ minHeight: "100vh", background: T.bgMain }}>
      <Navbar time={clock} dataAge={dataAge} />

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 20px 4px",
        }}
      >
        <Segmented
          options={Object.keys(RANGE_HOURS)}
          value={timeRange}
          onChange={setTimeRange}
        />
        <Segmented options={["ALL", "PC", "SO"]} value={logFilter} onChange={setLogFilter} />
      </div>

      {err && (
        <div style={{ padding: "8px 20px", color: "#cf4a4a", fontSize: 11, fontFamily: "JetBrains Mono" }}>
          Supabase接続エラー: {err}
        </div>
      )}

      <Hero latest={latest} target={target} />
      <ControlBar preset={preset} target={target} dehum={dehum} humid={humid} />

      {/* Main grid */}
      <div className="main-grid" style={{ gap: 0 }}>
        <div style={{ padding: "0 12px 20px" }}>
          <ChartLabel
            color={T.colHum}
            title="HUMIDITY"
            unit="%RH"
            extra={
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 7, color: T.gold, marginLeft: 8 }}>
                — TARGET {target}%RH
              </span>
            }
          />
          <div style={cardStyle}>
            <SingleChart data={series} dataKey="humidity" color={T.colHum} unit="%RH" target={target} />
          </div>

          <ChartLabel color={T.colTemp} title="TEMPERATURE" unit="°C" />
          <div style={cardStyle}>
            <SingleChart data={series} dataKey="temperature" color={T.colTemp} unit="°C" />
          </div>

          <ChartLabel color={T.colVoc} title="VOC INDEX" unit="0–500" />
          <div style={cardStyle}>
            <SingleChart data={series} dataKey="voc_index" color={T.colVoc} unit="" />
          </div>

          <ChartLabel
            color={T.txtPri}
            title="ROSAHL CURRENT"
            unit="mA"
            extra={
              <>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 7, color: T.colDh, marginLeft: 8 }}>
                  — DEHUM
                </span>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 7, color: T.colHm, marginLeft: 4 }}>
                  — HUMID
                </span>
              </>
            }
          />
          <div style={cardStyle}>
            <DualCurrentChart data={series} />
          </div>
        </div>

        <OpLog ops={ops} filter={logFilter} />
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: T.bgCard,
  border: `1px solid ${T.border}`,
  borderRadius: 4,
  padding: "8px 12px 4px",
  overflow: "hidden",
};
