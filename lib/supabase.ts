import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

// ── Types ──────────────────────────────────────────────────────────────
export interface SensorLog {
  recorded_at: string;
  temperature: number | null;
  humidity: number | null;
  voc_index: number | null;
  rosahl_dehumid_current_ma: number | null;
  rosahl_humid_current_ma: number | null;
}

export interface OperationLog {
  occurred_at: string;
  event_type: string;
  detail: string | null;
}

export const PRESET_TARGETS: Record<string, number> = {
  DRY: 30,
  STD: 50,
  MOIST: 70,
};

export const RANGE_HOURS: Record<string, number> = {
  "1H": 1,
  "6H": 6,
  "24H": 24,
  "7D": 168,
};

// ── Fetchers ───────────────────────────────────────────────────────────
export async function fetchLatest(): Promise<SensorLog | null> {
  const { data } = await supabase
    .from("sensor_logs")
    .select(
      "recorded_at,temperature,humidity,voc_index,rosahl_dehumid_current_ma,rosahl_humid_current_ma"
    )
    .order("recorded_at", { ascending: false })
    .limit(1);
  return data && data.length ? (data[0] as SensorLog) : null;
}

export async function fetchSensorLogs(hours: number): Promise<SensorLog[]> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const { data } = await supabase
    .from("sensor_logs")
    .select(
      "recorded_at,temperature,humidity,voc_index,rosahl_dehumid_current_ma,rosahl_humid_current_ma"
    )
    .gte("recorded_at", since)
    .gte("recorded_at", "2020-01-01") // guard against stray 1970 rows
    .order("recorded_at", { ascending: true });
  return (data as SensorLog[]) ?? [];
}

export async function fetchOpLogs(limit = 100): Promise<OperationLog[]> {
  const { data } = await supabase
    .from("operation_logs")
    .select("occurred_at,event_type,detail")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  return (data as OperationLog[]) ?? [];
}

export function resolvePreset(ops: OperationLog[]): { preset: string; target: number } {
  const pc = ops.find((o) => o.event_type === "preset_change");
  if (pc?.detail) {
    const d = pc.detail.toUpperCase();
    for (const [p, t] of Object.entries(PRESET_TARGETS)) {
      if (d.includes(p)) return { preset: p, target: t };
    }
  }
  return { preset: "STD", target: 50 };
}

export function resolveShutters(ops: OperationLog[]): { dehum: string; humid: string } {
  let dehum = "—";
  let humid = "—";
  let fd = false;
  let fh = false;
  for (const o of ops) {
    if (fd && fh) break;
    const det = (o.detail ?? "").toLowerCase();
    const state = o.event_type === "shutter_open" ? "OPEN" : "CLOSED";
    if (!fd && det.includes("dehum")) {
      dehum = state;
      fd = true;
    }
    if (!fh && det.includes("humid") && !det.includes("dehum")) {
      humid = state;
      fh = true;
    }
  }
  return { dehum, humid };
}
