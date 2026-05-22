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

  test('tapping the left half of the first spread closes back to the cover (#53)', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const indicator = page.getByRole('navigation', { name: /reader pagination/i })
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('2')

    await page.waitForTimeout(800)

    const board = page.getByTestId('page-flip')
    const box = await board.boundingBox()
    if (!box) throw new Error('missing page-flip bounding box')
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.5)

    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'true')
    await expect(indicator.getByTestId('reader-current-page')).toHaveText('1')
  })

  test('forward cover-boundary flip animates a cover-only leaf (right half, w-1/2) — not the full surface (#52)', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()

    const leaf = page.getByTestId('page-flip-outgoing')
    await expect(leaf).toBeVisible({ timeout: 200 })
    await expect(leaf).toHaveAttribute('data-cover-leaf', 'true')

    const leafBox = await leaf.boundingBox()
    const boardBox = await page.getByTestId('page-flip').boundingBox()
    if (!leafBox || !boardBox) throw new Error('missing bounding boxes')
    expect(leafBox.width).toBeLessThan(boardBox.width * 0.6)
    expect(leafBox.x).toBeGreaterThan(boardBox.x + boardBox.width * 0.4)

    const phantom = page.getByTestId('page-flip-phantom')
    await expect(phantom).toBeVisible()
    await expect(phantom).toHaveAttribute('data-cover-phantom', 'blank')
  })

  test('backward cover-boundary flip uses the same right-half cover leaf and a pages[2] phantom on the right (#52)', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'single')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: /previous page/i }).click()

    const leaf = page.getByTestId('page-flip-outgoing')
    await expect(leaf).toBeVisible({ timeout: 200 })
    await expect(leaf).toHaveAttribute('data-cover-leaf', 'true')

    const leafBox = await leaf.boundingBox()
    const boardBox = await page.getByTestId('page-flip').boundingBox()
    if (!leafBox || !boardBox) throw new Error('missing bounding boxes')
    expect(leafBox.width).toBeLessThan(boardBox.width * 0.6)

    const phantom = page.getByTestId('page-flip-phantom')
    await expect(phantom).toHaveAttribute('data-cover-phantom', 'page')
  })
})
