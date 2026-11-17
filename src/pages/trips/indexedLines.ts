import { itemsById } from '../../domain/itemJoin'
import type { Item, Trip, TripLine } from '../../domain/types'

export type IndexedLine = {
  tripLine: TripLine
  lineIndex: number
  item: Item | undefined
}

export const lineName = ({ tripLine, item }: IndexedLine) => item?.name ?? tripLine.name

export function indexedLines(trip: Trip, items: Item[]): IndexedLine[] {
  const byId = itemsById(items)

  const indexed = trip.lines.map((tripLine, lineIndex) => ({
    tripLine,
    lineIndex,
    item: byId.get(tripLine.itemId),
  }))

  return [
    ...indexed.filter(({ tripLine }) => tripLine.state === 'taken'),
    ...indexed.filter(({ tripLine }) => tripLine.state === 'missing'),
  ]
}
