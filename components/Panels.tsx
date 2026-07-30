"use client";

import { OperationLog, SensorLog } from "@/lib/supabase";
import { EVENT_COLORS, T, vocStatus } from "@/lib/tokens";

const MONO = "'JetBrains Mono', monospace";
const SERIF = "'Cormorant Garamond', serif";

// ── Navbar ───────────────────────────────────────────────────────────────
export function Navbar({ time, dataAge }: { time: string; dataAge: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        height: 50,
        background: `linear-gradient(180deg,${T.bgNav} 0%,#0a0a0e 100%)`,
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(201,162,82,.5),transparent)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 1.5L18.5 6.25V13.75L10 18.5L1.5 13.75V6.25Z"
            stroke={T.gold}
            strokeWidth="1"
          />
          <path
            d="M10 4.5L15 7.5V12.5L10 15.5L5 12.5V7.5Z"
            stroke={T.gold}
            strokeWidth=".5"
            opacity=".4"
          />
          <circle cx="10" cy="10" r="1.6" fill={T.gold} opacity=".7" />
        </svg>
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: ".18em",
            color: T.txtPri,
          }}
        >
          VISTAVAULT
        </span>
      </div>
      <div
        style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}
      >
        <span style={{ fontSize: 9, letterSpacing: ".12em", color: "#56534f" }}>
          MONITORING SYSTEM
        </span>
        <div style={{ width: 1, height: 14, background: "#2a2a34" }} />
        {dataAge ? (
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".1em", color: T.gold }}>
            LAST DATA {dataAge}
          </span>
        ) : (
          <div>
            <span className="live-dot" />
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 600,
                fontSize: 9,
                letterSpacing: ".12em",
                color: T.live,
              }}
            >
              LIVE
            </span>
          </div>
        )}
        <span style={{ fontFamily: MONO, fontSize: 11, color: "#7a7570" }}>
          {time} JST
        </span>
      </div>
    </div>
  );
}

// ── Hero metrics ─────────────────────────────────────────────────────────
function HeroCell({
  value,
  unit,
  label,
  color,
  bg = "transparent",
  border = true,
  sub,
}: {
  value: string;
  unit: string;
  label: string;
  color: string;
  bg?: string;
  border?: boolean;
  sub?: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px 24px 16px",
        textAlign: "center",
        background: bg,
        borderRight: border ? `1px solid ${T.border}` : undefined,
      }}
    >
      <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 52, lineHeight: 1, color }}>
        {value}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 5,
        }}
      >
        <span style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 14, color: T.txtDim }}>
          {unit}
        </span>
        <span style={{ width: 1, height: 9, background: "#2a2a34" }} />
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 7, letterSpacing: ".18em", color: T.txtDim }}>
          {label}
        </span>
      </div>
      {sub}
    </div>
  );
}

function SubText({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 8, color, marginTop: 5, letterSpacing: ".08em" }}>
      {text}
    </div>
  );
}

function DotSub({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 5 }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 8, color, letterSpacing: ".1em" }}>
        {label}
      </span>
    </div>
  );
}

export function Hero({ latest, target }: { latest: SensorLog | null; target: number }) {
  const v = (k: keyof SensorLog, digits = 1) => {
    const val = latest?.[k];
    return typeof val === "number" ? val.toFixed(digits) : "—";
  };
  const hum = latest?.humidity ?? null;
  const dh = latest?.rosahl_dehumid_current_ma ?? null;
  const hm = latest?.rosahl_humid_current_ma ?? null;
  const voc = latest?.voc_index ?? null;

  const humDiff =
    hum != null
      ? `${hum > target ? "▲" : "▼"}${Math.abs(hum - target).toFixed(1)} vs ${target}%`
      : "—";
  const humDc = hum != null && Math.abs(hum - target) > 2 ? T.gold : T.live;
  const { label: vLbl, color: vC } = vocStatus(voc);
  const dhActive = dh != null && dh > 10;
  const hmActive = hm != null && hm > 10;

  return (
    <div
      style={{
        display: "flex",
        background: T.bgHero,
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg,transparent,rgba(201,162,82,.12),transparent)",
        }}
      />
      <HeroCell value={v("temperature")} unit="°C" label="TEMPERATURE" color={T.txtPri} />
      <HeroCell
        value={v("humidity")}
        unit="%RH"
        label="HUMIDITY"
        color={T.colHum}
        bg="rgba(74,141,200,.025)"
        sub={<SubText text={humDiff} color={humDc} />}
      />
      <HeroCell
        value={v("voc_index", 0)}
        unit="/500"
        label="VOC INDEX"
        color={T.txtPri}
        sub={<DotSub label={vLbl} color={vC} />}
      />
      <HeroCell
        value={v("rosahl_dehumid_current_ma", 0)}
        unit="mA"
        label="DEHUM"
        color={T.colDh}
        bg="rgba(61,207,138,.015)"
        sub={<DotSub label={dhActive ? "ACTIVE" : "STANDBY"} color={dhActive ? T.colDh : T.txtDim} />}
      />
      <HeroCell
        value={v("rosahl_humid_current_ma", 0)}
        unit="mA"
        label="HUMID"
        color={hmActive ? T.colHm : "#56534f"}
        border={false}
        sub={<SubText text={hmActive ? "ACTIVE" : "STANDBY"} color={hmActive ? T.colHm : T.txtDim} />}
      />
    </div>
  );
}

