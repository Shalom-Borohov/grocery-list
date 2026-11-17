import { describe, expect, it } from 'vitest'
import { periodSpending } from '../../src/domain/spending'
import { newestFirst } from '../../src/domain/usualHints'
import { trip } from '../helpers/records'

const NOVEMBER = 10

const OCTOBER = 9

const at = (month: number, day: number, year = 2026) => new Date(year, month, day, 18).getTime()

const trips = newestFirst([
  trip({ id: 'nov-12', finishedAt: at(NOVEMBER, 12), total: 412.3 }),
  trip({ id: 'nov-8', finishedAt: at(NOVEMBER, 8), total: 74.9 }),
  trip({ id: 'nov-2', finishedAt: at(NOVEMBER, 2) }),
  trip({ id: 'nov-5', finishedAt: at(NOVEMBER, 5), total: 388 }),
  trip({ id: 'oct-29', finishedAt: at(OCTOBER, 29), total: 356.4 }),
  trip({ id: 'last-year', finishedAt: at(NOVEMBER, 20, 2025), total: 99 }),
])

const today = '2026-11-17'

describe('spending', () => {
  it('sums the month, counts its trips and averages the trips that have a total', () => {
    expect(periodSpending(trips, 'month', today)).toEqual({
      total: 875.2,
      tripCount: 4,
      average: 291.73,
      withoutTotal: 1,
      tripIds: ['nov-12', 'nov-8', 'nov-5', 'nov-2'],
    })
  })

  it('sums the year the same way', () => {
    expect(periodSpending(trips, 'year', today)).toMatchObject({ total: 1231.6, tripCount: 5, withoutTotal: 1 })
  })

  it('has no average when no trip in the period has a total', () => {
    expect(periodSpending([trip({ id: 'empty', finishedAt: at(NOVEMBER, 1) })], 'month', today)).toEqual({
      total: 0,
      tripCount: 1,
      average: undefined,
      withoutTotal: 1,
      tripIds: ['empty'],
    })
  })
})
