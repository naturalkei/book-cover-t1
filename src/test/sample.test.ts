import { describe, expect, it } from 'vitest'

describe('vitest wiring', () => {
  it('runs a sample expectation', () => {
    expect(1 + 1).toBe(2)
  })

  it('has access to jest-dom matchers via setup', () => {
    const el = document.createElement('div')
    el.textContent = 'hello'
    expect(el).toHaveTextContent('hello')
  })
})
