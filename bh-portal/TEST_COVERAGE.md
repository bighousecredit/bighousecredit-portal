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

## ✅ Resolved: corrupted `App.jsx`

`src/App.jsx` at the prior `HEAD` (commit `ca5dd74`) was **corrupted and would not
compile**: a 4-line JSON blob with smart/curly quotes and every backtick template
literal stripped, with `Admin`/`ClientPortal` stubbed out.

It has been **restored from the last clean commit `5b0463c`** (855 lines) via
`git checkout` and then refactored to import its helpers/auth from the new
`src/lib` modules. `npm run build` now succeeds.

## What was added

- **`src/lib/helpers.js`** — the pure credit/financial helpers extracted from
  `App.jsx` (`daysLeft`, `monthsOld`, `usedPct`, `$$`, `fdt`, `uid`, `aprSt`,
  `healthScore`) plus the `BH` palette. `App.jsx` now imports from here.
- **`src/lib/helpers.test.js`** — 23 unit tests covering boundaries, clamping,
  and the scoring algorithm. Uses fake timers for deterministic date math.
- **`src/lib/auth.js`** — the `AUTH` credential map + a pure `authenticate(email, pw)`
  function (email normalization, no-throw failure path). `App.jsx`'s `Login` now
  calls this instead of inlining the lookup.
- **`src/lib/auth.test.js`** — 9 unit tests: valid admin/client, email
  normalization, wrong/empty/null input, case-sensitive password, AUTH map shape.
- **Vitest setup** — `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `jsdom`, `@vitest/coverage-v8`; `test` / `test:run` / `coverage` scripts; jsdom
  + v8 coverage configured in `vite.config.js`.

Current result: **32 tests passing** — `src/lib` at ~98% (auth.js 100%, helpers.js ~97%).

```
npm install
npm test          # watch mode
npm run coverage  # one-shot run + coverage report
```

## Notable finding from the new tests

`uid()` derives uniqueness from `Date.now()` + only **3 random base-36 chars**
(~46,656 combinations). Ids minted within the same millisecond can collide. It is
fine for the current demo seed data, but if `uid()` ever backs record identity at
scale, switch to `crypto.randomUUID()` or add entropy. This is documented as a
test in `helpers.test.js`.

## Recommended next areas to cover (priority order)

Done: ✅ restore + refactor `App.jsx`, ✅ pure helpers, ✅ `authenticate`.

1. **Admin data mutations** — `doAddClient`, `doAddCard`, `delCard`, `delClient`,
   `addNote`: validation guards, numeric coercion (`+nk.limit||0`), immutable updates.
   (Best done by extracting these into a `src/lib/clients.js` reducer-style module,
   mirroring the helpers/auth extraction.)
2. **`App` persistence + routing** — `window.storage` load with `SEED` fallback on
   missing/corrupt data, `save()` persistence, role-based routing.
3. **Component rendering (React Testing Library)** — `Login` (demo-fill, error,
   Enter-to-submit), `CardTile` (expand toggle, utilization color thresholds,
   delete), `BonusBar` (completed / in-progress / null), `HealthCircle`
   (color + label tiers).

## Suggested coverage targets

- Pure logic (`src/lib`): keep at **90%+**.
- Components: **70%+** statements once `App.jsx` is split into testable pieces.
- Add a CI step running `npm run coverage` on every PR.
