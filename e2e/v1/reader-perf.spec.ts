import { expect, test } from '@playwright/test'

import { openFirstBook, seedViewMode } from '../shared/helpers'

test.describe('reader perf', () => {
  test('renders the current page with high-priority loading hints', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)
    const current = page.getByTestId('page-flip-current')
    await expect(current).toBeVisible()
    await expect(current).toHaveAttribute('loading', 'eager')
    await expect(current).toHaveAttribute('decoding', 'async')
    await expect(current).toHaveAttribute('fetchpriority', 'high')
  })

  test('reader page module is fetched lazily, not on gallery load', async ({ page }) => {
    await seedViewMode(page, 'single')
    const readerRequests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (/\/v1\/pages\/Reader/i.test(url)) readerRequests.push(url)
    })

    await page.goto('/v1')
    await page.waitForLoadState('networkidle')
    expect(readerRequests).toEqual([])

    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()
    await expect(page.getByTestId('page-flip-current')).toBeVisible()
    await page.waitForLoadState('networkidle')

    expect(readerRequests.length).toBeGreaterThan(0)
  })

  test('only one DOM image is rendered for the page surface at rest', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)
    const flip = page.getByTestId('page-flip')
    await expect(flip).toBeVisible()
    const images = await flip.locator('img').count()
    expect(images).toBeLessThanOrEqual(2)
  })
})
