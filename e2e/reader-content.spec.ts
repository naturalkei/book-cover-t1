import { expect, test } from '@playwright/test'

import { openFirstBook, seedViewMode } from './helpers'

test.describe('reader content', () => {
  test('the first book reports at least 20 pages in the gallery card and reader pagination', async ({ page }) => {
    await seedViewMode(page, 'single')
    await page.goto('/')
    const firstCard = page.getByRole('list', { name: /book gallery/i }).getByRole('link').first()
    const pageCountLabel = await firstCard.getByText(/\d+\s+pages/i).textContent()
    const pageCount = Number.parseInt((pageCountLabel ?? '').match(/\d+/)?.[0] ?? '0', 10)
    expect(pageCount).toBeGreaterThanOrEqual(20)

    await firstCard.click()
    const totalLabel = await page.getByTestId('reader-total-pages').textContent()
    expect(Number.parseInt((totalLabel ?? '').trim(), 10)).toBeGreaterThanOrEqual(20)
  })

  test('successive pages render distinct page images (no repeated placeholder)', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)

    const collected: string[] = []
    for (let i = 0; i < 5; i++) {
      const src = await page.getByTestId('page-flip-current').getAttribute('src')
      collected.push(src ?? '')
      await page.getByRole('button', { name: /next page/i }).click()
      await page.waitForTimeout(750)
    }

    const distinct = new Set(collected)
    expect(distinct.size).toBe(collected.length)
    for (const src of collected) {
      expect(src.startsWith('data:image/svg+xml')).toBe(true)
    }
  })
})
