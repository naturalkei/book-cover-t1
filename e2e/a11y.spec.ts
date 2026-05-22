import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'book-flip-showcase:theme'

const runAxe = async (page: Page) => {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
}

const setTheme = async (page: Page, theme: 'light' | 'dark') => {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value)
  }, [STORAGE_KEY, theme] as const)
}

test.describe('accessibility audit', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`gallery has no automatically detectable accessibility violations (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto('/')
      await expect(page.getByRole('list', { name: /book gallery/i })).toBeVisible()
      const results = await runAxe(page)
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })

    test(`reader has no automatically detectable accessibility violations (${theme})`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto('/')
      await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const results = await runAxe(page)
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
    })
  }

  test('skip-to-content link is focusable and lands on main', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to main content/i })
    await expect(skip).toBeFocused()
    await skip.click()
    await expect(page.locator('#main-content')).toBeFocused()
  })

  test('reader is fully keyboard navigable end-to-end', async ({ page }) => {
    await page.addInitScript(([key, value]) => {
      window.localStorage.setItem(key, value)
    }, ['book-flip-showcase:view-mode', 'single'] as const)
    await page.goto('/')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    const pagination = page.getByRole('navigation', { name: /reader pagination/i })
    const current = pagination.getByTestId('reader-current-page')
    const total = Number(await pagination.getByTestId('reader-total-pages').textContent())

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(current).toHaveText('3')

    await page.keyboard.press('Home')
    await expect(current).toHaveText('1')

    await page.keyboard.press('End')
    await expect(current).toHaveText(String(total))

    await page.keyboard.press('Escape')
    await expect(page.getByRole('list', { name: /book gallery/i })).toBeVisible()
  })
})

test.describe('reduced motion', () => {
  test.use({ colorScheme: 'dark' })

  test('uses the reduced-motion fallback on PageFlip when the user prefers reduce', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.addInitScript(([key, value]) => {
      window.localStorage.setItem(key, value)
    }, ['book-flip-showcase:view-mode', 'single'] as const)
    await page.goto('/')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    const flip = page.getByTestId('page-flip')
    await expect(flip).toBeVisible()

    await page.getByRole('button', { name: /next page/i }).click()

    const outgoing = flip.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })
    const transition = await outgoing.evaluate((node) => window.getComputedStyle(node).transitionProperty)
    expect(transition).toContain('opacity')
    expect(transition).not.toContain('transform')

    await context.close()
  })
})
