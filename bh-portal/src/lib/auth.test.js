import { describe, it, expect } from "vitest";
import { authenticate, AUTH } from "./auth.js";

describe("authenticate", () => {
  it("accepts valid admin credentials and returns the admin role", () => {
    const res = authenticate("admin@bighousecredit.com", "BH2024");
    expect(res).toEqual({ ok: true, role: "admin", cid: undefined });
  });

  it("accepts a valid client and returns role + cid", () => {
    const res = authenticate("maria@demo.com", "demo123");
    expect(res).toEqual({ ok: true, role: "client", cid: "c1" });
  });

  it("normalizes email casing and surrounding whitespace", () => {
    const res = authenticate("  MARIA@DEMO.COM  ", "demo123");
    expect(res.ok).toBe(true);
    expect(res.cid).toBe("c1");
  });

  it("rejects a wrong password without leaking which field was wrong", () => {
    const res = authenticate("maria@demo.com", "nope");
    expect(res).toEqual({ ok: false, error: "Credenciales incorrectas" });
  });

  it("rejects an unknown email", () => {
    expect(authenticate("ghost@demo.com", "demo123").ok).toBe(false);
  });

  it("is case-sensitive on the password", () => {
    expect(authenticate("maria@demo.com", "DEMO123").ok).toBe(false);
  });

  it("never throws on empty / null / undefined input", () => {
    expect(() => authenticate("", "")).not.toThrow();
    expect(() => authenticate(null, null)).not.toThrow();
    expect(() => authenticate(undefined, undefined)).not.toThrow();
    expect(authenticate(null, null).ok).toBe(false);
  });

  it("rejects when the email exists but no password is supplied", () => {
    expect(authenticate("admin@bighousecredit.com", "").ok).toBe(false);
  });

  it("every client entry in AUTH maps to a cid; admin has none", () => {
    Object.values(AUTH).forEach((u) => {
      if (u.role === "client") expect(typeof u.cid).toBe("string");
      if (u.role === "admin") expect(u.cid).toBeUndefined();
    });
  });
});
