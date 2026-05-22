import { expect, test } from '@playwright/test'

import { openFirstBook, seedCoverMode, seedViewMode } from './helpers'

test.describe('reader view modes', () => {
  test('starts in single mode by default on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    await openFirstBook(page)
    await expect(page.getByTestId('page-flip')).toBeVisible()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'single')
    await expect(page.getByTestId('view-mode-single')).toHaveAttribute('aria-checked', 'true')
  })

  test('switching to spread (cover paired) renders two pages side by side and steps by 2', async ({ page }) => {
    await seedViewMode(page, 'single')
    await seedCoverMode(page, 'spread')
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

  test('keyboard ArrowRight in spread mode (cover paired) advances by 2', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'spread')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('1')
    await page.keyboard.press('ArrowRight')
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('3')
  })
})
