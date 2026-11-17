import { dayDateOf, dayMonth, dayYear } from './dayDate'
import type { Trip } from './types'

export const PERIODS = ['month', 'year'] as const

export type Period = (typeof PERIODS)[number]

export type PeriodSpending = {
  total: number
  tripCount: number
  average: number | undefined
  withoutTotal: number
  tripIds: string[]
}

const AGOROT_IN_SHEKEL = 100

const toAgorot = (amount: number) => Math.round(amount * AGOROT_IN_SHEKEL) / AGOROT_IN_SHEKEL

const tripDay = (trip: Trip) => dayDateOf(trip.finishedAt)

export const tripMonth = (trip: Trip) => dayMonth(tripDay(trip))

const PERIOD_MATCHERS: Record<Period, (trip: Trip, today: string) => boolean> = {
  month: (trip, today) => tripMonth(trip) === dayMonth(today),
  year: (trip, today) => dayYear(tripDay(trip)) === dayYear(today),
}

export function periodSpending(tripsNewestFirst: Trip[], period: Period, today: string): PeriodSpending {
  const inPeriod = tripsNewestFirst.filter((trip) => PERIOD_MATCHERS[period](trip, today))
  const totals = inPeriod.flatMap(({ total }) => (total === undefined ? [] : [total]))
  const total = toAgorot(totals.reduce((sum, amount) => sum + amount, 0))

  return {
    total,
    tripCount: inPeriod.length,
    average: totals.length > 0 ? toAgorot(total / totals.length) : undefined,
    withoutTotal: inPeriod.length - totals.length,
    tripIds: inPeriod.map(({ id }) => id),
  }
}
