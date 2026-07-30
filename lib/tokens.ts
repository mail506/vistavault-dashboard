// Aurum design tokens
export const T = {
  bgMain: "#0e0e12",
  bgHero: "#0c0c10",
  bgCard: "#0a0a0e",
  bgNav: "#0f0f14",
  border: "#1a1a22",
  gold: "#c9a252",
  live: "#3d9e6a",
  colTemp: "#e8945a",
  colHum: "#4a8dc8",
  colVoc: "#9b6fd6",
  colDh: "#3dcf8a",
  colHm: "#f0c84a",
  txtPri: "#ede8df",
  txtSec: "#6a6560",
  txtDim: "#46443f",
  txtVdim: "#36342f",
} as const;

export const EVENT_COLORS: Record<string, string> = {
  preset_change: T.gold,
  shutter_open: T.live,
  shutter_close: T.colHum,
  mode_change: T.colVoc,
  solenoid_unlock: T.colTemp,
};

export function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function vocStatus(v: number | null): { label: string; color: string } {
  if (v == null) return { label: "—", color: T.txtDim };
  if (v < 100) return { label: "GOOD", color: T.live };
  if (v < 200) return { label: "FAIR", color: T.gold };
  if (v < 300) return { label: "POOR", color: T.colTemp };
  return { label: "BAD", color: "#cf4a4a" };
}
