# book-flip-showcase — v2 Architecture Plan

This document defines how to **freeze v1**, **branch v2 development**, and reorganize **routes and source layout** so both versions can coexist without blocking production hotfixes or experimental work.

It supersedes routing and directory guidance in [`plan-1.md`](./plan-1.md) **only for the v2 era**. v1 behavior remains documented in plan-1 and is treated as the frozen baseline.

---

## 1. Context & Goals

### 1.1 Current state (v1 baseline)

| Item | Value |
| --- | --- |
| Package version | `1.0.0` |
| Routes | `/` (Gallery), `/book/:id` (Reader), `*` (NotFound) |
| Source root | `src/` — flat pages, components, hooks, data |
| Deploy | GitHub Pages, `base = /book-cover-t1/` |
| Release branch | `release` triggers Pages deploy |

v1 delivers a static SPA: gallery → reader with CSS 3D flip, five presets, spread/cover modes, scrubber, keyboard nav, theming, and a11y. **No backend, no CMS.**

### 1.2 v2 goals

- **Preserve v1** as a stable, linkable demo (`v1.0.x` hotfixes on `maint/v1`).
- **Develop v2 on `maint/v2`** with freedom to refactor reader core, add features (WebGL renderer, richer gallery, i18n, etc.), and break internal APIs.
- **Integrate on `main`** — both maintenance lines land on `main` via PR before anything ships.
- **Deploy from `release` only** — `main` → `release` → GitHub Pages (unchanged infra).
- **Coexist in one deploy** so stakeholders can compare v1 vs v2 at stable URLs.
- **Keep CI green** for both trees during the transition window.

### 1.3 Non-goals (v2 plan phase)

- Splitting into a full monorepo with published npm packages (defer until a second app needs the reader).
- Running v1 and v2 on separate domains (optional later; path prefix is enough for now).

---

## 2. Version & Git Strategy

### 2.1 Branch model (maint → main → release)

All version work flows through **`main`** before it reaches **`release`**. There is no direct path from `maint/*` to `release` and no deploy from `main`.

```
                    ┌─────────────┐
                    │  maint/v1   │  v1 hotfixes · src/v1/** only
                    └──────┬──────┘
                           │ PR (squash) + CI green
┌─────────────┐            ▼            ┌─────────────┐
│  maint/v2   │ ──PR + CI──▶   main   ◀──│  feat/* PRs │  optional short-lived
└─────────────┘            │            └─────────────┘  branches off maint/v2
                           │ merge (when shippable)
                           ▼
                    ┌─────────────┐
                    │   release   │  GitHub Pages + release-please ONLY
                    └──────┬──────┘
                           ▼
                    GitHub Pages live
```

| Branch | Lifetime | Scope | Merges into |
| --- | --- | --- | --- |
| **`maint/v1`** | Long-lived | `src/v1/**`, v1 e2e, v1-only docs; shared fixes if v1 needs them | **`main`** (PR) |
| **`maint/v2`** | Long-lived | `src/v2/**`, `src/app/**` shell, v2 e2e; shared types/utils | **`main`** (PR) |
| **`main`** | Permanent | Integration — must always build v1 + v2 together | **`release`** (merge) |
| **`release`** | Permanent | Deploy + semver tags only; no feature commits | — (Pages artifact) |

**Rules**

1. **`maint/v1` and `maint/v2` never merge into each other** — only into `main`.
2. **`release` never receives commits except merges from `main`** (plus release-please version-bump commits on `release`).
3. **Never deploy `main` directly** — always `main` → `release` → Pages.
4. Short-lived branches (`fix/67-v1-cover-snap`, `feat/80-v2-webgl`) branch off the relevant **`maint/*`**, not off `main`, unless it is repo-wide tooling/docs.

### 2.2 Freeze v1 & bootstrap maintenance branches

