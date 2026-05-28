import { expect, test } from '@playwright/test'

test.describe('v2 smoke', () => {
  test('preview gallery renders without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/v2')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.getByRole('heading', { level: 1, name: /next-generation reading room/i })).toBeVisible()
    await expect(page.getByRole('list', { name: /book gallery/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /stable v1 demo/i })).toHaveAttribute('href', '/v1')

    expect(errors).toEqual([])
  })
})
