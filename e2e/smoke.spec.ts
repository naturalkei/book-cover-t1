import { expect, test } from '@playwright/test'

test.describe('smoke', () => {
  test('root page renders without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')

    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('#root')).not.toBeEmpty()
    expect(errors).toEqual([])
  })
})
