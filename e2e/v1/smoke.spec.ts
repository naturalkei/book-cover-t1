import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('gallery renders without console errors and shows book cards', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/v1')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const list = page.getByRole('list', { name: /book gallery/i })
    await expect(list).toBeVisible()
    await expect(list.getByRole('link')).not.toHaveCount(0)

    expect(errors).toEqual([])
  })
})
