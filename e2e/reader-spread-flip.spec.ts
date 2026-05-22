import { expect, test } from '@playwright/test'

import { openFirstBook, seedCoverMode, seedViewMode } from './helpers'

test.describe('spread-mode single-leaf flip', () => {
  test('forward navigation animates only the right half (single leaf), not the whole spread', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'spread')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()

    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })

    const box = await outgoing.boundingBox()
    const board = await page.getByTestId('page-flip').boundingBox()
    if (!box || !board) throw new Error('missing bounding boxes')
    expect(box.width).toBeLessThan(board.width * 0.6)
    expect(box.x).toBeGreaterThan(board.x + board.width * 0.4)

    await expect(page.getByTestId('page-flip-phantom')).toBeVisible()
  })

  test('backward navigation animates only the left half (single leaf)', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'spread')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: /previous page/i }).click()

    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })

    const box = await outgoing.boundingBox()
    const board = await page.getByTestId('page-flip').boundingBox()
    if (!box || !board) throw new Error('missing bounding boxes')
    expect(box.width).toBeLessThan(board.width * 0.6)
    expect(box.x).toBeLessThan(board.x + board.width * 0.5)

    await expect(page.getByTestId('page-flip-phantom')).toBeVisible()
  })

  test('spread leaf interpolates its transform over multiple paint frames (real motion)', async ({ page }) => {
    await seedViewMode(page, 'spread')
    await seedCoverMode(page, 'spread')
    await page.setViewportSize({ width: 1440, height: 900 })
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 100 })

    const samples = await outgoing.evaluate(async (node) => {
      const collected: string[] = []
      const start = performance.now()
      while (performance.now() - start < 350 && (node as HTMLElement).isConnected) {
        collected.push(window.getComputedStyle(node as Element).transform)
        await new Promise(r => requestAnimationFrame(() => r(null)))
      }
      return collected
    })

    const distinct = new Set(samples.filter(s => s && s !== 'none'))
    expect(distinct.size).toBeGreaterThanOrEqual(2)
  })

  test('single-mode flip keeps the full-width outgoing leaf (no phantom layer)', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })

    const box = await outgoing.boundingBox()
    const board = await page.getByTestId('page-flip').boundingBox()
    if (!box || !board) throw new Error('missing bounding boxes')
    expect(box.width).toBeGreaterThan(board.width * 0.9)

    await expect(page.getByTestId('page-flip-phantom')).toHaveCount(0)
  })
})
