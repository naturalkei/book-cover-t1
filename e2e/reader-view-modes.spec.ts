import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'book-flip-showcase:view-mode'

const seedMode = async (page: Page, mode: 'single' | 'spread') => {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value)
  }, [STORAGE_KEY, mode] as const)
}

const openFirstBook = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()
  await expect(page.getByTestId('page-flip')).toBeVisible()
}

test.describe('reader view modes', () => {
  test('starts in single mode by default on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    await openFirstBook(page)
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'single')
    await expect(page.getByTestId('view-mode-single')).toHaveAttribute('aria-checked', 'true')
  })

  test('switching to spread renders two pages side by side and steps by 2', async ({ page }) => {
    await seedMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByTestId('view-mode-spread').click()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'spread')
    await expect(page.getByTestId('page-flip-current')).toBeVisible()
    await expect(page.getByTestId('page-flip-current-right')).toBeVisible()
    await expect(page.getByTestId('page-flip-current-spread')).toBeVisible()

    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('1')
    await expect(indicator.getByTestId('reader-current-page-right')).toHaveText('2')

    await page.getByRole('button', { name: /next page/i }).click()
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('3')
    await expect(indicator.getByTestId('reader-current-page-right')).toHaveText('4')
  })

  test('persists the chosen view mode across reloads', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByTestId('view-mode-spread').click()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'spread')

    await page.reload()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'spread')
  })

  test('keyboard ArrowRight in spread mode advances by 2', async ({ page }) => {
    await seedMode(page, 'spread')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('1')
    await page.keyboard.press('ArrowRight')
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('3')
  })
})
