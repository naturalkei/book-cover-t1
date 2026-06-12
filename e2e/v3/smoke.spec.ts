import { expect, test } from '@playwright/test'

test.describe('v3 smoke', () => {
  test('preview gallery and reader stub render without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/v3')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.getByRole('heading', { level: 1, name: /paper curl reading room/i })).toBeVisible()
    await expect(page.getByRole('list', { name: /book gallery/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /v2 css reader/i })).toHaveAttribute('href', '/v2')

    await page.getByRole('link', { name: /open atlas of cities/i }).click()
    await expect(page.getByTestId('v3-reader-stub')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /atlas of cities/i })).toBeVisible()

    expect(errors).toEqual([])
  })
})
