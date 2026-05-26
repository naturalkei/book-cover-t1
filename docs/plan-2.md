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

- **Preserve v1** as a stable, linkable demo (`v1.0.x` hotfixes only).
- **Develop v2 on `main`** with freedom to refactor reader core, add features (WebGL renderer, richer gallery, i18n, etc.), and break internal APIs.
- **Coexist in one deploy** (recommended) so stakeholders can compare v1 vs v2 at stable URLs.
- **Keep CI green** for both trees during the transition window.

### 1.3 Non-goals (v2 plan phase)

- Splitting into a full monorepo with published npm packages (defer until a second app needs the reader).
- Running v1 and v2 on separate domains (optional later; path prefix is enough for now).

---

## 2. Version & Git Strategy

### 2.1 Freeze v1

1. Ensure `main` is release-quality (CI green, `package.json` at `1.0.0`).
2. Merge `main` → `release` and confirm GitHub Pages deploy is green (see §2.3).
3. Create an annotated tag on the deployed commit (if not already present):
   ```bash
   git checkout release
   git pull
   git tag -a v1.0.0 -m "v1.0.0 — gallery + reader MVP frozen"
   git push origin v1.0.0
   ```
4. **Policy**
   - **`main`** — day-to-day development (v2 features land here after Phase 1).
   - **`release`** — **production deploy branch only** (GitHub Pages + release-please). Never use it for feature work.
   - **Tags** — `v1.0.x` marks v1 baseline/hotfix releases cut from `release`; `v2.0.0-alpha.x` / `v2.0.0` when v2 ships.

### 2.2 Release Please / CHANGELOG

- [release-please](https://github.com/googleapis/release-please) runs on push to **`release`** (`.github/workflows/release-please.yml`), same as deploy.
- Flow today: squash-merge PRs on `main` → periodic **`main` → `release` merge** → release-please bumps version / tag → deploy workflow publishes Pages.
- After v2 starts: keep **one** `CHANGELOG.md` with `## v1` / `## v2` sections, or split files if noise grows. release-please manifest may need a major bump path for `2.0.0`.

### 2.3 Branch roles & deploy (`release` = GitHub Pages)

> **`release` is the GitHub Pages deployment branch.** Do not rename it or add a competing deploy branch. All public URLs are whatever was last built from `release`.

| Branch | Triggers | Role |
| --- | --- | --- |
| `main` | CI on push / PR (`.github/workflows/ci.yml`) | Integration branch — features, refactors, v2 work |
| `release` | **Deploy** (`.github/workflows/deploy.yml`) + **release-please** on push | Builds `dist/` → GitHub Pages at `https://<owner>.github.io/book-cover-t1/` |
| Tag `v1.0.x` | — | Immutable marker for the frozen v1 line |

**Standard ship loop**

```
feature PR ──squash──▶ main ──CI green──▶ merge ──▶ release ──▶ Pages live
                              ▲                      │
                              └──── (optional) ──────┘
                              sync version-bump commit
                              from release-please back to main
```

**What gets deployed**

- A **single artifact** from `release` containing both route trees once Phase 1–2 land (`/`, `/v1/*`, `/v2/*` — see §3).
- `VITE_BASE_URL=/book-cover-t1/` is set in the deploy workflow; no per-version deploy branches.

**v1 hotfixes while v2 is in progress**

| Scenario | Approach |
| --- | --- |
| Bug affects **v1 only** (under `src/v1/`) | Branch off `main` → fix → PR to `main` → merge `main` → `release` when ready to ship |
| Urgent v1 patch, **main has unreleasable v2 WIP** | Branch `maint/v1` from tag `v1.0.x` → fix → cherry-pick to `release` (or temporary `maint/v1` → `release` merge without merging all of `main`) |
| v2 preview needed on Pages before v2 is default | Merge `main` → `release` as today; v2 lives at `/v2/` while v1 stays at `/v1/` |

**Do not** create `release/v1` or repurpose `release` — it is already the Pages + semver release line (#55, `deploy.yml`).

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

### Phase 0 — Tag & document (no code move)

- [ ] Confirm `v1.0.0` tag on current `release` HEAD (already cut in #18 if present)
- [ ] Document ship loop: `main` → `release` → Pages
- [ ] Announce v1 freeze policy in README

### Phase 1 — Directory move (single PR on `main`, then ship via `release`)

- [ ] Create `src/app/`, `src/v1/`, `src/shared/`
- [ ] `git mv` current pages/components/hooks/data/lib → `src/v1/`
- [ ] Update imports to `@v1/*`
- [ ] Add route prefix `/v1` + legacy redirects from `/book/:id`
- [ ] Move e2e specs → `e2e/v1/`, fix paths
- [ ] All CI green on `main`; merge `main` → `release` and verify Pages + `/v1` paths

### Phase 2 — v2 scaffold

- [ ] Add `src/v2/` with minimal Gallery + Reader (can re-export v1 Reader initially behind `/v2` flag)
- [ ] VersionHub at `/`
- [ ] `e2e/v2/smoke.spec.ts`

### Phase 3 — v2 feature development

- [ ] Implement v2 milestones (see §8)
- [ ] Gradually replace v2 Reader stub with new engine
- [ ] Remove legacy redirects when ready

---

## 8. v2 Product Milestones (tentative)

1. **M2.1 — Shell** — VersionHub, `/v2` routes, namespaced storage, CI split prep.
2. **M2.2 — Reader engine** — WebGL or canvas flip prototype; feature flag inside v2 only.
3. **M2.3 — Gallery++** — filters, search, series grouping, richer metadata.
4. **M2.4 — Content** — optional EPUB ingest (client-side), still no DRM.
5. **M2.5 — Polish** — perf budget, a11y audit, i18n if needed.
6. **M2.6 — Release** — `v2.0.0` tag via release-please on `release`; v1 code frozen under `src/v1/`.

Open questions carried from plan-1 §6 plus:

- Should VersionHub auto-redirect returning visitors to their last version?
- When v2 stabilizes, does `/` default to v2 with v1 at `/v1` only?

---

## 9. Conventions (inherit from v1)

All rules in plan-1 §4 (file naming, variable naming, clsx 60-char limit, agent workflow) apply to **both** `v1/` and `v2/` unless this document explicitly overrides them.

Commit scope examples after migration:

```
feat(v2-reader): add WebGL page mesh prototype
fix(v1): correct cover-alone keyboard snap on last spread
refactor(app): add VersionHub and /v1 route prefix
```

---

## 10. Definition of Done — v1 freeze + v2 branch ready

- [ ] Git tag `v1.0.0` exists on a `release` deploy commit.
- [ ] `docs/plan-2.md` approved and linked from README.
- [ ] Phase 1 migration PR merged to `main`; shipped to Pages via `main` → `release` merge.
- [ ] Playwright smoke passes for `e2e/v1/` and VersionHub.
- [ ] Deploy preview on Pages shows `/`, `/v1`, `/v2` (v2 may be stub).
- [ ] Agent rules / project-overview reference plan-2 for v2 architectural decisions.

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

*Document version: 2026-05-26 · Status: proposed · Author: agent workflow*
