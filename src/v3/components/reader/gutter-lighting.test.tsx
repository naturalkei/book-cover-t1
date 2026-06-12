import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import GutterLighting from './gutter-lighting'

describe('GutterLighting', () => {
  test('casts forward-turn shadow toward the left incoming page', () => {
    render(<GutterLighting progress={0.5} direction="forward" active />)

    const cast = screen.getByTestId('page-flip-gutter-cast')
    expect(cast).toHaveStyle({ right: '0px' })
    expect(cast.style.backgroundImage).toContain('to left')
  })

  test('casts backward-turn shadow toward the right incoming page', () => {
    render(<GutterLighting progress={0.5} direction="backward" active />)

    const cast = screen.getByTestId('page-flip-gutter-cast')
    expect(cast).toHaveStyle({ left: '0px' })
    expect(cast.style.backgroundImage).toContain('to right')
  })
})