// ── Control bar ──────────────────────────────────────────────────────────
export function ControlBar({
  preset,
  target,
  dehum,
  humid,
}: {
  preset: string;
  target: number;
  dehum: string;
  humid: string;
}) {
  const PBtn = ({ p }: { p: string }) => {
    const active = p === preset;
    return (
      <div
        style={{
          padding: "3px 10px",
          fontFamily: MONO,
          fontWeight: active ? 700 : 400,
          fontSize: 7,
          letterSpacing: ".1em",
          color: active ? T.gold : T.txtDim,
          background: active ? "rgba(201,162,82,.1)" : "transparent",
          borderLeft: active ? "1px solid rgba(201,162,82,.2)" : undefined,
          borderRight: active ? "1px solid rgba(201,162,82,.2)" : undefined,
        }}
      >
        {p}
      </div>
    );
  };
  const Badge = ({ label, state }: { label: string; state: string }) => {
    const on = state === "OPEN";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: ".1em", color: T.txtDim }}>
          {label}
        </span>
        <span style={{ width: 4, height: 4, borderRadius: "50%", background: on ? T.live : T.txtVdim }} />
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 7, color: on ? T.live : T.txtDim, letterSpacing: ".1em" }}>
          {state}
        </span>
      </div>
    );
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        height: 42,
        background: T.bgCard,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", border: "1px solid #2a2a34", borderRadius: 3, overflow: "hidden" }}>
          <PBtn p="DRY" />
          <PBtn p="STD" />
          <PBtn p="MOIST" />
        </div>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, color: T.gold }}>
          {target}%RH
        </span>
        <span style={{ fontSize: 8, color: T.txtDim }}>target</span>
      </div>
      <div style={{ width: 1, height: 16, background: "#242430", margin: "0 20px" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Badge label="DEHUM" state={dehum} />
        <Badge label="HUMID" state={humid} />
      </div>
    </div>
  );
}

// ── Time-range + log-filter segmented controls ──────────────────────────
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            style={{
              padding: "3px 10px",
              fontFamily: MONO,
              fontWeight: active ? 700 : 400,
              fontSize: 9,
              letterSpacing: ".1em",
              color: active ? T.gold : T.txtDim,
              border: active ? "1px solid rgba(201,162,82,.2)" : "1px solid #2a2a34",
              borderRadius: 2,
              background: active ? "rgba(201,162,82,.12)" : "transparent",
              cursor: "pointer",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ── Chart label ──────────────────────────────────────────────────────────
export function ChartLabel({
  color,
  title,
  unit,
  extra,
}: {
  color: string;
  title: string;
  unit: string;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "10px 4px 3px" }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 7, letterSpacing: ".12em", color }}>
        {title}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 7, color: "#2e2c28", marginLeft: 5 }}>
        {unit}
      </span>
      {extra}
    </div>
  );
}

// ── Operation log ────────────────────────────────────────────────────────
export function OpLog({ ops, filter }: { ops: OperationLog[]; filter: string }) {
  let filtered = ops;
  if (filter === "PC") filtered = ops.filter((o) => o.event_type === "preset_change");
  else if (filter === "SO")
    filtered = ops.filter((o) => ["shutter_open", "shutter_close"].includes(o.event_type));

  const items = filtered.slice(0, 30);

  return (
    <div style={{ background: T.bgMain, borderLeft: `1px solid ${T.border}`, height: "100%" }}>
      <div
        style={{
          padding: "13px 18px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 8, letterSpacing: ".14em", color: T.txtPri }}>
          OPERATION LOG
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 8,
            background: "#1e1e24",
            color: "#7a7570",
            padding: "1px 7px",
            borderRadius: 10,
          }}
        >
          {ops.length}
        </span>
      </div>
      <div style={{ padding: "6px 18px 14px" }}>
        {items.length === 0 ? (
          <div style={{ padding: 20, color: T.txtDim, fontSize: 11 }}>No logs yet.</div>
        ) : (
          items.map((o, i) => {
            const c = EVENT_COLORS[o.event_type] ?? T.txtDim;
            const ts = new Date(o.occurred_at).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "Asia/Tokyo",
            });
            const last = i === items.length - 1;
            return (
              <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #141418" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                  {!last && <div style={{ width: 1, flex: 1, background: T.border, marginTop: 3, marginBottom: -1 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 7, letterSpacing: ".1em", color: c }}>
                      {o.event_type.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: T.txtDim }}>{ts}</span>
                  </div>
                  <p style={{ fontSize: 10, color: T.txtSec, margin: 0, lineHeight: 1.4 }}>
                    {o.detail ?? ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
