import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Login, BonusBar, CardTile, HealthCircle } from "./App.jsx";

const NOW = new Date("2026-05-29T12:00:00.000Z");
const DAY = 86_400_000;
const inDays = (n) => new Date(NOW.getTime() + n * DAY).toISOString().slice(0, 10);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("<Login>", () => {
  const setup = () => {
    const onAuth = vi.fn();
    const { container } = render(<Login onAuth={onAuth} />);
    const email = screen.getByPlaceholderText("tu@email.com");
    const pw = container.querySelector('input[placeholder="••••••••"]');
    return { onAuth, container, email, pw };
  };

  it("authenticates valid admin credentials and calls onAuth", () => {
    const { onAuth, email, pw } = setup();
    fireEvent.change(email, { target: { value: "admin@bighousecredit.com" } });
    fireEvent.change(pw, { target: { value: "BH2024" } });
    fireEvent.click(screen.getByText("Entrar al Portal"));
    expect(onAuth).toHaveBeenCalledWith({ role: "admin", cid: undefined });
  });

  it("shows an error and does not call onAuth on bad credentials", () => {
    const { onAuth, email, pw } = setup();
    fireEvent.change(email, { target: { value: "admin@bighousecredit.com" } });
    fireEvent.change(pw, { target: { value: "wrong" } });
    fireEvent.click(screen.getByText("Entrar al Portal"));
    expect(screen.getByText("Credenciales incorrectas")).toBeInTheDocument();
    expect(onAuth).not.toHaveBeenCalled();
  });

  it("fills inputs from a demo row, then logs in", () => {
    const { onAuth } = setup();
    fireEvent.click(screen.getByText("👤 María"));
    fireEvent.click(screen.getByText("Entrar al Portal"));
    expect(onAuth).toHaveBeenCalledWith({ role: "client", cid: "c1" });
  });

  it("toggles password visibility", () => {
    const { pw } = setup();
    expect(pw.type).toBe("password");
    fireEvent.click(pw.nextElementSibling); // the eye toggle button
    expect(pw.type).toBe("text");
  });

  it("submits on Enter in the password field", () => {
    const { onAuth, email, pw } = setup();
    fireEvent.change(email, { target: { value: "carlos@demo.com" } });
    fireEvent.change(pw, { target: { value: "demo123" } });
    fireEvent.keyDown(pw, { key: "Enter" });
    expect(onAuth).toHaveBeenCalledWith({ role: "client", cid: "c2" });
  });
});

describe("<BonusBar>", () => {
  it("renders nothing without a bonus", () => {
    const { container } = render(<BonusBar sb={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a completed bonus with its reward", () => {
    render(<BonusBar sb={{ completed: true, reward: "$900 cash back" }} />);
    expect(screen.getByText(/Sign-up bonus completado/)).toHaveTextContent("$900 cash back");
  });

  it("shows progress and remaining amount for an in-progress bonus", () => {
    render(<BonusBar sb={{ required: 6000, spent: 4500, deadline: "2026-08-01", reward: "120k pts" }} />);
    expect(screen.getByText("🎯 SIGN-UP BONUS")).toBeInTheDocument();
    expect(screen.getByText("$4,500 / $6,000")).toBeInTheDocument();
    expect(screen.getByText(/Faltan \$1,500/)).toBeInTheDocument();
  });
});

describe("<HealthCircle>", () => {
  it.each([
    [85, "Excelente"],
    [70, "Bueno"],
    [50, "Regular"],
    [30, "Crítico"],
  ])("score %i renders label %s", (score, label) => {
    render(<HealthCircle score={score} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(String(score))).toBeInTheDocument();
  });
});

describe("<CardTile>", () => {
  const card = {
    id: "k1", bank: "Chase", product: "Ink Business Cash", network: "Visa",
    limit: 25000, balance: 5000, open: inDays(-60), exp: inDays(400),
    paymentDue: 15, annualFee: 0, cliEligible: inDays(-1), signupBonus: null,
    benefits: [{ cat: "Telecom", mult: "5%", icon: "📡" }],
    perks: ["Sin cuota anual"],
  };

  it("renders bank, limit and utilization", () => {
    render(<CardTile card={card} />);
    expect(screen.getByText("Chase")).toBeInTheDocument();
    expect(screen.getByText("$25,000")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument(); // 5000/25000
  });

  it("hides benefits until expanded, then reveals them", () => {
    render(<CardTile card={card} />);
    expect(screen.queryByText("MULTIPLICADORES")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Ver beneficios y perks"));
    expect(screen.getByText("MULTIPLICADORES")).toBeInTheDocument();
    expect(screen.getByText(/Telecom/)).toBeInTheDocument();
    expect(screen.getByText("Sin cuota anual")).toBeInTheDocument();
  });

  it("calls onDel with the card id when the trash button is clicked", () => {
    const onDel = vi.fn();
    render(<CardTile card={card} onDel={onDel} />);
    fireEvent.click(screen.getAllByRole("button")[0]); // trash button (first)
    expect(onDel).toHaveBeenCalledWith("k1");
  });
});
