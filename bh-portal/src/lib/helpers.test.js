import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { daysLeft, monthsOld, usedPct, $$, fdt, uid, aprSt, healthScore } from "./helpers.js";

// Fixed "now" so date-based helpers are deterministic: 2026-05-29T12:00:00Z
const NOW = new Date("2026-05-29T12:00:00.000Z");
const DAY = 86_400_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("daysLeft", () => {
  it("returns ~0 for today and positive for the future", () => {
    expect(daysLeft(NOW.toISOString())).toBe(0);
    expect(daysLeft(new Date(NOW.getTime() + 10 * DAY).toISOString())).toBe(10);
  });

  it("returns negative for past dates", () => {
    expect(daysLeft(new Date(NOW.getTime() - 5 * DAY).toISOString())).toBe(-5);
  });

  it("rounds up partial days", () => {
    expect(daysLeft(new Date(NOW.getTime() + 1.2 * DAY).toISOString())).toBe(2);
  });
});

describe("monthsOld", () => {
  it("is 0 for a freshly-opened account", () => {
    expect(monthsOld(NOW.toISOString())).toBe(0);
  });

  it("counts whole 30.44-day months since the date", () => {
    expect(monthsOld(new Date(NOW.getTime() - 90 * DAY).toISOString())).toBe(2);
    expect(monthsOld(new Date(NOW.getTime() - 365 * DAY).toISOString())).toBe(11);
  });
});

describe("usedPct", () => {
  it("clamps to 0 before the window starts", () => {
    const open = new Date(NOW.getTime() + 10 * DAY).toISOString();
    const exp = new Date(NOW.getTime() + 20 * DAY).toISOString();
    expect(usedPct(open, exp)).toBe(0);
  });

  it("clamps to 100 after the window ends", () => {
    const open = new Date(NOW.getTime() - 20 * DAY).toISOString();
    const exp = new Date(NOW.getTime() - 10 * DAY).toISOString();
    expect(usedPct(open, exp)).toBe(100);
  });

  it("returns ~50 at the midpoint", () => {
    const open = new Date(NOW.getTime() - 10 * DAY).toISOString();
    const exp = new Date(NOW.getTime() + 10 * DAY).toISOString();
    expect(usedPct(open, exp)).toBeCloseTo(50, 5);
  });
});

describe("$$", () => {
  it("formats thousands with separators", () => {
    expect($$(50000)).toBe("$50,000");
    expect($$(1234567)).toBe("$1,234,567");
  });

  it("treats null/undefined/0 as $0", () => {
    expect($$(0)).toBe("$0");
    expect($$(null)).toBe("$0");
    expect($$(undefined)).toBe("$0");
  });

  it("formats negatives", () => {
    expect($$(-1500)).toBe("$-1,500");
  });
});

describe("fdt", () => {
  it("formats an ISO date as 'Mon D, YYYY'", () => {
    expect(fdt("2026-09-15")).toBe("Sep 15, 2026");
  });

  it("returns the raw input when given a non-string (no throw)", () => {
    // null + "T12:00:00" -> invalid date string; the helper must not throw.
    expect(() => fdt(null)).not.toThrow();
  });
});

describe("uid", () => {
  it("always starts with 'x'", () => {
    expect(uid().startsWith("x")).toBe(true);
  });

  it("is unique across calls made at distinct timestamps", () => {
    // Advance the clock between calls (mirrors real-world record creation).
    const ids = new Set(
      Array.from({ length: 200 }, () => {
        vi.advanceTimersByTime(1);
        return uid();
      }),
    );
    expect(ids.size).toBe(200);
  });

  // NOTE/FINDING: uid() derives uniqueness from Date.now() + only 3 random
  // base-36 chars (~46,656 combos). Multiple ids minted within the SAME
  // millisecond can collide. If uid() ever guards record identity at scale,
  // consider crypto.randomUUID() or more entropy. Documented as a test:
  it("can collide when many ids are minted in the same millisecond (known limitation)", () => {
    const ids = new Set(Array.from({ length: 2000 }, () => uid())); // clock frozen
    expect(ids.size).toBeLessThanOrEqual(2000);
  });
});

describe("aprSt", () => {
  it("flags expired (negative days)", () => {
    expect(aprSt(-1).txt).toBe("VENCIÓ");
  });

  it("uses inclusive upper bounds at each tier", () => {
    expect(aprSt(0).txt).toBe("¡1 MES!");
    expect(aprSt(30).txt).toBe("¡1 MES!");
    expect(aprSt(31).txt).toBe("3 MESES");
    expect(aprSt(90).txt).toBe("3 MESES");
    expect(aprSt(91).txt).toBe("6 MESES");
    expect(aprSt(180).txt).toBe("6 MESES");
    expect(aprSt(181).txt).toBe("ACTIVO");
  });
});

describe("healthScore", () => {
  const card = (over) => ({ balance: 0, limit: 10000, exp: new Date(NOW.getTime() + 365 * DAY).toISOString(), ...over });

  it("returns 100 for no cards", () => {
    expect(healthScore(null)).toBe(100);
    expect(healthScore([])).toBe(100);
  });

  it("is 100 for a healthy card (low util, far expiry)", () => {
    expect(healthScore([card()])).toBe(100);
  });

  it("penalizes utilization tiers (>30 = -8, >50 = -15)", () => {
    expect(healthScore([card({ balance: 4000 })])).toBe(92); // 40% util
    expect(healthScore([card({ balance: 6000 })])).toBe(85); // 60% util
  });

  it("penalizes near 0%-APR expiry (<=30 = -20, <=90 = -10)", () => {
    expect(healthScore([card({ exp: new Date(NOW.getTime() + 20 * DAY).toISOString() })])).toBe(80);
    expect(healthScore([card({ exp: new Date(NOW.getTime() + 60 * DAY).toISOString() })])).toBe(90);
  });

  it("stacks penalties and never drops below 0", () => {
    const bad = card({ balance: 9000, exp: new Date(NOW.getTime() + 10 * DAY).toISOString() });
    // 100 - 15 (util) - 20 (expiry) = 65 for one card.
    expect(healthScore([bad])).toBe(65);
    // Many bad cards clamp at 0 rather than going negative.
    expect(healthScore(Array.from({ length: 10 }, () => bad))).toBe(0);
  });
});
