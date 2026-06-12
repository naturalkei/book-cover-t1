# book-flip-showcase — v3 Development Plan

This document builds on the v2 CSS flip engine to deliver a more natural **paper-curl motion**, improve the **center gutter shadow** in two-page spreads, and define a research-backed backlog for stronger page-turn interactions.

- Korean source: [`plan-3.md`](./plan-3.md)
- Preceding documents: [`plan-1.md`](./plan-1.md) (v1 product scope), [`plan-2.md`](./plan-2.md) (v1 freeze and v2 coexistence architecture)
- v2 status summary: [`v2-improvements-over-v1.md`](./v2-improvements-over-v1.md)
- Author: **Cursor Agent**
- Status: **Paused work in progress** — the current prototype does not meet the v2 quality baseline

> **Pause decision — June 12, 2026:** The current v3 prototype does not meet
> the v2 baseline for visual continuity and overall finish. Further feature
> work and the v3 release are paused. `/v3` remains available only as a
> work-in-progress comparison and research surface. Resuming requires a
> quality review against v2 and a renewed renderer decision.

---

## 1. Background and Goals

### 1.1 What v2 Solved

The v2 M2.2 work (#71–#78) delivered the following improvements to `main`.

| Area | v2 Result |
| --- | --- |
| Classic rotation | Spine pivot, container `perspective`, single-axis Y rotation |
| Handoff | Separate static/outgoing layers, transition-end cleanup, spread mask |
| Boundary pages | Deferred reveal for cover and final spread/single-page boundaries |
| Spine overlay | Spread-only 1px gradient with `idle` / `active` phases |

v2 is a stable **CSS rigid-leaf** implementation with reduced flicker and phase popping. The page is still a **flat plane using `rotateY`**, and the curl preset remains closer to a visual skew than a physical curl.

### 1.2 Core v3 Goals

1. **Natural curl motion** — bend the page along a cylinder or segmented mesh instead of rotating a flat plane.
2. **Continuous center-gutter lighting** — make the two-page gutter shadow respond smoothly to flip progress without blinking at phase boundaries.
3. **Stronger interaction** — add dragging, corner grabs, flick completion, and progress-linked feedback beyond click and button navigation.

### 1.3 Success Metrics

The experience must be evaluated with measurable criteria as well as subjective review.

| Area | v3 Target |
| --- | --- |
| Visual continuity | Gutter and leaf opacity/width do not jump at start, midpoint, or completion |
| Input response | Pointer movement affects curl progress on the next visual frame |
| Performance | Reference desktop p95 frame time ≤ 16.7ms; reference mobile p95 ≤ 33.3ms |
| Stability | Correct page and healthy DOM/GPU resources after 20 consecutive forward/backward flips |
| Accessibility | Remove curl and parallax under `prefers-reduced-motion: reduce`; provide short fade or instant transition |
| Compatibility | Automatically fall back to the CSS renderer when WebGL is unavailable or context is lost |

### 1.4 Non-goals

- EPUB parsing, DRM, user accounts, or CMS
- SSR or API work
- Direct modification of v1/v2 code; v3 uses a new `src/v3/**` tree
- Reproducing every commercial flipbook feature
- Finite-element-level physical simulation of real paper

---

## 2. v2 Limitations

### 2.1 Why the Current Motion Does Not Read as Curved Paper

The current Classic and Curl presets use a **single DOM leaf with a CSS transform**.

```ts
// v2 classic — rigid plane rotation only
transform: 'rotateY(-180deg)'
```

- The page has no thickness or deformation, so it resembles a card flip.
- Spread-mode Curl still primarily uses `rotateY(-178deg)` rather than cylindrical deformation.
- The “drag a page corner” interaction described in `plan-1` §3.3 remains unimplemented.

**Shared research model**

Page curl can be approximated as cylindrical deformation around a curl axis. A fragment or vertex shader, or a subdivided mesh, classifies points into outgoing plane, cylindrical surface, incoming plane, and shadow regions.

References: [Page Curl Shader Breakdown](https://andrewhungblog.wordpress.com/2018/04/29/page-curl-shader-breakdown/), [fullPage Book Flip / InvertedPageCurl](https://alvarotrigo.com/fullPage/page-flip-effect/), [TurnGL](https://github.com/oguzhanT/turngl).

### 2.2 Why the Gutter Shadow Still Blinks

The v2 spine in `PageFlip.tsx` currently has:

- A fixed 1px gradient with only `idle` and `active` phases
- Constant spread-leaf shadow after #73
- A double-RAF, two-state `initial → final` animation with no continuous progress value
- Potential one-frame mismatch between static masks, outgoing mount/unmount, and spine state

The remaining blink is therefore a limitation of **discrete phases plus one overlay**, even after reducing the original phase pop.

### 2.3 Interaction Gap

| plan-1 Goal | v2 Status |
| --- | --- |
| Drag page corner | Missing |
| Swipe page turn | Missing; half-page tap only |
| Scrubber | Available, without curl preview |
| Keyboard | Available |

---

## 3. Pillar A — Natural Curl Motion

### 3.1 Quality-Tier Strategy

Use measurable prototypes before committing to one renderer.

| Tier | Technology | Curl Quality | Complexity | Intended Role |
| --- | --- | --- | --- | --- |
| **T1** | CSS multi-strip with 8–16 vertical segments | Approximate curl | Low | Fallback candidate |
| **T2** | Canvas 2D plus CPU mesh/page curl | Medium | Medium | Decide after M3.0 comparison |
| **T3** | WebGL/Three.js subdivided `PlaneGeometry` plus cylindrical vertex displacement | High | High | v3 quality target |
| **T4** | Fragment-shader page curl with dual textures and `uProgress` | Highest | High | Optional after v3.1 |

**Recommended path:** validate interaction quickly with T1, then promote T3 to the default `classic+` / `curl` renderer while retaining T1 as fallback.

**Initial M3.0 decision (#81):**

- Adopt T3 WebGL/Three.js as the default quality path.
- Retain the T1 CSS segmented renderer as the reduced-capability fallback.
- Defer T2 Canvas 2D CPU mesh because it adds more complexity than the DOM/CSS fallback without providing T3's normal-based lighting and GPU deformation benefits.
- Require every renderer to share the endpoint, lead, directional-symmetry, and gutter-lighting invariants in `src/v3/lib/curl-model.ts`.
- Revalidate the final adoption gate with real browser frame-time and visual-quality measurements in M3.2c.

### 3.2 Curl Design Principles

1. **Fixed spine** — deformation stays anchored to the gutter.
2. **Lead factor** — the free edge lifts before the spine using nonlinear weighting.
3. **Back face** — use a subtle paper tone and texture rather than mirroring the front image.
4. **Thickness cue** — add a 1–2px fore-edge gradient.
5. **Hardcover behavior** — covers rotate rigidly without curl.
6. **Reduced motion** — disable curl and use a fade or instant transition.

### 3.3 Recommended Curvature Model

The v3 MVP should approximate a **developable surface**, which bends without stretching, rather than attempt full paper physics. Cylinders, cones, and planes provide a convincing practical model.

Let `u ∈ [0, 1]` be a vertex’s normalized distance from spine to free edge, and `p ∈ [0, 1]` be flip progress.

```text
angle(u, p)  = direction * PI * ease(p) * lead(u)
radius(p)    = mix(R_MAX, R_MIN, sin(PI * p))
lift(u, p)   = sin(PI * u) * sin(PI * p) * LIFT_MAX
```

- `lead(u)` lets the free edge react first through `u^γ` or a tunable curve.
- `radius(p)` is larger at the endpoints and smaller at the midpoint to emphasize curl.
- `lift` applies only around the middle and converges exactly to zero at `p=0` and `p=1`.
- Vertex normals must be recomputed or derived in the shader so highlights and shadows follow curvature.

**Target decision:** keep the CSS segmented renderer as a fallback, while targeting T3 `PlaneGeometry(widthSegments ≥ 24)` plus vertex displacement for default v3 quality. A shared `uProgress` uniform drives geometry and lighting.

### 3.4 v3 `FlipEngine` Abstraction

Replace the v2 two-frame preset model with a progress-driven engine.

```ts
interface IFlipEngine {
  /** 0 = rest, 1 = turn complete */
  progress: number
  direction: 'forward' | 'backward'
  mode: 'single' | 'spread'
  render(): void
}

interface IFlipRenderer {
  supportsProgressiveDrag: boolean
  setProgress(p: number): void
  setTextures(front: TextureSource, back: TextureSource): void
  resize(viewport: IFlipViewport): void
  dispose(): void
}
```

- Button and keyboard flips interpolate `0 → 1` with RAF or a spring.
- Dragging maps pointer X/Y to curl axis, radius, and progress.
- `progress` is the single source of truth for geometry, shadow, static mask, and ARIA state.
- Time-based animation converts elapsed time to progress; drag directly controls progress.

### 3.5 Renderer Selection Gate

| Condition | Renderer |
| --- | --- |
| Reduced-motion preference | Fade or instant renderer |
| WebGL 2 creation failure or context loss | CSS segmented renderer |
| Reference-mobile p95 remains above 33.3ms after quality reduction | CSS fallback |
| Normal environment | WebGL curl renderer |

The WebGL renderer must be route-level lazy-loaded. Renderer failure should degrade naturally without surfacing as a user error.

---

## 4. Pillar B — Center-Gutter Shadow

### 4.1 Experience Target

- The gutter is not a permanently dark line; its width, depth, and opacity respond to leaf lift.
- No frame jumps at flip start, completion, leaf mount, or unmount.
- Forward, backward, cover, and spread leaves share the same progress function.

### 4.2 Progress-driven Multi-layer Gutter

Replace the single v2 `page-flip-spine` span with separate lighting responsibilities.

| Layer | Responsibility | Example Progress Function |
| --- | --- | --- |
| **G0 — static crease** | Base ambient occlusion for an open book | `base = 0.25` |
| **G1 — dynamic wedge** | Variable gutter gradient under the turning leaf | `0.25 + 0.45 * sin(PI * p)` |
| **G2 — cast shadow** | Soft leaf shadow on the incoming page | `opacity ∝ (1 - p) * lift` |
| **G3 — specular ridge** | Curl-bend highlight for WebGL | `normal · light` |

**Implementation rules**

1. The engine updates `--flip-progress` or `uProgress` every frame.
2. Gutter width is variable rather than a fixed `w-px`.
3. Preserve the previous spread’s G1 state for one frame during static-mask handoff.
4. Sample spine opacity/luminance under slow motion and reject single-frame spikes.

### 4.3 Lighting Functions and Rendering Rules

```text
creaseAO(p)     = AO_BASE + AO_RANGE * sin(PI * p)
castOpacity(p)  = CAST_MAX * sin(PI * p)^0.7
castWidth(p)    = mix(W_MIN, W_MAX, sin(PI * p))
ridgeLight(p)   = max(0, dot(normal(p), lightDirection)) * RIDGE_MAX
```

- G0 remains independent of leaf mount/unmount.
- G1 and G2 read the same progress and update through CSS custom properties or shader uniforms, not React state per frame.
- Shadow direction mirrors for forward/backward turns.
- CSS fallback animates compositor-friendly `transform: scaleX()` and `opacity`; WebGL uses uniforms.
- Define draw order and depth policy explicitly to avoid transparent-layer sorting artifacts.

### 4.4 Validation Scenarios

1. Spread Classic, forward 2→4: gutter deepens and softens continuously.
2. Backward 4→2: symmetric curve with no shadow jump on pivot reversal.
3. `coverMode=single`, 0→1: blank left side with a right-side variable shadow.
4. Twenty consecutive flips: no accumulated drift or flash.

### 4.5 Quantitative Acceptance

| Measurement | Pass Criterion |
| --- | --- |
| Spine luminance samples | Adjacent changes remain within the intended easing curve; no mount/unmount spike |
| Layout shift | Zero reader-surface layout shift during flip |
| Long task | No main-thread task ≥ 50ms during one flip |
| Handoff | Visible page and gutter crop remain consistent immediately before and after `progress=1` |

---

## 5. Pillar C — Interaction Backlog

### 5.1 P0 — Recommended for v3 MVP

| # | Item | Expected Result |
| --- | --- | --- |
| P0-1 | **Progress-unified animation** | Synchronizes spine, leaf, static surface, and handoff |
| P0-2 | **Pointer drag flip** from the free edge | Delivers the original corner-drag goal |
| P0-3 | **T1 segmented or T3 WebGL curl** | Moves beyond a rigid leaf |
| P0-4 | **Progress-driven gutter shadow** | Removes gutter blinking |
| P0-5 | **Renderer fallback chain** | Supports low-end and WebGL-failure environments |

### 5.2 P1 — v3.1 Polish

| # | Item |
| --- | --- |
| P1-1 | Soft cast shadow on the incoming page |
| P1-2 | Spring release that completes or returns based on progress and velocity |
| P1-3 | Scrubber riffle preview |
| P1-4 | Fore-edge thickness stack proportional to remaining pages |
| P1-5 | Rigid cover and back board |
| P1-6 | Subtle 1–2° mouse-look book tilt |

### 5.3 P2 — Differentiation and Delight

| # | Item |
| --- | --- |
| P2-1 | Specular ridge on WebGL curl |
| P2-2 | Anti-aliased page edge |
| P2-3 | Optional page-turn sound, muted by default |
| P2-4 | Optional haptic completion tick |
| P2-5 | GPU texture cache for neighboring spreads |
| P2-6 | Auto-play showcase mode |

### 5.4 P3 — Research Spikes

| # | Item | Note |
| --- | --- | --- |
| P3-1 | Full-screen dual-texture WebGL shader curl | Highest quality, high maintenance cost |
| P3-2 | Physics-engine paper simulation | Likely excessive for product needs |
| P3-3 | PDF.js plus TurnGL integration | Revisit with future content ingestion |

### 5.5 Expert Design Principles

1. Use the same progress model for direct manipulation and automatic animation.
2. Decide completion from progress, release velocity, and direction, not distance alone.
3. Use pointer capture so dragging remains stable outside the surface.
4. Coordinate page drag with mobile scrolling through tested grab zones and `touch-action` policy.
5. Cancel or delegate when a second pointer begins a pinch gesture.
6. Tune timing before adding geometry detail; poor lift and landing timing still reads as a card flip.
7. Converge exactly to flat endpoint states at `p=0` and `p=1`.
8. Keep page texture resolution separate from lower-cost shadow rendering.
9. Dispose textures, geometry, and materials on book changes, route unmount, and context loss.
10. Evaluate v2 and v3 side by side using the same book, spread, and viewport.

### 5.6 Drag State Machine

```text
idle
  -> armed        pointerdown on valid free-edge/grab zone
  -> dragging     movement threshold exceeded; pointer captured
  -> settling     pointerup; spring/easing continues to 0 or 1
  -> committed    page index changes exactly once
  -> idle

armed/dragging -> cancelled  pointercancel, second pointer, route change
cancelled      -> settling   return to progress 0
```

**Invariants**

- Page index does not change during drag and changes exactly once at `committed`.
- MVP ignores new input during `settling`.
- Keyboard and button flips also use the `settling` path.

---

## 6. Architecture and Version Coexistence

### 6.1 Routes

| Route | Version | Purpose |
| --- | --- | --- |
| `/v3` | v3 | Gallery |
| `/v3/book/:id` | v3 | Reader with the new flip engine |
| `/v3/*` | v3 | NotFound |

Add a VersionHub card: **v3 — “Paper curl preview”**.

### 6.2 Proposed Source Tree

```text
src/
  v3/
    components/
      reader/
        PageFlipEngine.tsx
        renderers/
          css-segmented.ts
          webgl-curl.ts
        gutter/
          SpineLighting.tsx
        flip-presets.ts
    pages/
      Reader.tsx
    data/
      books.ts
```

### 6.3 Import Rules

| Rule | Reason |
| --- | --- |
| `v3/` must not import `@v1/` or `@v2/` | Preserve version isolation |
| `v3/` may import only `@shared/` | Keep the shared kernel minimal |
| v2 hotfixes continue independently on `maint/v2` | Support parallel development |

### 6.4 Branch Strategy

Extend the plan-2 maint → main → release flow.

```text
feat/v3-* -> maint/v3 -> main -> release -> GitHub Pages
```

- Create `maint/v3` when the v3 scaffold lands on `main`.
- Target v3 feature PRs to `maint/v3`, then integrate milestone-sized work into `main`.
- `main` must always build and test `/v1`, `/v2`, and `/v3`.
- GitHub Pages continues to deploy only from `release`.

### 6.5 Dependency Candidates

| Package | Purpose | Adoption Condition |
| --- | --- | --- |
| `three` | WebGL curl mesh | Adopt for T3; lazy import |
| None | CSS-only T1 path | Keep CSS path lightweight |

Bundle budget: v3 Reader chunk **≤ 350 KB gzipped** with Three.js; CSS-only path **≤ 220 KB**.

### 6.6 Renderer Responsibility Contract

| Responsibility | Engine | Renderer |
| --- | --- | --- |
| Page index, direction, gesture state | Yes | No |
| Progress calculation and commit | Yes | No |
| Geometry, texture, shader | No | Yes |
| Gutter-lighting input and draw | Input | Draw |
| Reduced-motion and fallback selection | Yes | No |
| GPU resource disposal | Calls | Performs |

---

## 7. Milestones

| Milestone | Scope | Completion Criterion |
| --- | --- | --- |
| **M3.0 — Technical spike** | Compare T1/T2/T3 with identical page and input | Renderer decision record, reference frames, and traces |
| **M3.1 — Shell** | VersionHub, `/v3` routes, scaffold, smoke test | `/v3/book/:id` stub renders |
| **M3.2a — Segmented CSS curl** | T1 renderer, progress API, button flip | Side-by-side v2/v3 capture |
| **M3.2b — Gutter lighting v1** | Progress-based G0–G2 and flicker regression tests | Slow-motion and Playwright sampling pass |
| **M3.2c — WebGL curl** | T3 renderer with T1 fallback | Automatic low-end degradation |
| **M3.3 — Drag interaction** | Pointer drag and spring release | E2E drag scenarios pass |
| **M3.4 — Polish** | P1 backlog, accessibility, reduced motion | Accessibility review passes |
| **M3.5 — Release** | `v3.0.0`, updated plan, demo media | `main → release` |

**Recommended issue split**

1. `research(v3-reader): compare css, canvas, and webgl curl renderers`
2. `feat(v3): scaffold routes and reader shell`
3. `feat(v3-reader): progress-based flip engine`
4. `feat(v3-reader): progress-driven spine lighting`
5. `feat(v3-reader): webgl curl renderer with fallback`
6. `feat(v3-reader): pointer drag page turn`

---

## 8. Test Strategy

| Layer | v3 Scenarios |
| --- | --- |
| **Vitest** | Progress clamp/easing, gesture state machine, single commit, gutter functions, mask hold, fallback |
| **Playwright** | Drag/flick/cancel, 20 consecutive flips, spine stability, WebGL off/context loss |
| **Visual regression** | Fixed `p=0/0.25/0.5/0.75/1` leaf silhouette and gutter crops |
| **Performance** | Chromium trace for frame time, long tasks, layout shift, and renderer statistics |
| **Manual** | 6× slowdown; forward/backward/cover/final spread; mouse/touch/trackpad |

### 8.1 Test Hooks

```ts
interface IFlipDebugSnapshot {
  progress: number
  state: 'idle' | 'armed' | 'dragging' | 'settling'
  renderer: 'webgl' | 'css' | 'reduced-motion'
  frameTimeMs: number
}
```

- Expose `data-flip-progress` to three decimal places for E2E monotonicity checks.
- Provide a test-only API to freeze renderer progress for stable visual snapshots.
- Evaluate gutter luminance over time instead of relying on screenshots alone.

---

## 9. Risks and Trade-offs

| Risk | Mitigation |
| --- | --- |
| WebGL compatibility | Required T1 fallback and feature detection |
| Drag versus scroll conflict | Test grab zones, `touch-action: pan-y`, and pointer capture per device |
| Bundle size | Lazy-load Three.js and split at route level |
| v2/v3 double maintenance | Consider freezing v2 after v3 stabilizes |
| Transparent-layer/depth ordering | Fix draw-order and depth policy; limit passes |
| WebGL context loss | Detect and switch to CSS fallback |
| High-resolution texture memory | Cache only neighboring pages and dispose on unmount |
| React render per frame | Use mutable engine/ref plus CSS variables or uniforms |

---

## 10. Open Questions

1. Does M3.0 evidence support **WebGL default plus CSS fallback**?
2. Should v3 use Three.js or a minimal purpose-built WebGL renderer?
3. Should the v2 #78 mask logic be copied or redesigned around progress?
4. Should backward turns support the same corner-grab interaction?
5. When should the VersionHub default move to `/v3`?

---

## 11. References

### 11.1 Standards and Official Documentation

| Source | v3 Relevance |
| --- | --- |
| [W3C CSS Transforms Level 2](https://www.w3.org/TR/css-transforms-2/) | Standard behavior for perspective, 3D transforms, and backface visibility |
| [W3C Web Animations](https://www.w3.org/TR/web-animations-1/) | Unified timing and effect-progress model |
| [W3C CSS Easing Functions Level 2](https://www.w3.org/TR/css-easing-2/) | Pure progress mapping and easing comparison |
| [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/) | Pointer capture, cancellation, and `touch-action` |
| [W3C Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion) | Reduced-motion requirements |
| [Three.js PlaneGeometry](https://threejs.org/docs/pages/PlaneGeometry.html) | Segmented page mesh |
| [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html) | Shared progress, texture, and light uniforms |
| [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) | WebGL 2 capabilities and renderer-resource concerns |
| [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance) | Frame-time, long-task, layout, paint, and composite measurement |

### 11.2 Research

| Source | v3 Relevance |
| --- | --- |
| [Non-smooth developable geometry for interactively animating paper](https://inria.hal.science/hal-01202571/file/paper_v31.pdf) | Time-coherent interactive virtual-paper deformation |
| [Interactive Curved Fold Modeling using a Handle Curve](https://www.cad-journal.net/files/vol_20/CAD_20%282%29_2023_275-289.pdf) | Crease/handle curves and quad-strip deformation |
| [Flexible Developable Surfaces](https://www.cs.columbia.edu/cg/pdfs/1366386647-discrete_developables.pdf) | Discrete approximation of smoothly deforming non-stretching surfaces |

### 11.3 Implementation References

| Source | Relevance |
| --- | --- |
| [Page Curl Shader Breakdown](https://andrewhungblog.wordpress.com/2018/04/29/page-curl-shader-breakdown/) | Cylinder model, curl axis, shadow |
| [fullPage Book Flip / InvertedPageCurl](https://alvarotrigo.com/fullPage/page-flip-effect/) | Dual textures and progress uniform |
| [TurnGL](https://github.com/oguzhanT/turngl) | Segmented mesh, lead factor, drag |
| [mantine-book](https://github.com/gfazioli/mantine-book) | Flat/rounded fallback, edge drag, rigid covers |
| [WebVfx pagecurl shader](https://mltframework.org/doxygen/webvfx/examples_2transition-shader-pagecurl_8html-example.html) | Behind-surface shadow and edge anti-aliasing |
| v2 issues [#73](issues/73.md), [#78](issues/78.md) | Lessons from spine popping and static-mask handoff |

---

## 12. Definition of Done — v3.0 Draft

- [ ] T3 curl renderer and T1 fallback work at `/v3/book/:id`
- [ ] Spread gutter shadow changes continuously with progress without flicker regression
- [ ] Pointer-drag page turn works
- [ ] `prefers-reduced-motion` fallback works
- [ ] WebGL failure/context loss falls back to CSS
- [ ] Frame-time budget and 20-consecutive-flip stability criteria pass
- [ ] Visual baselines at `p=0/0.25/0.5/0.75/1` are approved
- [ ] v1/v2 remain unchanged; v3 Vitest and Playwright pass; `pnpm lint` is clean
- [ ] Issue reports and squash-merged PRs are complete

---

*Document version: 2026-06-12 · Author: Cursor Agent · Status: paused work in progress · Next step: reassess the v2 quality gate and renderer direction before resuming*
