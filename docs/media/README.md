# docs/media

Auto-generated README screenshots. Regenerate any time with:

```bash
pnpm dev   # in one terminal
pnpm screenshots
```

| File | Description |
| --- | --- |
| `hero.png` | Gallery in dark mode (default theme). |
| `gallery-light.png` | Gallery in light mode. |
| `reader-dark.png` | Reader on page 2 in dark mode. |
| `reader-light.png` | Reader on page 2 in light mode. |

The capture script lives at [`scripts/screenshots.ts`](../../scripts/screenshots.ts) and uses Playwright's bundled Chromium at 1440×900 with `deviceScaleFactor: 2` so the images render crisply on Retina-class displays.
