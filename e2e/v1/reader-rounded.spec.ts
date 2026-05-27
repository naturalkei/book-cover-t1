import { expect, test } from '@playwright/test'

import { openFirstBook, seedViewMode } from '../shared/helpers'

const ROUNDED_KEY = 'book-flip-showcase:rounded-corners'

test.describe('reader rounded-corners toggle', () => {
  test('defaults to sharp corners (data-rounded=false)', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-rounded', 'false')
  })

  test('toggling the checkbox rounds the corners and persists across reload', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)

    const toggle = page.getByTestId('rounded-toggle').getByRole('switch')
    await expect(toggle).not.toBeChecked()
    await toggle.click()
    await expect(toggle).toBeChecked()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-rounded', 'true')

    const stored = await page.evaluate(key => window.localStorage.getItem(key), ROUNDED_KEY)
    expect(stored).toBe('true')

    await page.reload()
    await expect(page.getByTestId('rounded-toggle').getByRole('switch')).toBeChecked()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-rounded', 'true')
  })
})
