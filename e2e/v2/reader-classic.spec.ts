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
    expect(style).toMatch(/perspective\(2200px\)/)
  })

  test('flips forward three times without swapping the current image mid-animation', async ({ page }) => {
    await page.goto('/v2/book/atlas-of-cities')
    await expect(page.getByTestId('page-flip')).toBeVisible()

    const current = page.getByTestId('page-flip-current')
    const initialSrc = await current.getAttribute('src')

    for (let i = 0; i < 3; i += 1) {
      const srcBefore = await current.getAttribute('src')
      await page.getByRole('button', { name: /next page/i }).click()
      await expect(page.getByTestId('page-flip-outgoing')).toBeVisible({ timeout: 300 })
      await expect(current).toHaveAttribute('src', srcBefore)
      await expect(page.getByTestId('page-flip-outgoing')).toHaveCount(0, { timeout: 2000 })
    }

    const finalSrc = await current.getAttribute('src')
    expect(finalSrc).not.toBe(initialSrc)
  })
})
