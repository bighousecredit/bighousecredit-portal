import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App.jsx";

// App persists through a global window.storage object; mock it per test.
const storage = { get: vi.fn(), set: vi.fn() };

beforeEach(() => {
  window.storage = storage;
  storage.get.mockReset();
  storage.set.mockReset().mockResolvedValue(undefined);
});
afterEach(cleanup);

const login = (demoLabel) => {
  fireEvent.click(screen.getByText(demoLabel));
  fireEvent.click(screen.getByText("Entrar al Portal"));
};

describe("<App> persistence + routing", () => {
  it("shows a loading state, then the login screen once storage resolves", async () => {
    storage.get.mockResolvedValue(null);
    render(<App />);
    expect(screen.getByText("Cargando BigHouse Portal...")).toBeInTheDocument();
    expect(await screen.findByText("Entrar al Portal")).toBeInTheDocument();
  });

  it("falls back to SEED data (no crash) when stored JSON is corrupt", async () => {
    storage.get.mockResolvedValue({ value: "{ this is not json" });
    render(<App />);
    expect(await screen.findByText("Entrar al Portal")).toBeInTheDocument();
  });

  it("routes an admin login to the Admin panel", async () => {
    storage.get.mockResolvedValue(null);
    render(<App />);
    await screen.findByText("Entrar al Portal");
    login("🔑 Admin");
    expect(await screen.findByText("Clientes")).toBeInTheDocument();
    expect(screen.queryByText("Entrar al Portal")).not.toBeInTheDocument();
  });

  it("routes a client login to the ClientPortal", async () => {
    storage.get.mockResolvedValue(null);
    render(<App />);
    await screen.findByText("Entrar al Portal");
    login("👤 María");
    // ClientPortal greets with the client's first name.
    expect(await screen.findByText("María")).toBeInTheDocument();
  });

  it("loads persisted clients from storage instead of SEED", async () => {
    const persisted = {
      c1: {
        id: "c1", name: "Zoraida Persistida", ronda: 5, joined: "2025-01-01",
        cards: [], actionItems: [], advisorNotes: [], fundingPipeline: [],
      },
    };
    storage.get.mockResolvedValue({ value: JSON.stringify(persisted) });
    render(<App />);
    await screen.findByText("Entrar al Portal");
    login("👤 María"); // maps to cid c1
    expect(await screen.findByText("Zoraida")).toBeInTheDocument();
  });
});
