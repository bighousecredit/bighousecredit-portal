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
- **`src/lib/clients.js`** — reducer-style pure transforms for the Admin panel
  (`addClient`, `addCard`, `removeCard`, `removeClient`, `addNote`, `normalizeCard`)
  plus selectors (`allCards`, `expiringWithin`, `cliReadyCards`, `totalFunding`).
  `Admin` in `App.jsx` now delegates to these instead of inlining the logic.
- **`src/lib/clients.test.js`** — unit tests covering validation guards, numeric
  coercion, immutability (no input mutation), note prepend/init, and all selectors.
- **`src/App.test.jsx`** — React Testing Library tests for the UI components
  (`Login`, `BonusBar`, `CardTile`, `HealthCircle`), exported by name from
  `App.jsx` for testing. Covers login success/error/demo-fill/Enter/password
  toggle, bonus states, health-score label tiers, and card expand + delete.
- **Vitest setup** — `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `jsdom`, `@vitest/coverage-v8`; `test` / `test:run` / `coverage` scripts; jsdom
  + v8 coverage configured in `vite.config.js`.

All `src/lib` business logic is unit tested (helpers, auth, client/card ops) and
the leaf UI components have render/interaction tests.

Current result: **66 tests passing** — overall ~50% line coverage; `src/lib` ~99%
(auth 100%, clients 100%, helpers ~97%); `App.jsx` ~40% (leaf components + atoms).

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

Done: ✅ restore + refactor `App.jsx`, ✅ pure helpers, ✅ `authenticate`,
✅ Admin data ops + selectors (`src/lib/clients.js`),
✅ leaf component render/interaction tests (`Login`, `BonusBar`, `CardTile`, `HealthCircle`).

1. **`App` persistence + routing** — `window.storage` load with `SEED` fallback on
   missing/corrupt data, `save()` persistence, role-based routing (admin vs client
   vs login). Best tested by mocking `window.storage` and rendering `<App/>`.
2. **`Admin` / `ClientPortal` container tests** — now that the data logic is
   extracted and unit tested, add a few integration tests exercising the panels
   (add/delete client+card flows, tab switching, alerts counts).
3. **CI** — run `npm run coverage` on every PR and enforce a threshold for `src/lib`.

## Suggested coverage targets

- Pure logic (`src/lib`): keep at **90%+**.
- Components: **70%+** statements once `App.jsx` is split into testable pieces.
- Add a CI step running `npm run coverage` on every PR.
