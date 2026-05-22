# docs/media

Auto-generated README screenshots. Regenerate any time with:

```bash
pnpm dev   # in one terminal (port 5173)
pnpm screenshots
```

| File | Description |
| --- | --- |
| `hero.png` | Gallery in dark mode — three-book grid with page counts. |
| `gallery-light.png` | Gallery in light mode. |
| `reader-dark.png` | Reader in spread + cover-alone mode on the first interior spread (pages 2–3), showing view toggles, scrubber, and flip-style picker. |
| `reader-light.png` | Same reader state in light mode. |

The capture script lives at [`scripts/screenshots.ts`](../../scripts/screenshots.ts) and uses Playwright's bundled Chromium at 1440×900 with `deviceScaleFactor: 2` and `fullPage: true` so the scrubber and flip-style picker are included.
