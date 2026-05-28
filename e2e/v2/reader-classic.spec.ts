import { expect, test } from '@playwright/test'

test.describe('v2 reader classic flip', () => {
  test('opens a book and animates the classic outgoing leaf', async ({ page }) => {
    await page.goto('/v2/book/atlas-of-cities')

    await expect(page.getByRole('heading', { level: 1, name: /atlas of cities/i })).toBeVisible()
    await expect(page.getByTestId('page-flip')).toBeVisible()

    await page.getByRole('button', { name: /next page/i }).click()

    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })
    await expect(outgoing).toHaveAttribute('data-flip-phase', 'final')

    const style = await outgoing.evaluate((node) => node.getAttribute('style') ?? '')
    expect(style).toMatch(/rotateY\(-180deg\)/)
    expect(style).not.toMatch(/rotateX/)
  })

  test('reveals the target page under the outgoing leaf during forward flips', async ({ page }) => {
    await page.goto('/v2/book/atlas-of-cities')
    await expect(page.getByTestId('page-flip')).toBeVisible()

    const current = page.getByTestId('page-flip-current')

    for (let i = 0; i < 3; i += 1) {
      await page.getByRole('button', { name: /next page/i }).click()
      const outgoing = page.getByTestId('page-flip-outgoing')
      await expect(outgoing).toBeVisible({ timeout: 300 })
      const outgoingSrc = await outgoing.getAttribute('src')
      const currentSrc = await current.getAttribute('src')
      expect(outgoingSrc).not.toBeNull()
      expect(currentSrc).not.toBeNull()
      expect(outgoingSrc).not.toEqual(currentSrc)
      await expect(outgoing).toHaveCount(0, { timeout: 2000 })
    }
  })

  test('keeps spine overlay at constant opacity during spread flips', async ({ page }) => {
    await page.goto('/v2/book/atlas-of-cities')
    await page.getByTestId('view-mode-spread').click()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'spread')

    await page.getByRole('button', { name: /next page/i }).click()

    const spine = page.getByTestId('page-flip-spine')
    await expect(spine).toHaveAttribute('data-flip-phase', 'active')
    await expect(page.getByTestId('page-flip-outgoing')).toHaveAttribute('data-flip-phase', 'final', { timeout: 500 })
    await expect(spine).toHaveClass(/opacity-80/)
  })
})
