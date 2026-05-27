import { expect, test, type Page } from '@playwright/test'

import { openFirstBook, seedViewMode } from '../shared/helpers'

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

  test('outgoing leaf advances from the resting frame to the preset final frame', async ({ page }) => {
    await seedViewMode(page, 'single')
    await seedPreset(page, 'slide')
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 200 })

    await expect(outgoing).toHaveAttribute('data-flip-phase', 'final')
    const inline = await outgoing.evaluate(node => (node as HTMLElement).style.transform)
    expect(inline).toContain('translateX(-100%)')
  })

  test('outgoing leaf actually interpolates its transform across multiple frames (no instant snap)', async ({ page }) => {
    await seedViewMode(page, 'single')
    await seedPreset(page, 'slide')
    await openFirstBook(page)

    await page.getByRole('button', { name: /next page/i }).click()
    const outgoing = page.getByTestId('page-flip-outgoing')
    await expect(outgoing).toBeVisible({ timeout: 100 })

    const samples = await outgoing.evaluate(async (node) => {
      const collected: string[] = []
      const start = performance.now()
      while (performance.now() - start < 350 && (node as HTMLElement).isConnected) {
        collected.push(window.getComputedStyle(node as Element).transform)
        await new Promise(r => requestAnimationFrame(() => r(null)))
      }
      return collected
    })

    const distinct = new Set(samples.filter(s => s && s !== 'none'))
    expect(distinct.size).toBeGreaterThanOrEqual(2)
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

    await page.goto('/v1')
    await page.getByRole('list', { name: /book gallery/i }).getByRole('link').first().click()

    await expect(page.getByTestId('page-flip')).toHaveAttribute('data-flip-preset', 'fade')
    await expect(page.getByTestId('flip-preset-locked')).toBeVisible()

    await context.close()
  })
})
