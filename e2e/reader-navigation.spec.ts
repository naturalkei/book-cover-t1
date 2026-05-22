import { expect, test } from '@playwright/test'

import { seedViewMode } from './helpers'

test.describe('reader navigation', () => {
  test('clicks through every page of a book using the next button', async ({ page }) => {
    await seedViewMode(page, 'single')
    await page.goto('/')

    const firstCard = page.getByRole('list', { name: /book gallery/i }).getByRole('link').first()
    await firstCard.click()

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const nextButton = page.getByRole('button', { name: /next page/i })
    const prevButton = page.getByRole('button', { name: /previous page/i })
    const pagination = page.getByRole('navigation', { name: /reader pagination/i })

    await expect(prevButton).toBeDisabled()
    await expect(nextButton).toBeEnabled()

    const current = pagination.getByTestId('reader-current-page')
    const totalIndicator = pagination.getByTestId('reader-total-pages')

    await expect(current).toHaveText('1')
    const totalText = await totalIndicator.textContent()
    const total = Number(totalText)
    expect(total).toBeGreaterThan(1)

    for (let i = 1; i < total; i += 1) {
      await nextButton.click()
      await expect(current).toHaveText(String(i + 1))
    }

    await expect(nextButton).toBeDisabled()
    await expect(prevButton).toBeEnabled()

    await prevButton.click()
    await expect(current).toHaveText(String(total - 1))
  })
})
