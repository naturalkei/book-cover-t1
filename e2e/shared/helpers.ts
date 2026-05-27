import type { Page } from '@playwright/test'

const THEME_KEY = 'book-flip-showcase:theme'
const VIEW_MODE_KEY = 'book-flip-showcase:view-mode'
const COVER_MODE_KEY = 'book-flip-showcase:cover-mode'

export const seedTheme = async (page: Page, theme: 'light' | 'dark') => {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value)
  }, [THEME_KEY, theme] as const)
}

export const seedViewMode = async (page: Page, mode: 'single' | 'spread') => {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value)
  }, [VIEW_MODE_KEY, mode] as const)
}

export const seedCoverMode = async (page: Page, coverMode: 'single' | 'spread') => {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value)
  }, [COVER_MODE_KEY, coverMode] as const)
}

export const openFirstBook = async (page: Page) => {
  await page.goto('/v1')
  await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()
}
