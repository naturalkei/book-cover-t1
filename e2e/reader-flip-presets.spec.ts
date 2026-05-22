import { expect, test, type Page } from '@playwright/test'

import { openFirstBook, seedViewMode } from './helpers'

const PRESET_STORAGE_KEY = 'book-flip-showcase:flip-preset'

const seedPreset = async (page: Page, preset: 'classic' | 'curl' | 'slide' | 'fade' | 'tilt') => {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value)
  }, [PRESET_STORAGE_KEY, preset] as const)
}

test.describe('reader flip presets', () => {
  test('defaults to classic and renders one chip per preset', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)

    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-flip-preset', 'classic')
    for (const id of ['classic', 'curl', 'slide', 'fade', 'tilt']) {
      await expect(page.getByTestId(`flip-preset-${id}`)).toBeVisible()
    }
  })

  test('selecting a chip swaps the active preset and persists across reload', async ({ page }) => {
    await seedViewMode(page, 'single')
    await openFirstBook(page)

    await page.getByTestId('flip-preset-tilt').click()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-flip-preset', 'tilt')
    await expect(page.getByTestId('flip-preset-tilt')).toHaveAttribute('data-active', 'true')

    await page.reload()
    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-flip-preset', 'tilt')
  })

  test('outgoing leaf style changes between presets', async ({ page }) => {
    await seedViewMode(page, 'single')
    await seedPreset(page, 'slide')
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })
    const slideTransform = await outgoing.evaluate(node =>
      window.getComputedStyle(node as Element).transform,
    )
    expect(slideTransform).not.toBe('none')
  })

  test('reduced motion forces the fade preset regardless of stored preference', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.addInitScript(([k, v]) => {
      window.localStorage.setItem(k, v)
    }, ['book-flip-showcase:view-mode', 'single'] as const)
    await page.addInitScript(([k, v]) => {
      window.localStorage.setItem(k, v)
    }, [PRESET_STORAGE_KEY, 'tilt'] as const)

    await page.goto('/')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-flip-preset', 'fade')
    await expect(page.getByTestId('flip-preset-locked')).toBeVisible()

    await context.close()
  })
})
