// ─── AUTH ──────────────────────────────────────────────────────
// Demo credential map. NOTE: passwords are stored in plaintext on the
// client — acceptable only for this demo/seed scenario. A real
// deployment must authenticate server-side (see TEST_COVERAGE.md).
export const AUTH = {
  "admin@bighousecredit.com":  { pw: "BH2024",       role: "admin" },
  "gian@bighousecredit.com":   { pw: "BHGian2024",   role: "client", cid: "c_gian" },
  "gordis@bighousecredit.com": { pw: "BHGordis2024", role: "client", cid: "c_gordis" },
  "maria@demo.com":            { pw: "demo123",       role: "client", cid: "c1" },
  "carlos@demo.com":           { pw: "demo123",       role: "client", cid: "c2" },
};

// Validate credentials against the AUTH map.
// Email is trimmed + lowercased before lookup so input casing/whitespace
// never blocks a valid login. Returns a session-ish object on success or
// { ok:false, error } on failure — never throws.
export const authenticate = (email, pw, table = AUTH) => {
  const key = (email || "").trim().toLowerCase();
  const u = table[key];
  if (!u || u.pw !== pw) {
    return { ok: false, error: "Credenciales incorrectas" };
  }
  return { ok: true, role: u.role, cid: u.cid };
};
