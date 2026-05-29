# v2 Improvements over v1

*Updated: 2026-05-29*

This report summarizes the user-visible and engineering improvements now present in v2 compared with the frozen v1 demo.

## Executive Summary

v1 remains the stable baseline for the original gallery and reader MVP. v2 keeps the same core catalog and navigation model, but separates the app into versioned routes and introduces a forked reader flip engine focused on paper realism, smoother spread-mode rendering, and fewer visual handoff artifacts.

## Route and Release Improvements

| Area | v1 | v2 / current main |
| --- | --- | --- |
| Entry route | Original gallery at `/` before migration | VersionHub at `/` with stable links to `/v1` and `/v2` |
| Reader route | `/book/:id` legacy route | `/v1/book/:id` and `/v2/book/:id`; legacy `/book/:id` redirects to v1 |
| Source layout | Single flat app tree | Versioned app shell: `src/app`, `src/v1`, `src/v2` |
| Release path | Early Pages deploys were tied to `main` | Production deploys from `release` only after `main` integration |

## Reader Interaction Improvements

| Improvement | v1 baseline | v2 result |
| --- | --- | --- |
| Classic page turn | Flat 3D rotation with a shared perspective value | Spine-pivoted paper turn with tuned easing, perspective, and stable opacity |
| Spread leaf rendering | Whole-spread outgoing layer | Half-spread leaf model with front/back faces and a phantom static half |
| Handoff timing | Timeout-based cleanup | Transition-end cleanup with a duration fallback, reducing timing drift |
| Static page reveal | Static layer updates immediately on every target change | Static layer can defer reveal at cover and final-page boundaries to avoid flashes |
| Flicker control | Keyed remounts and opacity handoff could expose blank/static gaps | Stable static layer, mask-aware spread rendering, and predecoded neighbor pages |
| Spine shadow | Always-rendered center line | Spread-only spine with explicit active/idle phase state |
| Test coverage | v1 reader behavior tests | Additional v2 unit and Playwright coverage for classic flip, flicker-sensitive handoff, and edge boundaries |

## Implementation Notes

- v2 forks the reader under `src/v2/**` instead of importing from v1, preserving v1 as a frozen comparison target.
- The Classic preset now exports a shared paper perspective and keeps opacity stable during the final rotation, relying on backface visibility instead of crossfade for the reveal.
- Spread mode uses dedicated leaf components so a single page appears to turn across the spine while the opposite side remains visually anchored.
- The static spread mask holds the correct left or right page during outgoing transitions, including cover-single and last-spread edge cases.

## Related Reports

- [`docs/issues/71.md`](./issues/71.md) — Classic paper turn baseline
- [`docs/issues/72.md`](./issues/72.md) — Flicker reduction during flip handoff
- [`docs/issues/73.md`](./issues/73.md) — Spine shadow polish
- [`docs/issues/78.md`](./issues/78.md) — Static reveal deferral at edge boundaries

## Current Status

The v2 reader improvements are merged into `main`. `maint/v2` is already an ancestor of `main`, so the requested v2-to-main merge is satisfied without additional merge commits.
