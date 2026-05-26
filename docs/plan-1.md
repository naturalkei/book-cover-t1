# book-flip-showcase

A book preview showcase site featuring a realistic paper page-flip animation experience.

## 1. Overview

`book-flip-showcase` is a single-page application (SPA) that mimics the tactile feel of flipping through a physical book in the browser. It serves as both a visual portfolio for book covers and an interactive demo of advanced page-turn animations. The goal is to deliver a modern, trendy reading experience that feels closer to a designed product than a typical web component.

### 1.1 Goals

- Demonstrate a realistic page-flip animation that rivals native book-reader apps.
- Showcase multiple books in a curated gallery and let users dive into a full preview.
- Provide multiple navigation paradigms (book selection, page jump, prev/next, slide-thumb scrubbing).
- Keep the implementation small, dependency-light, and idiomatic to the Vite + React + Tailwind stack.

### 1.2 Non-Goals

- Not a full e-book reader (no DRM, no EPUB parsing, no annotations).
- Not a CMS — book metadata is statically declared in the repo.
- Not a backend product — everything runs client-side.

## 2. Tech Stack

- **Build**: Vite 7
- **Framework**: React 19
- **Routing**: react-router-dom 7
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Language**: TypeScript 5
- **Lint / Style**: ESLint 9 + `@stylistic/eslint-plugin` following StandardJS (no semicolons, single quotes)
- **Unit / Component Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Package Manager**: pnpm 10
- **CI / Automation**: GitHub Actions + GitHub CLI (`gh`)

## 3. Application Design

### 3.1 Content Model

- All cover images and preview pages live under `public/` as static assets.
- Book pages may be substituted with placeholder images when real preview pages are unavailable.
- Book metadata (title, author, cover path, page list, color tokens, etc.) is declared in a single typed module — e.g. `src/data/books.ts`.

### 3.2 Pages & Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Gallery | Curated grid/carousel of available books with cover art. |
| `/book/:id` | Reader | Full-screen page-flip experience for a single book. |
| `*` | NotFound | Friendly 404 with a link back to the gallery. |

### 3.3 Reader Navigation

The reader supports four navigation paradigms, all controllable via mouse, touch, and keyboard:

1. **Direct page flip** — drag a page corner or swipe horizontally to turn one page at a time.
2. **Prev / Next buttons** — fixed controls in the chrome for accessible click/tap navigation.
3. **Page jump** — input or selector to jump to an arbitrary page index.
4. **Thumbnail scrubber** — a horizontal strip of page thumbnails at the bottom of the viewport. Dragging the scrub handle rapidly turns pages and previews the destination before release.

Keyboard map:
- `ArrowLeft` / `ArrowRight` — previous / next page
- `Home` / `End` — first / last page
- `Esc` — return to gallery

### 3.4 Visual Direction

- Trendy, modern editorial aesthetic — generous whitespace, large typography, subtle gradients.
- Dark mode by default with an optional light theme toggle.
- Page-flip animation uses CSS 3D transforms (or WebGL via `react-pageflip`-style implementation if needed) with proper backface culling and shadow gradients so the spread feels paper-thin.
- Respects `prefers-reduced-motion` by falling back to a cross-fade transition.

### 3.5 Performance Targets

- Lighthouse Performance ≥ 90 on the gallery and reader routes.
- Lazy-load high-resolution page images; preload the next/previous spread only.
- Initial JS payload ≤ 200 KB gzipped (excluding images).

### 3.6 Accessibility

- All interactive controls reachable via keyboard with visible focus rings.
- ARIA labels on flip controls, page indicator, and thumbnail scrubber.
- Alt text for every cover and meaningful page image.

## 4. Project Conventions

- **Code style**: StandardJS — no semicolons, single quotes, minimal config. Enforced by ESLint.
- **File naming**:
  - React component files (`.tsx`): **PascalCase** — e.g. `CoverModeToggle.tsx`, `BookCard.tsx`.
  - All other source files and folder names: **kebab-case** — e.g. `book-pages.ts`, `flip-presets.ts`, `reader-keyboard.ts`.
  - Hook modules under `src/hooks/`: kebab-case filenames **without** the `use` prefix; exported hook functions keep the `use` prefix — e.g. `cover-mode.ts` exports `useCoverMode`.
- **Commit messages**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`).
- **Branching**: One branch per GitHub issue, named `<type>/<issue-id>-<short-slug>` (e.g. `feat/12-thumbnail-scrubber`).
- **PRs**: Squash-merge by default. PR title mirrors the Conventional Commit summary and links the issue.

## 5. Agent Workflow

For every requirement or change request, the agent MUST follow the loop below end-to-end before considering the task complete:

1. **Plan & file an issue** — open a GitHub issue via `gh issue create` describing scope, acceptance criteria, and test plan.
2. **Branch out** — create a dedicated branch off `main` referencing the issue id; commit incrementally with Conventional Commit messages.
3. **Write unit / component tests** — author Vitest specs that cover the new behavior; run them green locally.
4. **Write E2E tests** — design Playwright scenarios for the user-facing flow; run them green locally.
5. **Document the resolution** — write a report at `docs/issues/{issue-id}.md` summarizing the problem, approach, trade-offs, and verification results.
6. **Comment on the issue** — post the report (or a link to it) on the GitHub issue via `gh issue comment`.
7. **Open & merge the PR** — open the PR with `gh pr create`, ensure CI is green, merge via `gh pr merge --squash --delete-branch`, and confirm the issue closes automatically.

### 5.1 Definition of Done

A task is done only when:

- [ ] The corresponding GitHub issue is closed.
- [ ] All Vitest and Playwright suites pass in CI.
- [ ] Lint passes (`pnpm lint`).
- [ ] `docs/issues/{issue-id}.md` exists and is linked from the issue.
- [ ] The PR is squash-merged and the branch is deleted.

## 6. Open Questions

- Should we ship a custom WebGL page-flip renderer, or adopt an existing library and theme it?
- Do we need internationalization (i18n) on day one, or can it be added later?
- What is the source of truth for sample book data — open-license titles, or original placeholder art?

## 7. Milestones (Tentative)

1. **M1 — Foundation**: project scaffolding, lint/test infrastructure, gallery route with static book list.
2. **M2 — Reader MVP**: single-book reader route with prev/next navigation and basic flip animation.
3. **M3 — Advanced Navigation**: thumbnail scrubber, page-jump input, keyboard shortcuts.
4. **M4 — Polish**: theming, reduced-motion support, performance pass, accessibility audit.
5. **M5 — Release**: deploy preview, README, demo GIFs, and v1.0.0 tag.
