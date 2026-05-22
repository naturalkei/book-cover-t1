import { expect, test } from '@playwright/test'

test.describe('reader thumbnail scrubber', () => {
  test('jumps to a thumbnail when clicked', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    const pagination = page.getByRole('navigation', { name: /reader pagination/i })
    const current = pagination.getByTestId('reader-current-page')
    await expect(current).toHaveText('1')

    await page.getByTestId('scrubber-thumb-4').click()
    await expect(current).toHaveText('5')
  })

  test('scrubbing the slider commits a new page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    const slider = page.getByRole('slider', { name: /scrub to page/i })
    const current = page.getByTestId('reader-current-page')
    await expect(current).toHaveText('1')

    await slider.focus()
    await page.keyboard.press('End')

    const total = Number(await page.getByTestId('reader-total-pages').textContent())
    await expect(current).toHaveText(String(total))
  })
})
