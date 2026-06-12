# Codex Agent Instructions

These instructions apply to the entire repository. They adapt the rules in
`.cursor/rules/` for Codex. When this file and a more specific nested
`AGENTS.md` conflict, follow the more specific file.

## Project Context

`book-flip-showcase` is a static, client-only SPA for browsing book covers and
experiencing realistic page-turn interactions.

- Stack: Vite 7, React 19, TypeScript 5, Tailwind CSS 4,
  `react-router-dom` 7, `lucide-react`, pnpm 10.
- No backend, authentication, CMS, SSR, or API routes.
- Static book metadata lives in typed modules. Cover and page assets live
  under `public/`.
- Product and architecture sources of truth:
  - `docs/plan-1.md`: v1 product scope and original milestones.
  - `docs/plan-2.md`: version coexistence, maintenance branches, and release
    architecture.
  - `docs/plan-3.md` and `docs/plan-3-en.md`: v3 paper-curl and interaction
    planning.

Update the relevant plan in the same change when a product or architecture
decision changes.

## Version Boundaries

- Keep version implementations isolated under `src/v1/`, `src/v2/`, and
  future `src/v3/`.
- A version must not import another version's implementation.
- Extract code to `src/shared/` only when it is genuinely stable and shared.
- Preserve v1 as the frozen baseline unless the task explicitly requests a v1
  fix.
- Keep versioned E2E coverage under `e2e/v1/`, `e2e/v2/`, and future
  `e2e/v3/`.

## Required Workflow

For every non-trivial requirement or runtime change, complete this loop unless
the user explicitly requests a smaller scope:

1. Create a GitHub issue with scope, acceptance criteria, and test plan.
2. Create a branch from the appropriate integration line:
   - Version-specific work: branch from the matching `maint/v*`.
   - Repository-wide docs/tooling: branch from `main`.
   - Name branches `<type>/<issue-id>-<short-slug>`.
3. Add or update colocated Vitest unit/component tests.
4. Add or update Playwright scenarios for user-facing behavior.
5. Run the relevant verification commands.
6. Write `docs/issues/{issue-id}.md` with problem, approach, trade-offs, and
   verification.
7. Comment the report on the GitHub issue.
8. Open a PR to `main`, wait for CI, then squash-merge and delete the branch.

Pure documentation, config-only changes, and chores without runtime impact may
skip Vitest and Playwright. State skipped checks in the final response or PR
description.

Production release flow is always:

```text
maint/v* or feature branch -> main -> release -> GitHub Pages
```

Never deploy directly from `main` or a maintenance branch.

## Verification

Use the smallest relevant checks while iterating, then broaden based on risk.
Before considering runtime work complete, run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm e2e
```

- Every command must pass before merge.
- For pure docs changes, `pnpm lint` and a Markdown whitespace check are
  sufficient unless the change affects tooling.
- Call out checks that were not run and explain why.

## TypeScript and React Style

Formatting is enforced by ESLint 9 and `@stylistic/eslint-plugin`. Do not add
Prettier.

- No semicolons.
- Single quotes in TypeScript/JavaScript.
- Double quotes for JSX attributes.
- Two-space indentation.
- Always use object curly spacing: `{ key: value }`.
- Use trailing commas in multiline literals.
- Keep one final newline and no trailing whitespace.
- Prefer clear React composition and existing local patterns over new
  abstractions.

### Naming

- React component files: PascalCase, for example `CoverModeToggle.tsx`.
- Other source files and directories: kebab-case.
- Hook filenames omit the `use` prefix; exported hooks retain it:
  `cover-mode.ts` exports `useCoverMode`.
- Interfaces: `IPascalCase`.
- Type aliases: `TPascalCase`.
- Literal constants: `UPPER_SNAKE_CASE`.
- Constant objects and arrays: `PascalCase`.
- Functions: camelCase with a verb prefix.

### Tailwind

- When a `className` string exceeds 60 characters, split it across multiple
  lines with `clsx(...)`.
- Put reusable class bundles in the version-local `lib/class-names.ts`, or in
  `src/shared/` only when the bundle is truly shared.

## Testing Conventions

### Vitest

- Colocate tests with source: `Foo.tsx` -> `Foo.test.tsx`.
- Use React Testing Library for component tests.
- Prefer `userEvent` over `fireEvent`.
- Avoid snapshots for dynamic UI behavior.
- Name tests after observable behavior, not implementation details.

### Playwright

- Store user-journey specs under the matching version directory in `e2e/`.
- Prefer role and accessible-name selectors; use `data-testid` only when a
  semantic selector is impractical.
- Keep every spec runnable in isolation against a fresh `pnpm dev` server.
- Include keyboard accessibility coverage for new interactive controls.

## Git Conventions

Use Conventional Commits:

```text
<type>(<optional-scope>): <imperative summary>
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`,
`perf`, `build`, `ci`.

- Be specific; do not use `update`, `wip`, or `misc`.
- Do not mix unrelated changes in one commit.
- Use lowercase imperative summaries without trailing periods.
- Default to squash-merging PRs.

## Definition of Done

- Requested behavior or documentation is complete.
- Version boundaries and architecture plans remain consistent.
- Relevant Vitest, Playwright, lint, and build checks pass.
- Runtime changes include an issue report under `docs/issues/`.
- The GitHub issue is updated and closed by a squash-merged PR.
- Release work reaches Pages only through `main -> release`.
