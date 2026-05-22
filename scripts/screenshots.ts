import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, type Page } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'docs/media')
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const STORAGE_KEY = 'book-flip-showcase:theme'

interface Shot {
  name: string
  theme: 'light' | 'dark'
  setup: (page: Page) => Promise<void>
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
    setup: async (page) => {
      await page.goto(BASE_URL + '/')
      await page.locator('[aria-label="Book gallery"] a').first().click()
      await page.waitForSelector('[data-testid="page-flip-current"]')
      await page.getByRole('button', { name: /next page/i }).click()
      await page.waitForTimeout(800)
    },
  },
  {
    name: 'reader-light.png',
    theme: 'light',
    setup: async (page) => {
      await page.goto(BASE_URL + '/')
      await page.locator('[aria-label="Book gallery"] a').first().click()
      await page.waitForSelector('[data-testid="page-flip-current"]')
      await page.getByRole('button', { name: /next page/i }).click()
      await page.waitForTimeout(800)
    },
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
      await context.addInitScript(([key, value]) => {
        window.localStorage.setItem(key, value)
      }, [STORAGE_KEY, shot.theme] as const)
      const page = await context.newPage()
      await shot.setup(page)
      const outPath = resolve(OUT_DIR, shot.name)
      await page.screenshot({ path: outPath, fullPage: false })
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
