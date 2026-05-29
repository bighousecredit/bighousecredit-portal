# Test Coverage Analysis — BigHouse Credit Portal

_Date: 2026-05-29_

## Summary

The project started with **0% test coverage**: no test runner, no test files, and
no testing dependencies. This document records the analysis and the first
testing increment that has been added.

The app is a single-file React app (`src/App.jsx` + `src/main.jsx`) built with
Vite. It is a **financial / credit portal**, so the correctness of credit
utilization, 0%-APR expiry countdowns, and health scoring is high-stakes — these
are the first things that should be protected by tests.

## ⚠️ Critical pre-existing issue (not fixed here)

The committed `src/App.jsx` at `HEAD` is **corrupted and will not compile**:

- The file is a 4-line JSON blob (`{"returncode":0,"stdout":"...escaped source..."}`)
  rather than raw JSX.
- All quotes are smart/curly quotes (`“ ” …`) instead of straight quotes.
- Every backtick template literal was stripped (0 backticks), leaving invalid
  syntax like `1px solid ${c}44`.
- `Admin` and `ClientPortal` are stubbed out.

A clean, complete version exists in git history at commit `5b0463c`
(`bh-portal/src/App.jsx`, 855 lines). **Recommended fix:** restore `App.jsx` from
that commit, then point its helpers at `src/lib/helpers.js` (see below). No
component-level tests can run until the file compiles again.

> This change set deliberately does **not** overwrite `App.jsx` — it only adds
> new, isolated, importable modules and their tests so nothing existing is lost.

## What was added

- **`src/lib/helpers.js`** — the pure credit/financial helpers extracted verbatim
  from `App.jsx` (`daysLeft`, `monthsOld`, `usedPct`, `$$`, `fdt`, `uid`,
  `aprSt`, `healthScore`) plus the `BH` palette, now individually importable.
- **`src/lib/helpers.test.js`** — 23 unit tests covering boundaries, clamping,
  and the scoring algorithm. Uses fake timers for deterministic date math.
- **Vitest setup** — `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `jsdom`, `@vitest/coverage-v8`; `test` / `test:run` / `coverage` scripts; jsdom
  + v8 coverage configured in `vite.config.js`.

```
npm install
npm test          # watch mode
npm run coverage  # one-shot run + coverage report
```

Current result: **23 tests passing**, `helpers.js` at ~97% coverage.

## Notable finding from the new tests

`uid()` derives uniqueness from `Date.now()` + only **3 random base-36 chars**
(~46,656 combinations). Ids minted within the same millisecond can collide. It is
fine for the current demo seed data, but if `uid()` ever backs record identity at
scale, switch to `crypto.randomUUID()` or add entropy. This is documented as a
test in `helpers.test.js`.

## Recommended next areas to cover (priority order)

1. **Restore `App.jsx`** from `5b0463c` and have it `import` from
   `src/lib/helpers.js` (removes the duplicated logic; lets component tests run).
2. **Auth — `supabaseSignIn`** (mock the Supabase client): email is trimmed +
   lowercased, auth-error path, profile-not-found path, happy-path role/cid.
3. **Admin data mutations** — `doAddClient`, `doAddCard`, `delCard`, `delClient`,
   `addNote`: validation guards, numeric coercion (`+nk.limit||0`), immutable updates.
4. **`App` persistence + routing** — `window.storage` load with `SEED` fallback on
   missing/corrupt data, `save()` persistence, role-based routing.
5. **Component rendering (React Testing Library)** — `Login` (demo-fill, error,
   loading, Enter-to-submit), `CardTile` (expand toggle, utilization color
   thresholds, delete), `BonusBar` (completed / in-progress / null), `HealthCircle`
   (color + label tiers).

## Suggested coverage targets

- Pure logic (`src/lib`): keep at **90%+**.
- Components: **70%+** statements once `App.jsx` is split into testable pieces.
- Add a CI step running `npm run coverage` on every PR.