1. Ensure `main` is release-quality (CI green, `package.json` at `1.0.0`).
2. Merge `main` → `release`; confirm GitHub Pages deploy is green.
3. Tag the deployed commit (if not already present — see #18):
   ```bash
   git checkout release && git pull
   git tag -a v1.0.0 -m "v1.0.0 — gallery + reader MVP frozen"
   git push origin v1.0.0
   ```
4. Create long-lived maintenance branches from `main` after Phase 1 directory split:
   ```bash
   git checkout main && git pull
   git branch maint/v1 main   # tracks v1 line; cut from post-migration main
   git branch maint/v2 main   # v2 work starts here
   git push -u origin maint/v1 maint/v2
   ```
5. **Policy**
   - **`maint/v1`** — v1 hotfixes and docs (`fix(v1):`, `docs(v1):`); patch releases `1.0.x`.
   - **`maint/v2`** — v2 features and refactors (`feat(v2):`, `refactor(v2):`); eventually `2.0.0`.
   - **`main`** — always integration-ready; absorbs merged work from both `maint/*` lines.
   - **`release`** — production; merge from `main` when shipping to Pages.
   - **Tags** — `v1.0.x` / `v2.0.x` cut on `release` by release-please.

### 2.3 Release Please / CHANGELOG

- [release-please](https://github.com/googleapis/release-please) runs on push to **`release`** (`.github/workflows/release-please.yml`), same trigger family as deploy.
- Ship loop:
  1. PR `maint/v1` or `maint/v2` → **`main`** (CI must pass).
  2. When ready for production: merge **`main` → `release`**.
  3. Push to `release` runs release-please (tag + changelog) and **deploy.yml** (Pages).
  4. Optionally merge `release` → `main` to sync version-bump commits back.

### 2.4 Deploy (`release` = GitHub Pages)

> **`release` is the GitHub Pages deployment branch.** Do not rename it or add a competing deploy branch.

| Workflow | Trigger | Effect |
| --- | --- | --- |
| `ci.yml` | PR / push to **`main`** | lint · test · e2e · build gate |
| `deploy.yml` | push to **`release`** | build `dist/` → GitHub Pages |
| `release-please.yml` | push to **`release`** | semver tag + `CHANGELOG.md` |

**What gets deployed**

- One artifact from **`release`**, built from whatever was last merged from **`main`**, containing both route trees (`/`, `/v1/*`, `/v2/*` — see §3).
- `VITE_BASE_URL=/book-cover-t1/` in `deploy.yml`; unchanged.

**Typical workflows**

| Task | Flow |
| --- | --- |
| v1 hotfix | branch off `maint/v1` → PR → **`main`** → when shippable: **`main` → `release`** |
| v2 feature | branch off `maint/v2` → PR → **`main`** → when shippable: **`main` → `release`** |
| Ship both v1 fix + v2 WIP on main | Only merge to `release` when **`main` is releasable**; otherwise keep v2 on `maint/v2` until v1 fix lands on `main` alone |
| Emergency v1-only on busy `main` | Finish v1 fix on `maint/v1` → PR to **`main`** with minimal diff; do **not** bypass `main` to reach `release` |

**Do not** create `release/v1`, deploy from `maint/*`, or commit features directly on `release`.

---

## 3. Routing Design

### 3.1 URL map (target)

All paths are relative to `import.meta.env.BASE_URL` (e.g. `/book-cover-t1/`).

| Path | Version | Page | Notes |
| --- | --- | --- | --- |
| `/` | — | **VersionHub** | Links to v1 and v2; optional auto-redirect via `localStorage` preference |
| `/v1` | v1 | Gallery | Same UX as current `/` |
| `/v1/book/:id` | v1 | Reader | Same UX as current `/book/:id` |
| `/v2` | v2 | Gallery | v2 shell + enhanced gallery |
| `/v2/book/:id` | v2 | Reader | v2 reader (may diverge freely) |
| `/v1/*`, `/v2/*` | * | NotFound | Version-scoped 404 |
| `*` | — | NotFound | Root 404 with links to `/v1` and `/v2` |

### 3.2 Backward compatibility (transition period)

For **one release cycle** after migration, keep legacy aliases that redirect (301-style client redirect):

| Legacy | Redirect to |
| --- | --- |
| `/` (if user bookmarked old gallery) | `/v1` or VersionHub (product decision; recommend **VersionHub** at `/`, redirect old deep links only) |
| `/book/:id` | `/v1/book/:id` |

Implementation: thin redirect routes in `src/app/routes/legacy-redirects.tsx` using `<Navigate replace />`.

Remove legacy aliases once analytics / docs confirm no traffic (target: v2.0.0 stable).

### 3.3 Router shell

```tsx
// src/app/App.tsx (conceptual)
<Routes>
  <Route path="/" element={<RootLayout />}>
    <Route index element={<VersionHub />} />

    <Route path="v1" element={<V1Layout />}>
      <Route index element={<V1Gallery />} />
      <Route path="book/:id" element={<V1Reader />} />
      <Route path="*" element={<V1NotFound />} />
    </Route>

    <Route path="v2" element={<V2Layout />}>
      <Route index element={<V2Gallery />} />
      <Route path="book/:id" element={<V2Reader />} />
      <Route path="*" element={<V2NotFound />} />
    </Route>

    <Route path="*" element={<RootNotFound />} />
  </Route>
</Routes>
```

- **Lazy-load** each version’s Reader (and heavy v2 chunks) with `React.lazy` + `Suspense`.
- **Do not share Layout chrome** between v1 and v2 until v2 design stabilizes; duplicate or wrap intentionally.

### 3.4 E2E & Playwright

- Restructure specs by version:
  ```
  e2e/
    shared/          # helpers.ts, auth-less utilities
    v1/              # move existing specs here; baseURL paths → /v1/...
    v2/              # new scenarios
    version-hub.spec.ts
  ```
- `playwright.config.ts`: optional `projects` for `v1` and `v2` with `grep` or separate directories.
- Update seed helpers (`seedViewMode`, etc.) to accept `{ version: 'v1' | 'v2' }` defaulting to `v1` for unchanged tests.

---

## 4. Source Directory Layout

### 4.1 Recommended structure (single Vite app)

Move current `src/` into `src/v1/` and add parallel `v2/` plus a thin app shell.

```
src/
  app/                          # version-agnostic shell
    App.tsx                     # route tree (§3.3)
    main.tsx                    # entry re-export or bootstrap
    layouts/
      RootLayout.tsx            # minimal: skip link, outlet
      VersionHub.tsx
      RootNotFound.tsx
    routes/
      legacy-redirects.tsx

  v1/                           # FROZEN — move existing src here
    pages/
      Gallery.tsx
      Reader.tsx
    components/
      Layout.tsx                # v1 chrome (rename V1Layout externally)
      gallery/
      reader/
      ThemeToggle.tsx
      NotFound.tsx
    hooks/
    data/
    lib/
      class-names.ts            # v1 copy; v2 may fork or import shared

  v2/                           # NEW — v2 development root
    pages/
      Gallery.tsx
      Reader.tsx
    components/
      layout/
      gallery/
      reader/                   # WebGL / new flip engine lives here
    hooks/
    data/
    lib/

  shared/                       # ONLY code both versions import
    types/
      book.ts                   # IBook if truly identical
    lib/
      clsx-helpers.ts             # optional: CLASS_LINE_LIMIT, tiny utils
    constants/
      storage-keys.ts           # namespaced: v1:* vs v2:* keys

  index.css                     # global Tailwind entry (or split per version later)
  vite-env.d.ts
```

**Import aliases** (`tsconfig.app.json`):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@app/*": ["./src/app/*"],
      "@v1/*": ["./src/v1/*"],
      "@v2/*": ["./src/v2/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

**Rules**

| Rule | Rationale |
| --- | --- |
| `v1/` may not import from `v2/` | Prevents accidental coupling |
| `v2/` may import from `@shared/` only | Shared kernel stays minimal |
| `v2/` must not import from `@v1/` | v1 is frozen; copy-once if needed |
| Hotfixes touch `v1/` + `@shared/` only if bug is shared | Prefer duplicating one line over coupling |

### 4.2 Alternative: dual build (not recommended yet)

Two Vite configs (`vite.v1.config.ts`, `vite.v2.config.ts`) outputting to `dist/v1` and `dist/v2`. Use only if bundle size or dependency graphs diverge radically (e.g. v2 adds Three.js, v1 must stay &lt; 200 KB). Adds deploy/CI complexity — **defer**.

### 4.3 Alternative: pnpm workspace monorepo (future)

```
apps/
  showcase/        # shell + VersionHub
packages/
  reader-v1/
  reader-v2/
  shared-types/
```

Adopt when a **second consumer** (embed widget, npm package) appears. Until then, single-app `src/v1` + `src/v2` is simpler.

---

## 5. Static Assets & Data

### 5.1 `public/`

```
public/
  books/              # shared cover SVGs (both versions)
  v1/                 # optional v1-only assets
  v2/                 # v2-only assets (textures, WebGL env maps)
  favicon.svg
```

- v1 keeps referencing `/books/...` (unchanged).
- v2 new assets go under `public/v2/` to avoid cache collisions.

### 5.2 Data modules

| Module | Location | Notes |
| --- | --- | --- |
| v1 catalog | `src/v1/data/books.ts` | Frozen schema (`IBook`) |
| v2 catalog | `src/v2/data/books.ts` | May extend `IBookV2` with series, tags, EPUB path, etc. |
| Shared type | `src/shared/types/book.ts` | Extract only fields both need |

### 5.3 localStorage keys

Namespace by version to avoid cross-talk when users switch `/v1` ↔ `/v2`:

```
book-flip-showcase:v1:theme
book-flip-showcase:v2:theme
```

Migration helper (one-time on v1 mount): read legacy unprefixed keys, write prefixed, delete old.

---

## 6. Build, Env & Deploy

### 6.1 Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_BASE_URL` | GitHub Pages base (unchanged) |
| `VITE_DEFAULT_VERSION` | `v1` \| `v2` — optional VersionHub default highlight |
| `VITE_V1_ENABLED` | `true`/`false` — strip v1 routes in v2-only builds (future) |

### 6.2 Single-artifact deploy (via `release` branch)

One `pnpm build` on **`release`** → `dist/` uploaded to GitHub Pages. Public URLs:

- `https://<user>.github.io/book-cover-t1/` → VersionHub (after Phase 2)
- `.../v1/` → frozen v1 demo
- `.../v2/` → v2 preview

Workflow (unchanged infrastructure):

```yaml
# .github/workflows/deploy.yml — trigger stays on release
on:
  push:
    branches: [release]
```

React Router keeps `basename={import.meta.env.BASE_URL}` in `main.tsx`. **Never deploy from `main` directly** — always merge into `release`.

### 6.3 CI matrix (later)

| Job | Scope |
| --- | --- |
| `lint-test-e2e-v1` | `e2e/v1/**`, vitest paths matching `src/v1/**` |
| `lint-test-e2e-v2` | `e2e/v2/**`, vitest paths matching `src/v2/**` |

Initially, run **full suite** on every PR; split when v2 tests multiply.

---

## 7. Migration Plan (phased)

### 7.0 Progress snapshot (2026-05-29)

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 0 — Tag & bootstrap branches | Done | `v1.0.0`, `maint/v1`, and `maint/v2` exist. |
| Phase 1 — Directory move | Done | `src/app`, `src/v1`, versioned routes, and legacy redirects are on `main`. |
| Phase 2 — v2 scaffold | Done | VersionHub and `/v2` gallery/reader routes are on `main`. |
| Phase 3 — v2 reader quality | In progress | Classic realism, flicker handoff, spine shadow, and edge reveal fixes are merged to `main`. |
| Release to Pages | Pending this ship loop | `main` must be merged to `release` so GitHub Pages deploys the current v2 work. |

### Phase 0 — Tag & bootstrap branches

- [x] Confirm `v1.0.0` tag on a release-quality deploy commit (#18)
- [x] After Phase 1 lands on `main`: create and push **`maint/v1`**, **`maint/v2`**
- [x] Document ship loop: `maint/*` → `main` → `release` → Pages

### Phase 1 — Directory move (PR `maint/v2` or `main` → then sync `maint/*`)

- [x] Create `src/app/`, `src/v1/`, and versioned app shell
- [x] `git mv` current pages/components/hooks/data/lib → `src/v1/`
- [x] Update imports to `@v1/*`
- [x] Add route prefix `/v1` + legacy redirects from `/book/:id`
- [x] Move e2e specs → `e2e/v1/`, fix paths
- [x] All CI green on `main`; merge `main` → `release` and verify Pages + `/v1` paths

### Phase 2 — v2 scaffold (on `maint/v2` → PR → `main`)

- [x] Add `src/v2/` with Gallery + Reader fork
- [x] VersionHub at `/`
- [x] `e2e/v2/smoke.spec.ts`

### Phase 3 — v2 feature development (ongoing on `maint/v2`)

- [ ] Implement v2 milestones (see §8)
- [ ] Gradually replace v2 Reader stub with new engine
- [ ] Remove legacy redirects when ready

---

## 8. v2 Product Milestones (tentative)

1. **M2.1 — Shell** — VersionHub, `/v2` routes, namespaced storage, CI split prep. *(shell landed in Phase 1 — #67; storage namespacing still open.)*
2. **M2.2 — Reader engine (CSS flip polish, sequential)** — fork v1 flip stack into `src/v2/components/reader/`, then improve motion quality **before** any WebGL/canvas prototype:
   - **M2.2a — Classic realism** ([#71](https://github.com/naturalkei/book-cover-t1/issues/71)) — shipped to `main`; paper-like page turn starting from the Classic preset with improved easing, perspective, and spine pivot.
   - **M2.2b — Flicker fix** ([#72](https://github.com/naturalkei/book-cover-t1/issues/72)) — shipped to `main`; outgoing ↔ static handoff now uses stable static layers, transition-end cleanup, and mask-aware spreads.
   - **M2.2c — Spine shadow polish** ([#73](https://github.com/naturalkei/book-cover-t1/issues/73)) — shipped to `main`; center gutter shadow now has active/idle phase state and no final-phase pop.
   - **M2.2 edge reveal** ([#78](https://github.com/naturalkei/book-cover-t1/issues/78)) — shipped to `main`; static reveal is deferred at cover and final-spread boundaries to prevent flash-through.
   - **M2.2d — Engine prototype (later)** — WebGL or canvas flip only if CSS path hits a quality/perf ceiling.
3. **M2.3 — Gallery++** — filters, search, series grouping, richer metadata.
4. **M2.4 — Content** — optional EPUB ingest (client-side), still no DRM.
5. **M2.5 — Polish** — perf budget, a11y audit, i18n if needed.
6. **M2.6 — Release** — `v2.0.0` tag via release-please on `release`; v1 code frozen under `src/v1/`.

### 8.1 Reader flip quality backlog (M2.2 detail)

Work **only** under `src/v2/**` on branch `maint/v2`. Do not import `@v1/` — fork the v1 reader flip baseline once, then iterate.

| Order | Issue | Problem | Key code (v1 baseline to fork) |
| --- | --- | --- | --- |
| 1 | [#71](https://github.com/naturalkei/book-cover-t1/issues/71) | Classic flip feels flat, not like turning paper | `flip-presets.ts` classic frames; `OutgoingLayer` double-RAF phase (#39) |
| 2 | [#72](https://github.com/naturalkei/book-cover-t1/issues/72) | Page image flickers mid-flip | `PageFlip` outgoing timeout + `PageSurface` key remount; classic `opacity: 0` at `final` |
| 3 | [#73](https://github.com/naturalkei/book-cover-t1/issues/73) | Center spine shadow pops at `final` phase | Container spine gradient (`PageFlip` L177–184) + preset `boxShadow`/`drop-shadow` at phase swap |

**Definition of done (M2.2a–c):** `/v2/book/:id` renders the improved reader; v1 untouched; Vitest + Playwright v2 reader specs green; manual side-by-side with `/v1` documents the delta.

Open questions carried from plan-1 §6 plus:

- Should VersionHub auto-redirect returning visitors to their last version?
- When v2 stabilizes, does `/` default to v2 with v1 at `/v1` only?

---

## 9. Conventions (inherit from v1)

All rules in plan-1 §4 (file naming, variable naming, clsx 60-char limit, agent workflow) apply to **both** `v1/` and `v2/` unless this document explicitly overrides them.

Commit scope examples after migration (branch off the matching `maint/*`):

```
feat(v2-reader): add WebGL page mesh prototype     # branch off maint/v2
fix(v1): correct cover-alone keyboard snap         # branch off maint/v1
refactor(app): add VersionHub and /v1 route prefix # branch off maint/v2
```

PR targets: **`main`**. Production: merge **`main` → `release`**.

---

## 10. Definition of Done — v1 freeze + v2 branch ready

- [x] Git tag `v1.0.0` exists on a release-quality deploy commit.
- [x] Branches **`maint/v1`** and **`maint/v2`** exist; both merge to **`main`** only.
- [x] `docs/plan-2.md` approved and linked from README.
- [x] Phase 1 on `main`; shipped via **`main` → `release`**.
- [x] Playwright smoke passes for `e2e/v1/` and VersionHub.
- [x] Pages deploy shows `/`, `/v1`, `/v2`.
- [ ] Current v2 reader improvements from `main` are shipped via **`main` → `release`**.

---

## Appendix A — Before / After route map

```
BEFORE (v1 only)                 AFTER (coexistence)
─────────────────                ────────────────────
/              Gallery           /              VersionHub
/book/:id      Reader            /v1            Gallery (v1)
*              NotFound          /v1/book/:id   Reader (v1)
                                 /v2            Gallery (v2)
                                 /v2/book/:id   Reader (v2)
/book/:id  ──redirect──►         /v1/book/:id   (transition)
*              NotFound          *              RootNotFound
```

## Appendix B — Minimal VersionHub sketch

The hub is intentionally tiny — no feature creep:

- Card: **v1** — “Stable demo (page-flip MVP)” → link to `/v1`
- Card: **v2** — “Preview — active development” → link to `/v2`
- Footer: GitHub source link (existing env `VITE_GITHUB_URL`)

---

*Document version: 2026-05-29 · Status: active / partially shipped · Author: agent workflow*
