import { expect, test } from '@playwright/test'

import { seedViewMode } from './helpers'

test.describe('reader keyboard shortcuts', () => {
  test('navigates with ArrowRight / ArrowLeft / Home / End / Escape', async ({ page }) => {
    await seedViewMode(page, 'single')
    await page.goto('/')

    const firstCard = page.getByRole('list', { name: /book gallery/i }).getByRole('link').first()
    const bookPath = await firstCard.getAttribute('href')
    expect(bookPath).toMatch(/^\/.*book\//)
    await firstCard.click()

    const pagination = page.getByRole('navigation', { name: /reader pagination/i })
    const current = pagination.getByTestId('reader-current-page')
    const total = Number(await pagination.getByTestId('reader-total-pages').textContent())

    await expect(current).toHaveText('1')

    await page.keyboard.press('ArrowRight')
    await expect(current).toHaveText('2')

    await page.keyboard.press('ArrowRight')
    await expect(current).toHaveText('3')

    await page.keyboard.press('ArrowLeft')
    await expect(current).toHaveText('2')

    await page.keyboard.press('End')
    await expect(current).toHaveText(String(total))

    await page.keyboard.press('Home')
    await expect(current).toHaveText('1')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('list', { name: /book gallery/i })).toBeVisible()
  })

  test('does not navigate while typing in the page-jump input', async ({ page }) => {
    await seedViewMode(page, 'single')
    await page.goto('/')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    const pagination = page.getByRole('navigation', { name: /reader pagination/i })
    const current = pagination.getByTestId('reader-current-page')
    await expect(current).toHaveText('1')

    const jumpInput = page.getByRole('spinbutton', { name: /page number/i })
    await jumpInput.click()
    await page.keyboard.press('ArrowRight')
    await expect(current).toHaveText('1')
  })
})
