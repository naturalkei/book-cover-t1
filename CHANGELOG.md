# Changelog

All notable changes to this project are documented in this file. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows [Conventional Commits](https://www.conventionalcommits.org/).

## [1.0.0] — 2026-05-22

The first stable release of **book-flip-showcase**, a single-page React 19 app that mimics a tactile book-flip reader.

### Foundation (M1)

- **test**: scaffold Vitest + Testing Library with a `jsdom` environment and jest-dom matchers ([#3](https://github.com/naturalkei/book-cover-t1/issues/3)).
- **test**: scaffold Playwright with a smoke spec, gitignored artifacts, and CI-friendly defaults ([#4](https://github.com/naturalkei/book-cover-t1/issues/4)).
- **data**: declare a static book metadata module with a `BASE_URL`-aware asset helper and a `getBookById` lookup ([#5](https://github.com/naturalkei/book-cover-t1/issues/5)).
- **gallery**: render the book gallery at the root route with a responsive card grid and hero block ([#6](https://github.com/naturalkei/book-cover-t1/issues/6)).

### Reader MVP (M2)

- **reader**: add the reader route shell at `/book/:id` with a NotFound fallback ([#7](https://github.com/naturalkei/book-cover-t1/issues/7)).
- **reader**: implement a controlled CSS 3D page-flip animation with neighbor preloading and a `prefers-reduced-motion` fallback ([#8](https://github.com/naturalkei/book-cover-t1/issues/8)).
- **reader**: add Prev / Next controls with an accessible page indicator ([#9](https://github.com/naturalkei/book-cover-t1/issues/9)).

### Advanced navigation (M3)

- **reader**: add a clamped Page-Jump input that commits via Enter and respects external state changes ([#10](https://github.com/naturalkei/book-cover-t1/issues/10)).
- **reader**: add global keyboard shortcuts (`ArrowLeft`, `ArrowRight`, `Home`, `End`, `Escape`) that respect form / contenteditable focus ([#11](https://github.com/naturalkei/book-cover-t1/issues/11)).
- **reader**: add a draggable thumbnail scrubber with windowed virtualization beyond 50 pages ([#12](https://github.com/naturalkei/book-cover-t1/issues/12)).

### Polish (M4)

- **theme**: add a persisted light / dark mode toggle that respects `prefers-color-scheme` and applies the theme before React mounts ([#13](https://github.com/naturalkei/book-cover-t1/issues/13)).
- **a11y**: pass an axe audit on the gallery and reader in both themes, add a skip-to-content link, label the primary nav, and gate the reduced-motion fallback under a Playwright test ([#14](https://github.com/naturalkei/book-cover-t1/issues/14)).
- **perf**: route-split the reader via `React.lazy`, tag the current page image with `loading="eager"` / `fetchpriority="high"`, and widen the off-DOM preload window to ±2 neighbors. Initial gallery JS lands at **77.98 kB gzipped**, well under the 200 kB budget ([#15](https://github.com/naturalkei/book-cover-t1/issues/15)).

### Release (M5)

- **ci**: ship Pages deploy from `main` with `--frozen-lockfile`, add a CI workflow that runs `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm e2e` on every PR, and surface both via README status badges ([#16](https://github.com/naturalkei/book-cover-t1/issues/16)).
- **docs**: add four high-DPI screenshots (gallery + reader × light + dark) and a reproducible `pnpm screenshots` script ([#17](https://github.com/naturalkei/book-cover-t1/issues/17)).
- **chore**: cut the v1.0.0 release tag ([#18](https://github.com/naturalkei/book-cover-t1/issues/18)).

### Test surface

- **Unit / component**: 69 Vitest specs across 11 files.
- **End-to-end**: 16 Playwright specs (smoke, gallery, reader navigation, page-jump, keyboard, scrubber, accessibility × 7, perf × 3).

[1.0.0]: https://github.com/naturalkei/book-cover-t1/releases/tag/v1.0.0
