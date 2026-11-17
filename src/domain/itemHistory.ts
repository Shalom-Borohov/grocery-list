import type { Trip, TripLine } from './types'
import { newestFirst } from './usualHints'

export type PricePoint = { finishedAt: number; price: number; share: number }

export type ItemHistory = {
  timesBought: number
  timesMissing: number
  lastBoughtAt: number | undefined
  prices: PricePoint[]
}

const FULL_SHARE = 1

export function itemHistory(itemId: string, trips: Trip[]): ItemHistory {
  const appearances = newestFirst(trips).flatMap(({ finishedAt, lines }) =>
    lines.filter((tripLine) => tripLine.itemId === itemId).map((tripLine) => ({ finishedAt, tripLine })),
  )

  const bought = appearances.filter(({ tripLine }) => tripLine.state === 'taken')

  const priced = bought.flatMap(({ finishedAt, tripLine }: { finishedAt: number; tripLine: TripLine }) =>
    tripLine.price === undefined ? [] : [{ finishedAt, price: tripLine.price }],
  )

  const highest = Math.max(...priced.map(({ price }) => price))

  return {
    timesBought: bought.length,
    timesMissing: appearances.length - bought.length,
    lastBoughtAt: bought[0]?.finishedAt,
    prices: priced.map((point) => ({ ...point, share: highest > 0 ? point.price / highest : FULL_SHARE })),
  }
}

export function lastPrice(itemId: string, trips: Trip[]) {
  let newest: { finishedAt: number; price: number } | undefined

  for (const { finishedAt, lines } of trips) {
    const price = lines.find((tripLine) => tripLine.itemId === itemId && tripLine.state === 'taken')?.price

    if (price !== undefined && (newest === undefined || finishedAt > newest.finishedAt)) {
      newest = { finishedAt, price }
    }
  }

  return newest?.price
}
