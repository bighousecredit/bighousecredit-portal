import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Admin } from "./App.jsx";

const NOW = new Date("2026-05-29T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const makeClients = () => ({
  c1: {
    id: "c1", name: "María Rodríguez", email: "maria@x.com", phone: "305", ronda: 2, joined: "2025-10-15",
    cards: [{
      id: "k1", bank: "Chase", product: "Ink", network: "Visa", limit: 25000, balance: 5000,
      open: "2025-10-20", exp: "2027-04-24", paymentDue: 15, annualFee: 0, cliEligible: "2026-04-20",
      signupBonus: null, benefits: [], perks: [],
    }],
    advisorNotes: [],
  },
  c2: { id: "c2", name: "Carlos Mendoza", email: "carlos@x.com", phone: "786", ronda: 1, joined: "2026-01-20", cards: [], advisorNotes: [] },
});

const renderAdmin = () => {
  const save = vi.fn();
  render(<Admin clients={makeClients()} save={save} logout={vi.fn()} />);
  return { save };
};

const gotoClients = () => fireEvent.click(screen.getByText("Clientes"));
const selectMaria = () => {
  // The client filter row uses first names; click the "María" pill.
  const pills = screen.getAllByText("María");
  fireEvent.click(pills[pills.length - 1]);
};

describe("<Admin>", () => {
  it("shows overview KPIs and the client list", () => {
    renderAdmin();
    expect(screen.getByText("Clientes Activos")).toBeInTheDocument();
    expect(screen.getByText("Total Funding")).toBeInTheDocument();
    expect(screen.getByText("María Rodríguez")).toBeInTheDocument();
    expect(screen.getByText("Carlos Mendoza")).toBeInTheDocument();
  });

  it("creates a client through the modal and persists via save()", () => {
    const { save } = renderAdmin();
    gotoClients();
    fireEvent.click(screen.getByText("Nuevo Cliente"));
    const boxes = screen.getAllByRole("textbox"); // [name, email, phone]
    fireEvent.change(boxes[0], { target: { value: "Ana Nueva" } });
    fireEvent.change(boxes[1], { target: { value: "ana@x.com" } });
    fireEvent.click(screen.getByText("Crear"));

    expect(save).toHaveBeenCalledTimes(1);
    const names = Object.values(save.mock.calls[0][0]).map((c) => c.name);
    expect(names).toContain("Ana Nueva");
  });

  it("does not create a client when name/email are blank", () => {
    const { save } = renderAdmin();
    gotoClients();
    fireEvent.click(screen.getByText("Nuevo Cliente"));
    fireEvent.click(screen.getByText("Crear"));
    expect(save).not.toHaveBeenCalled();
  });

  it("posts an advisor note to the selected client", () => {
    const { save } = renderAdmin();
    gotoClients();
    selectMaria();
    fireEvent.change(
      screen.getByPlaceholderText("Escribe una nota estratégica visible al cliente..."),
      { target: { value: "Baja utilización al 10%" } },
    );
    fireEvent.click(screen.getByText("Enviar"));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].c1.advisorNotes[0].text).toBe("Baja utilización al 10%");
  });

  it("adds a card to the selected client through the card modal", () => {
    const { save } = renderAdmin();
    gotoClients();
    selectMaria();
    fireEvent.click(screen.getByText("Tarjeta"));

    fireEvent.change(screen.getByPlaceholderText("Chase, Amex, BoA..."), { target: { value: "Amex" } });
    expect(screen.getByText(/Nueva Tarjeta/)).toBeInTheDocument();
    const dates = document.querySelectorAll('input[type="date"]'); // [open, exp, cliEligible]
    fireEvent.change(dates[0], { target: { value: "2026-01-01" } });
    fireEvent.change(dates[1], { target: { value: "2027-01-01" } });
    fireEvent.click(screen.getByText("Guardar"));

    expect(save).toHaveBeenCalledTimes(1);
    const cards = save.mock.calls[0][0].c1.cards;
    expect(cards).toHaveLength(2);
    expect(cards[1]).toMatchObject({ bank: "Amex", open: "2026-01-01", exp: "2027-01-01" });
  });
});

describe("<Admin> alerts tab", () => {
  const baseCard = { network: "Visa", balance: 0, paymentDue: 1, annualFee: 0, signupBonus: null, benefits: [], perks: [] };

  const renderWith = (cards) => {
    render(<Admin clients={{ c1: { id: "c1", name: "María Rodríguez", cards } }} save={vi.fn()} logout={vi.fn()} />);
    fireEvent.click(screen.getByText(/^Alertas/));
  };

  it("lists CLI-ready cards and 0% APR cards about to expire", () => {
    renderWith([
      { ...baseCard, id: "k1", bank: "Chase", product: "Ink", limit: 25000, exp: "2028-01-01", cliEligible: "2026-01-01" }, // CLI ready
      { ...baseCard, id: "k2", bank: "Amex", product: "Gold", limit: 50000, exp: "2026-06-15", cliEligible: "2028-01-01" }, // expiring ~17d
    ]);
    expect(screen.getByText(/CLI DISPONIBLES/)).toBeInTheDocument();
    expect(screen.getByText("María Rodríguez — Chase Ink")).toBeInTheDocument();
    expect(screen.getByText(/0% APR PRÓXIMOS A VENCER/)).toBeInTheDocument();
    expect(screen.getByText("María Rodríguez — Amex Gold")).toBeInTheDocument();
  });

  it("shows the empty state and no CLI section when nothing is due", () => {
    renderWith([
      { ...baseCard, id: "k1", bank: "Chase", product: "Ink", limit: 25000, exp: "2028-01-01", cliEligible: "2028-01-01" },
    ]);
    expect(screen.getByText("✅ Ninguna tarjeta expira en 90 días")).toBeInTheDocument();
    expect(screen.queryByText(/CLI DISPONIBLES/)).not.toBeInTheDocument();
  });
});
