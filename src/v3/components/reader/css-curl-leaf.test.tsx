import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import CssCurlLeaf from './css-curl-leaf'

describe('CssCurlLeaf', () => {
  test('keeps a front and back face through the midpoint', () => {
    render(
      <CssCurlLeaf
        frontSrc="/p/front.svg"
        backSrc="/p/back.svg"
        progress={0.5}
        direction="forward"
        pivot="left"
      />,
    )

    const leaf = screen.getByTestId('page-flip-outgoing')
    expect(leaf).toHaveStyle({ transformStyle: 'preserve-3d' })
    expect(leaf.style.transform).toContain('rotateY(')
    expect(screen.getByTestId('page-flip-outgoing-front')).toHaveAttribute('src', '/p/front.svg')
    expect(screen.getByTestId('page-flip-outgoing-back')).toHaveAttribute('src', '/p/back.svg')
    expect(screen.getByTestId('page-flip-outgoing-back')).toHaveStyle({
      transform: 'rotateY(180deg)',
      backfaceVisibility: 'hidden',
    })
  })
})
