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
})
