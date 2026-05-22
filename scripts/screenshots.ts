import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, type Page } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'docs/media')
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'

const THEME_KEY = 'book-flip-showcase:theme'
const VIEW_MODE_KEY = 'book-flip-showcase:view-mode'
const COVER_MODE_KEY = 'book-flip-showcase:cover-mode'

interface Shot {
  name: string
  theme: 'light' | 'dark'
  setup: (page: Page) => Promise<void>
}

const seedPrefs = async (
  page: Page,
  prefs: { theme: 'light' | 'dark', viewMode?: 'single' | 'spread', coverMode?: 'single' | 'spread' },
) => {
  await page.addInitScript(([themeKey, theme, viewKey, viewMode, coverKey, coverMode]) => {
    window.localStorage.setItem(themeKey, theme)
    if (viewMode) window.localStorage.setItem(viewKey, viewMode)
    if (coverMode) window.localStorage.setItem(coverKey, coverMode)
  }, [THEME_KEY, prefs.theme, VIEW_MODE_KEY, prefs.viewMode ?? '', COVER_MODE_KEY, prefs.coverMode ?? ''] as const)
}

const openReaderSpread = async (page: Page) => {
  await page.goto(BASE_URL + '/')
  await page.locator('[aria-label="Book gallery"] a').first().click()
  await page.waitForSelector('[data-testid="page-flip"]')
  // Cover-alone → first interior spread (pages 2–3)
  await page.getByRole('button', { name: /next page/i }).click()
  await page.waitForSelector('[data-testid="page-flip-current-right"]')
  await page.waitForSelector('[data-testid="flip-preset-picker"]')
  await page.getByRole('region', { name: /page scrubber/i }).waitFor()
}

const shots: Shot[] = [
  {
    name: 'hero.png',
    theme: 'dark',
    setup: async (page) => {
      await page.goto(BASE_URL + '/')
      await page.waitForSelector('[aria-label="Book gallery"]')
    },
  },
  {
    name: 'gallery-light.png',
    theme: 'light',
    setup: async (page) => {
      await page.goto(BASE_URL + '/')
      await page.waitForSelector('[aria-label="Book gallery"]')
    },
  },
  {
    name: 'reader-dark.png',
    theme: 'dark',
    setup: openReaderSpread,
  },
  {
    name: 'reader-light.png',
    theme: 'light',
    setup: openReaderSpread,
  },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  try {
    for (const shot of shots) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      })
      const page = await context.newPage()
      await seedPrefs(page, {
        theme: shot.theme,
        viewMode: shot.name.startsWith('reader') ? 'spread' : undefined,
        coverMode: shot.name.startsWith('reader') ? 'single' : undefined,
      })
      await shot.setup(page)
      const outPath = resolve(OUT_DIR, shot.name)
      await page.screenshot({ path: outPath, fullPage: true })
      console.log(`captured ${shot.name}`)
      await context.close()
    }
  }
  finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
