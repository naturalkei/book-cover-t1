import { expect, test } from '@playwright/test'

test.describe('v3 reader css curl flip', () => {
  test('advances with progress metadata during a forward flip', async ({ page }) => {
    await page.goto('/v3/book/atlas-of-cities')
    await page.getByTestId('view-mode-single').click()

    const board = page.getByTestId('page-flip')
    await expect(board).toHaveAttribute('data-flip-progress', '0.000')

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 300 })
    await expect(outgoing).toHaveJSProperty('tagName', 'IMG')
    await expect(outgoing.locator(':scope > *')).toHaveCount(0)
    await expect(board).toHaveAttribute('data-flip-state', 'forward')

    const progress = await board.getAttribute('data-flip-progress')
    expect(progress).not.toBeNull()
    expect(Number(progress)).toBeGreaterThanOrEqual(0)

    await expect(outgoing).toHaveCount(0, { timeout: 2500 })
    await expect(board).toHaveAttribute('data-flip-progress', '0.000')
  })

  test('keeps the cover to one page and animates the spread gutter', async ({ page }) => {
    await page.goto('/v3/book/atlas-of-cities')

    const current = page.getByTestId('page-flip-current')
    const blank = page.getByTestId('page-flip-current-cover-blank')
    await expect(current).toBeVisible()
    await expect(blank).toBeVisible()

    const boardWidth = await page.getByTestId('page-flip').evaluate(element =>
      element.getBoundingClientRect().width,
    )
    const coverWidth = await current.evaluate(element => element.getBoundingClientRect().width)
    expect(coverWidth).toBeCloseTo(boardWidth / 2, 0)

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 300 })
    const outgoingWidth = await outgoing.evaluate(element => element.getBoundingClientRect().width)
    expect(outgoingWidth).toBeCloseTo(boardWidth / 2, 0)

    const gutter = page.getByTestId('page-flip-gutter')
    await expect(gutter).toHaveAttribute('data-flip-phase', 'active')
    await expect(page.getByTestId('page-flip-gutter-cast')).not.toHaveCSS('opacity', '0')
    await expect(gutter).toHaveAttribute('data-flip-phase', 'idle', { timeout: 2500 })
  })
})
