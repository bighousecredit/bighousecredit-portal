// ─── BRAND PALETTE ─────────────────────────────────────────────
// Kept here so helpers that return brand colors (e.g. aprSt) stay
// self-contained and unit-testable in isolation from App.jsx.
export const BH = {
  bg: "#0f1c2e", surface: "#1a2b42", card: "#1e3254", border: "#2a4060",
  gold: "#b68e4f", goldL: "#cba96e", cream: "#f7f4ea", gray: "#7a91aa",
  red: "#d94f4f", orange: "#cc7430", yellow: "#c4a020", green: "#3a9e72", blue: "#4a90d9",
};

// ─── PURE HELPERS ──────────────────────────────────────────────
// Extracted verbatim from App.jsx so the credit/financial logic can
// be unit tested. App.jsx should import from this module once the
// component file is restored to a compiling state.

// Whole days from now until `d` (rounds up).
export const daysLeft = (d) => Math.ceil((new Date(d) - Date.now()) / 86_400_000);

// Whole months elapsed since `d` (rounds down, ~30.44 days/month).
export const monthsOld = (d) => Math.floor((Date.now() - new Date(d)) / (86_400_000 * 30.44));

// Percentage (0–100, clamped) of the open→exp window already elapsed.
export const usedPct = (o, e) =>
  Math.min(100, Math.max(0, ((Date.now() - new Date(o)) / (new Date(e) - new Date(o))) * 100));

// US currency formatting; null/undefined/0 all render as "$0".
export const $$ = (n) => "$" + (n || 0).toLocaleString("en-US");

// "Mon D, YYYY" formatting; returns the raw input on failure.
export const fdt = (d) => {
  try {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return d;
  }
};

// Pseudo-unique id for client/card records.
export const uid = () => "x" + Date.now() + Math.random().toString(36).slice(2, 5);

// 0% APR expiry status bucket from days-remaining.
export const aprSt = (d) => {
  if (d < 0)    return { txt: "VENCIÓ",  c: BH.red,    bg: "#d94f4f22", em: "💀" };
  if (d <= 30)  return { txt: "¡1 MES!", c: BH.red,    bg: "#d94f4f22", em: "🚨" };
  if (d <= 90)  return { txt: "3 MESES", c: BH.orange, bg: "#cc743022", em: "⚠️" };
  if (d <= 180) return { txt: "6 MESES", c: BH.yellow, bg: "#c4a02022", em: "📢" };
  return              { txt: "ACTIVO",  c: BH.green,  bg: "#3a9e7222", em: "✅" };
};

// Credit-health score (0–100) penalizing high utilization and near
// 0%-APR expiry across all of a client's cards.
export const healthScore = (cards) => {
  if (!cards || !cards.length) return 100;
  let sc = 100;
  cards.forEach((c) => {
    const u = (c.balance / c.limit) * 100;
    if (u > 50) sc -= 15;
    else if (u > 30) sc -= 8;
    const d = daysLeft(c.exp);
    if (d >= 0 && d <= 30) sc -= 20;
    else if (d >= 0 && d <= 90) sc -= 10;
  });
  return Math.max(0, Math.min(100, Math.round(sc)));
};
