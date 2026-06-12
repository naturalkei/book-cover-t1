import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test } from 'vitest'

import V3Layout from './V3Layout'

describe('V3Layout', () => {
  test('labels every v3 route as paused work in progress', () => {
    render(
      <MemoryRouter initialEntries={['/v3']}>
        <Routes>
          <Route path="/v3" element={<V3Layout />}>
            <Route index element={<p>v3 content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('status', {
      name: /v3 status: work in progress, development paused/i,
    })).toHaveTextContent('Work in progress · Paused')
    expect(screen.getByText('v3 content')).toBeInTheDocument()
  })
})
