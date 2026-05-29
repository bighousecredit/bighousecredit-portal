// ─── CLIENT/CARD DATA OPERATIONS ───────────────────────────────
// Pure, reducer-style transforms over the `clients` map used by the
// Admin panel. Each mutation returns a NEW clients object (never
// mutates its input) or null when validation fails, so the React layer
// only decides whether to persist the result. Extracted from App.jsx
// so this logic is unit-testable (see clients.test.js).
import { uid, daysLeft } from "./helpers.js";

const defaultToday = () => new Date().toISOString().slice(0, 10);

// Normalize raw form fields into a fully-shaped card record.
// Numeric fields are coerced; blanks fall back to sane defaults.
export const normalizeCard = (nk, idGen = uid) => ({
  id: idGen(),
  bank: nk.bank,
  product: nk.product,
  limit: +nk.limit || 0,
  balance: +nk.balance || 0,
  open: nk.open,
  exp: nk.exp,
  months: +nk.months || 12,
  paymentDue: +nk.paymentDue || 1,
  annualFee: +nk.annualFee || 0,
  annualFeeDate: null,
  cliEligible: nk.cliEligible || "",
  network: "Visa",
  benefits: [],
  perks: [],
});

// Add a client. Requires name + email; returns null otherwise.
export const addClient = (clients, nc, idGen = uid, today = defaultToday) => {
  if (!nc.name || !nc.email) return null;
  const id = idGen();
  return {
    ...clients,
    [id]: { id, ...nc, joined: today(), cards: [], advisorNotes: [], actionItems: [], fundingPipeline: [] },
  };
};

// Append a card to a client. Requires bank + open + exp; null otherwise.
export const addCard = (clients, cid, nk, idGen = uid) => {
  if (!nk.bank || !nk.open || !nk.exp) return null;
  const client = clients[cid];
  if (!client) return null;
  return { ...clients, [cid]: { ...client, cards: [...client.cards, normalizeCard(nk, idGen)] } };
};

// Remove a card from a client by id.
export const removeCard = (clients, cid, kid) => {
  const client = clients[cid];
  if (!client) return clients;
  return { ...clients, [cid]: { ...client, cards: client.cards.filter((k) => k.id !== kid) } };
};

// Remove a whole client.
export const removeClient = (clients, cid) => {
  const next = { ...clients };
  delete next[cid];
  return next;
};

// Prepend an advisor note. Requires non-blank text; null otherwise.
export const addNote = (clients, cid, text, idGen = uid, today = defaultToday) => {
  if (!text || !text.trim()) return null;
  const cl = clients[cid];
  if (!cl) return null;
  const note = { id: idGen(), date: today(), text: text.trim() };
  return { ...clients, [cid]: { ...cl, advisorNotes: [note, ...(cl.advisorNotes || [])] } };
};

// ─── SELECTORS ─────────────────────────────────────────────────
// Flatten every client's cards, tagging each with its owner.
export const allCards = (clients) =>
  Object.values(clients).flatMap((c) => c.cards.map((k) => ({ ...k, cname: c.name, cid: c.id })));

// Cards whose 0% APR expires within `days` (and not already expired).
export const expiringWithin = (cards, days) =>
  cards.filter((k) => {
    const d = daysLeft(k.exp);
    return d >= 0 && d <= days;
  });

// Cards eligible for a credit-limit increase now.
export const cliReadyCards = (cards) => cards.filter((k) => daysLeft(k.cliEligible) <= 0);

// Sum of every card limit across all clients.
export const totalFunding = (clients) =>
  Object.values(clients).reduce((s, c) => s + c.cards.reduce((s2, k) => s2 + k.limit, 0), 0);
