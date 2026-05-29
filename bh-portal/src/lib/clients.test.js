import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  normalizeCard, addClient, addCard, removeCard, removeClient, addNote,
  allCards, expiringWithin, cliReadyCards, totalFunding,
} from "./clients.js";

const NOW = new Date("2026-05-29T12:00:00.000Z");
const DAY = 86_400_000;
const inDays = (n) => new Date(NOW.getTime() + n * DAY).toISOString();

// Deterministic id + date generators for assertions.
let n;
const idGen = () => `id${n++}`;
const today = () => "2026-05-29";

beforeEach(() => {
  n = 0;
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

const baseClients = () => ({
  c1: { id: "c1", name: "María", cards: [{ id: "k1", limit: 25000 }], advisorNotes: [{ id: "n0", text: "old" }] },
  c2: { id: "c2", name: "Carlos", cards: [] },
});

describe("normalizeCard", () => {
  it("coerces numeric fields and applies defaults", () => {
    const card = normalizeCard(
      { bank: "Chase", product: "Ink", limit: "25000", balance: "", open: "2026-01-01", exp: "2027-01-01", months: "", paymentDue: "", annualFee: "" },
      idGen,
    );
    expect(card).toMatchObject({
      id: "id0", bank: "Chase", product: "Ink",
      limit: 25000, balance: 0, months: 12, paymentDue: 1, annualFee: 0,
      cliEligible: "", network: "Visa", benefits: [], perks: [], annualFeeDate: null,
    });
  });
});

describe("addClient", () => {
  it("adds a client with seeded empty collections", () => {
    const next = addClient(baseClients(), { name: "Ana", email: "ana@x.com" }, idGen, today);
    expect(next.id0).toMatchObject({
      id: "id0", name: "Ana", email: "ana@x.com", joined: "2026-05-29",
      cards: [], advisorNotes: [], actionItems: [], fundingPipeline: [],
    });
  });

  it("returns null without name or email", () => {
    expect(addClient(baseClients(), { name: "", email: "a@x.com" })).toBeNull();
    expect(addClient(baseClients(), { name: "Ana", email: "" })).toBeNull();
  });

  it("does not mutate the original clients map", () => {
    const clients = baseClients();
    addClient(clients, { name: "Ana", email: "ana@x.com" }, idGen, today);
    expect(Object.keys(clients)).toEqual(["c1", "c2"]);
  });
});

describe("addCard", () => {
  const validNk = { bank: "Chase", product: "Ink", limit: "5000", open: "2026-01-01", exp: "2027-01-01" };

  it("appends a normalized card to the target client", () => {
    const next = addCard(baseClients(), "c2", validNk, idGen);
    expect(next.c2.cards).toHaveLength(1);
    expect(next.c2.cards[0]).toMatchObject({ id: "id0", bank: "Chase", limit: 5000 });
  });

  it("returns null when required fields are missing", () => {
    expect(addCard(baseClients(), "c2", { ...validNk, bank: "" })).toBeNull();
    expect(addCard(baseClients(), "c2", { ...validNk, open: "" })).toBeNull();
    expect(addCard(baseClients(), "c2", { ...validNk, exp: "" })).toBeNull();
  });

  it("returns null for an unknown client", () => {
    expect(addCard(baseClients(), "nope", validNk)).toBeNull();
  });

  it("does not mutate the original client's cards array", () => {
    const clients = baseClients();
    addCard(clients, "c1", validNk, idGen);
    expect(clients.c1.cards).toHaveLength(1);
  });
});

describe("removeCard", () => {
  it("removes the matching card", () => {
    const next = removeCard(baseClients(), "c1", "k1");
    expect(next.c1.cards).toHaveLength(0);
  });

  it("leaves other cards/clients untouched and returns input for unknown client", () => {
    const clients = baseClients();
    expect(removeCard(clients, "ghost", "k1")).toBe(clients);
  });
});

describe("removeClient", () => {
  it("deletes the client without mutating the original", () => {
    const clients = baseClients();
    const next = removeClient(clients, "c1");
    expect(next.c1).toBeUndefined();
    expect(next.c2).toBeDefined();
    expect(clients.c1).toBeDefined();
  });
});

describe("addNote", () => {
  it("prepends a trimmed note to advisorNotes", () => {
    const next = addNote(baseClients(), "c1", "  hola  ", idGen, today);
    expect(next.c1.advisorNotes[0]).toEqual({ id: "id0", date: "2026-05-29", text: "hola" });
    expect(next.c1.advisorNotes[1].id).toBe("n0");
  });

  it("initializes advisorNotes when absent", () => {
    const next = addNote(baseClients(), "c2", "primera", idGen, today);
    expect(next.c2.advisorNotes).toHaveLength(1);
  });

  it("returns null for blank text or unknown client", () => {
    expect(addNote(baseClients(), "c1", "   ")).toBeNull();
    expect(addNote(baseClients(), "c1", "")).toBeNull();
    expect(addNote(baseClients(), "ghost", "hi")).toBeNull();
  });
});

describe("selectors", () => {
  const clients = {
    c1: { id: "c1", name: "María", cards: [
      { id: "k1", limit: 25000, exp: inDays(20), cliEligible: inDays(-1) },
      { id: "k2", limit: 35000, exp: inDays(120), cliEligible: inDays(10) },
    ] },
    c2: { id: "c2", name: "Carlos", cards: [
      { id: "k3", limit: 20000, exp: inDays(80), cliEligible: inDays(0) },
    ] },
  };

  it("allCards flattens and tags owner name + id", () => {
    const cards = allCards(clients);
    expect(cards).toHaveLength(3);
    expect(cards[0]).toMatchObject({ id: "k1", cname: "María", cid: "c1" });
  });

  it("expiringWithin filters by APR days remaining, excluding expired", () => {
    const cards = allCards(clients);
    expect(expiringWithin(cards, 30).map((k) => k.id)).toEqual(["k1"]);
    expect(expiringWithin(cards, 90).map((k) => k.id)).toEqual(["k1", "k3"]);
  });

  it("cliReadyCards returns cards eligible now (<=0 days)", () => {
    const cards = allCards(clients);
    expect(cliReadyCards(cards).map((k) => k.id)).toEqual(["k1", "k3"]);
  });

  it("totalFunding sums every card limit across clients", () => {
    expect(totalFunding(clients)).toBe(80000);
  });

  it("totalFunding is 0 with no clients", () => {
    expect(totalFunding({})).toBe(0);
  });
});
