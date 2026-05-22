# book-flip-showcase

[![CI](https://github.com/naturalkei/book-cover-t1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/naturalkei/book-cover-t1/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/naturalkei/book-cover-t1/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/naturalkei/book-cover-t1/actions/workflows/deploy.yml)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> A book preview showcase site featuring a realistic paper page-flip animation experience.
> <br> Built on **React 19**, **Vite 7**, and **Tailwind CSS 4**, formatted by **ESLint 9** alone (no Prettier, no semicolons).

## Overview

`book-flip-showcase` is a single-page application that mimics the tactile feel of flipping through a physical book in the browser. It serves as both a curated gallery for book covers and an interactive demo of advanced page-turn animations.

See [`docs/plan-1.md`](./docs/plan-1.md) for the full product plan, scope, and milestones.

## Features

- **Page-flip reader** — realistic CSS 3D page-turn animation with proper shadows and backface culling.
- **Curated gallery** — cover art grid with smooth transitions into the reader.
- **Multiple navigation modes** — corner drag, prev/next buttons, page jump, and a draggable thumbnail scrubber.
- **Keyboard friendly** — `ArrowLeft` / `ArrowRight`, `Home` / `End`, `Esc` shortcuts.
- **Accessible & motion-aware** — ARIA labels on all controls, respects `prefers-reduced-motion`.
- **Modern editorial UI** — generous whitespace, dark mode by default, optional light theme.
- **Zero Prettier** — formatting handled entirely by ESLint 9 + `@stylistic/eslint-plugin`.
- **Strict TypeScript** — separated `app` and `node` tsconfig environments with `@/` path alias.

## Tech Stack

| Category | Technology | Version |
| :--- | :--- | :--- |
| Framework | [React](https://react.dev) | v19 |
| Build Tool | [Vite](https://vitejs.dev) | v7 |
| Styling | [Tailwind CSS](https://tailwindcss.com) | v4 |
| Language | [TypeScript](https://www.typescriptlang.org) | v5 |
| Linter | [ESLint (Flat Config)](https://eslint.org) | v9 |
| Router | [React Router](https://reactrouter.com) | v7 |
| Icons | [lucide-react](https://lucide.dev) | latest |
| Unit Tests | [Vitest](https://vitest.dev) | v3 |
| E2E Tests | [Playwright](https://playwright.dev) | v1 |
| Package Manager | [pnpm](https://pnpm.io) | v10+ |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/book-flip-showcase.git
cd book-flip-showcase
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables (optional)

Copy `.env.example` to `.env` and adjust as needed.

```conf
VITE_BASE_URL="/{reponame}"
VITE_GITHUB_URL="https://github.com/{username}/{reponame}"
VITE_SITE_URL="https://{username}.github.io/{reponame}/"
```

### 4. Run the development server

```bash
pnpm dev
```

Open <http://localhost:5173> in your browser.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Starts the Vite development server with HMR. |
| `pnpm build` | Runs `tsc -b` type checking and builds the production bundle. |
| `pnpm serve` | Previews the production build locally. |
| `pnpm lint` | Runs ESLint across the project. |
| `pnpm lint:fix` | Auto-fixes ESLint issues where possible. |
| `pnpm test` | Runs the Vitest unit / component suite once. |
| `pnpm test:watch` | Runs Vitest in watch mode. |
| `pnpm test:coverage` | Runs Vitest with V8 coverage. |
| `pnpm e2e` | Runs the Playwright end-to-end suite headlessly. |
| `pnpm e2e:ui` | Opens the Playwright UI runner. |
| `pnpm e2e:report` | Opens the most recent Playwright HTML report. |

## Project Structure

```text
book-flip-showcase/
├── .cursor/rules/       # Cursor agent rules (project conventions)
├── .github/workflows/   # GitHub Actions (deployment)
├── docs/                # Plan, issue reports, design notes
│   ├── plan-1.md        # Product plan & scope (source of truth)
│   └── issues/          # Per-issue resolution reports
├── public/              # Static assets (covers, page images, favicon)
├── src/
│   ├── components/      # Shared UI (reader, gallery, layout)
│   ├── pages/           # Route-level pages (Gallery, Reader, NotFound)
│   ├── data/            # Static book metadata (planned)
│   ├── App.tsx          # Routes
│   ├── main.tsx         # React DOM entry
│   └── index.css        # Tailwind imports & global styles
├── eslint.config.ts     # ESLint 9 flat config
├── tailwind.config.ts   # Tailwind config
├── tsconfig.json        # Root TS config (project references)
├── vite.config.ts       # Vite config
└── package.json
```

## Code Style

This project does **not** use Prettier. ESLint 9 with `@stylistic/eslint-plugin` enforces formatting:

- No semicolons — `const a = 1`
- Single quotes for TS/JS — `'hello'`
- Double quotes for JSX attributes — `<div className="box">`
- 2-space indentation
- Object curly spacing always on — `{ key: value }`
- Trailing commas on multi-line literals
- React Hooks rules strictly enforced (`react-hooks/recommended`)

To fix style issues:

```bash
pnpm lint:fix
```

See [`.cursor/rules/code-style.mdc`](./.cursor/rules/code-style.mdc) for the full style guide used by the AI agent.

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`.
- **Branches** are named `<type>/<issue-id>-<short-slug>` (or `<type>/<short-slug>` when no issue exists).
- **PRs** are squash-merged by default and must close their linked issue.

Detailed conventions live in [`.cursor/rules/`](./.cursor/rules/):

| Rule | Scope |
| --- | --- |
| `project-overview.mdc` | Project context and scope (always applied). |
| `code-style.mdc` | StandardJS formatting for `*.ts` / `*.tsx`. |
| `commit-convention.mdc` | Conventional Commits and branch naming. |
| `agent-workflow.mdc` | Mandatory loop for every requirement. |
| `testing.mdc` | Vitest and Playwright conventions. |

## Agent Workflow

Every requirement runs through this loop end-to-end:

1. File a GitHub issue (`gh issue create`).
2. Branch off `main` as `<type>/<issue-id>-<slug>`.
3. Write Vitest unit / component tests.
4. Write Playwright E2E scenarios.
5. Make `pnpm lint` pass.
6. Write a resolution report at `docs/issues/{issue-id}.md`.
7. Post the report to the issue (`gh issue comment`).
8. Open and squash-merge the PR (`gh pr create` → `gh pr merge --squash --delete-branch`).

See [`.cursor/rules/agent-workflow.mdc`](./.cursor/rules/agent-workflow.mdc) for the Definition of Done.

## Continuous Integration & Deployment

Two GitHub Actions workflows guard `main`:

- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — on every PR and push to `main`: `pnpm lint`, `pnpm test` (Vitest), `pnpm build`, then `pnpm e2e` (Playwright, headed Chromium with cached browsers). The Playwright HTML report is uploaded as an artifact when the suite finishes.
- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) — on push to `main` (or manual dispatch): installs with `--frozen-lockfile`, builds with the production `VITE_BASE_URL`, and deploys the `dist/` folder to GitHub Pages via the official `actions/deploy-pages` action.

To enable Pages:

1. Push to `main`.
2. In repository **Settings → Pages**, set the source to **GitHub Actions**.
3. The workflow handles the rest; status is reflected by the badges at the top of this file.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
