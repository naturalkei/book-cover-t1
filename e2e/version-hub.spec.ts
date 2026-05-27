import { expect, test } from '@playwright/test'

test.describe('version hub', () => {
  test('lists v1 and v2 entry points', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: /choose a version/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /open v1 gallery/i })).toHaveAttribute('href', '/v1')
    await expect(page.getByRole('link', { name: /open v2 preview/i })).toHaveAttribute('href', '/v2')
  })
})
