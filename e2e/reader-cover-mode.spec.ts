import { expect, test } from '@playwright/test'

import { openFirstBook, seedCoverMode, seedViewMode } from './helpers'

test.describe('reader cover-alone view', () => {
  test('cover alone in spread mode renders only the right half + blank left half', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'true')
    await expect(page.getByTestId('page-flip-current-cover-blank')).toBeVisible()
    await expect(page.getByTestId('page-flip-current')).toBeVisible()
    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('1')
    await expect(indicator.queryByTestId?.('reader-current-page-right') ?? page.getByTestId('reader-current-page-right')).toHaveCount(0)
  })

  test('stepping forward from the cover lands on the first real spread (1 → 2-3)', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('2')
    await expect(indicator.getByTestId('reader-current-page-right')).toHaveText('3')
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'false')
  })

  test('stepping backward from the first interior spread returns to the cover alone', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    await page.getByRole('button', { name: /previous page/i }).click()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'true')
    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('1')
  })

  test('cover-alone preference persists across reload', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    const toggle = page.getByTestId('cover-mode-toggle').getByRole('switch')
    await expect(toggle).toBeChecked()
    await toggle.click()
    await expect(toggle).not.toBeChecked()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'false')

    await page.reload()
    await expect(page.getByTestId('cover-mode-toggle').getByRole('switch')).not.toBeChecked()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'false')
  })

  test('cover toggle is disabled in single-page view mode', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)
    const toggle = page.getByTestId('cover-mode-toggle').getByRole('switch')
    await expect(toggle).toBeDisabled()
  })
})
