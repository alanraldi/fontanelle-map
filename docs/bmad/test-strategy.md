# Test Strategy — Fontanelle Map

## Overview

Three-layer testing pyramid: unit tests (Vitest + Testing Library), E2E browser tests (Playwright), and performance/accessibility audits (Lighthouse CI).

---

## Layer 1 — Unit & Integration Tests (Vitest)

**Config:** `vitest.config.ts` → `mergeConfig` from `vitest/config` + jsdom environment  
**Location:** `src/**/*.test.ts(x)`  
**Command:** `npm test`

### Coverage

| Area | Files |
|------|-------|
| Data normalization | `src/utils/normalize.ts` |
| Haversine distance | `src/utils/haversine.ts` |
| Distance formatting | `src/utils/distance.ts` |
| Data fetching hook | `src/hooks/useFountains.ts` |
| Distance sorting hook | `src/hooks/useDistance.ts` |
| FountainCard component | `src/components/FountainCard/` |
| FountainList component | `src/components/FountainList/` |
| FilterChips component | `src/components/FilterChips/` |
| BottomSheet component | `src/components/BottomSheet/` |
| MapView component | `src/components/MapView/` |

### Key Mocks

- `leaflet` and `leaflet.markercluster` — mocked globally in `src/test-setup.ts` (no DOM canvas required)
- `VITE_GEOJSON_URL` — stubbed via `vi.stubEnv()` in `test-setup.ts`
- `fetch` — mocked per test in `useFountains` tests

### Thresholds

- All tests must pass before merge (57/57 at Phase 6 baseline)
- No regressions allowed: `npm test -- --run` must exit 0 in CI

---

## Layer 2 — End-to-End Tests (Playwright)

**Config:** `playwright.config.ts`  
**Location:** `tests/e2e/`  
**Command:** `npx playwright test`

### Browsers

| Project | Device |
|---------|--------|
| `chromium` | Desktop Chrome |
| `mobile-chrome` | Pixel 5 |
| `firefox` | Desktop Firefox |

### Server Setup

Playwright starts `npm run preview` on `http://localhost:4173` with:
```
VITE_GEOJSON_URL=http://localhost:4173/mock-fountains.geojson
```
All GeoJSON requests are intercepted via `page.route()` before the test navigates.

### Fixture Data

`tests/e2e/fixtures/fountains.geojson` — 5 Roma fountains:

| ID | Address | Status |
|----|---------|--------|
| rm-001 | Via della Conciliazione 5 | attivo |
| rm-002 | Piazza del Colosseo 1 | inattivo |
| rm-003 | Via Appia Nuova 300 | unknown (empty string) |
| rm-004 | Lungotevere dei Mellini 12 | attivo |
| rm-005 | Via Tuscolana 450 | attivo |

Counts: 3 active, 1 inactive, 1 unknown, 5 total.

### Spec Files

| File | Scope |
|------|-------|
| `app-load.spec.ts` | Initial load: title, meta, header, skip link, GPS button, list render, count |
| `filter.spec.ts` | Filter chips: aria-pressed state, count filtering, header count update, reset |
| `fountain-selection.spec.ts` | Click item → FountainCard, badge, close → list restore, panel aria-expanded |
| `error-states.spec.ts` | HTTP 500/404 → retry button; timeout → timeout message; retry → recovery |
| `accessibility.spec.ts` | Skip link, aria-live, aria-pressed, role=region, aria-hidden on map, aria-expanded |

### Shared Helpers (`tests/e2e/helpers/setup.ts`)

| Helper | Purpose |
|--------|---------|
| `mockFountainsApi(page)` | Intercept GeoJSON URL → serve fixture (200) |
| `mockFountainsApiError(page, status)` | Intercept → return HTTP error status |
| `mockFountainsApiTimeout(page)` | Intercept → never fulfill (simulate 10s timeout) |
| `waitForFountainList(page)` | Wait for `[aria-label*="Lista fontanelle"]` to appear |

---

## Layer 3 — Performance & Accessibility Audit (Lighthouse CI)

**Config:** `lighthouserc.json`  
**Command:** `npx lhci autorun`  
**Runs against:** `./dist` (static build served by `lhci`)

### Thresholds

| Category | Level | Min Score |
|----------|-------|-----------|
| Performance | warn | ≥ 0.80 |
| Accessibility | **error** | ≥ 0.90 |
| Best Practices | warn | ≥ 0.90 |
| SEO | warn | ≥ 0.90 |

Accessibility failures block the CI pipeline. Performance/best-practices/SEO produce warnings only.

---

## CI Pipeline (`.github/workflows/ci.yml`)

```
quality ──┐
           ├── build ──┬── e2e
unit       │            └── lighthouse
```

| Job | Runs After | Purpose |
|-----|-----------|---------|
| `quality` | — | Typecheck + lint |
| `unit` | — | Vitest unit tests |
| `build` | quality | Vite build + upload dist artifact |
| `e2e` | build | Playwright on Chromium + Firefox |
| `lighthouse` | build | Lighthouse CI against dist |

Playwright report is uploaded as an artifact on every run (retained 7 days).

---

## Running Tests Locally

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run coverage

# E2E tests (requires built app)
npm run build
npx playwright test

# E2E — specific file
npx playwright test tests/e2e/filter.spec.ts

# E2E — headed mode for debugging
npx playwright test --headed

# E2E — UI mode
npx playwright test --ui

# Lighthouse audit
npm run build
npx lhci autorun
```
