import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClientPortal } from "./App.jsx";

const NOW = new Date("2026-05-29T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const makeClient = () => ({
  id: "c1", name: "María Rodríguez", ronda: 2, joined: "2025-10-15",
  cards: [],
  actionItems: [
    { id: "a1", text: "Pagar Chase Ink", done: false },
    { id: "a2", text: "Enviar estados", done: true },
  ],
  advisorNotes: [{ id: "n1", date: "2026-03-15", text: "Buen progreso" }],
});

const renderPortal = () => render(<ClientPortal client={makeClient()} logout={vi.fn()} />);

describe("<ClientPortal>", () => {
  it("greets the client and lists only pending tasks on the dashboard", () => {
    renderPortal();
    expect(screen.getByText("María")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Pagar Chase Ink")).toBeInTheDocument(); // undone
    expect(screen.queryByText("Enviar estados")).not.toBeInTheDocument(); // done -> hidden
  });

  it("toggling a pending task removes it from the pending list", () => {
    renderPortal();
    fireEvent.click(screen.getByText("Pagar Chase Ink"));
    expect(screen.queryByText("Pagar Chase Ink")).not.toBeInTheDocument();
  });

  it("switches to the strategy tab showing the action plan and advisor notes", () => {
    renderPortal();
    fireEvent.click(screen.getByText("Mi Estrategia"));
    expect(screen.getByText(/PLAN DE ACCIÓN/)).toBeInTheDocument();
    expect(screen.getByText("Pagar Chase Ink")).toBeInTheDocument();
    expect(screen.getByText("Enviar estados")).toBeInTheDocument(); // both shown here
    expect(screen.getByText("Buen progreso")).toBeInTheDocument();
  });

  it("switches to the cards tab (empty state renders without crashing)", () => {
    renderPortal();
    fireEvent.click(screen.getByText(/Tarjetas \(0\)/));
    expect(screen.getByText("Mis Tarjetas de Negocio")).toBeInTheDocument();
  });

  it("renders the benefits tab (spend optimizer)", () => {
    renderPortal();
    fireEvent.click(screen.getByText("Beneficios"));
    expect(screen.getByText("Optimizador de Gastos")).toBeInTheDocument();
  });

  it("renders the calendar tab with an empty-events state", () => {
    renderPortal();
    fireEvent.click(screen.getByText("Calendario"));
    expect(screen.getByText("Calendario Financiero")).toBeInTheDocument();
    expect(screen.getByText(/Sin eventos próximos/)).toBeInTheDocument();
  });

  it("returns null when no client is provided", () => {
    const { container } = render(<ClientPortal client={null} logout={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
