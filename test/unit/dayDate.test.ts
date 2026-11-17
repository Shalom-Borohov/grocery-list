import { describe, expect, it } from 'vitest'
import { dayDateOf, dayYear } from '../../src/domain/dayDate'

describe('day date', () => {
  it('gives the day of a moment in local time', () => {
    expect(dayDateOf(new Date(2026, 10, 10, 23, 30).getTime())).toBe('2026-11-10')
  })

  it('gives the year of a day', () => {
    expect(dayYear('2026-11-10')).toBe(2026)
  })
})
