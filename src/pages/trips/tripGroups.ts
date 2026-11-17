import { tripMonth } from '../../domain/spending'
import type { Trip } from '../../domain/types'

type TripGroup = {
  month: string
  trips: Trip[]
}

export function groupByMonth(tripsNewestFirst: Trip[]): TripGroup[] {
  const groups: TripGroup[] = []

  for (const trip of tripsNewestFirst) {
    const month = tripMonth(trip)
    const lastGroup = groups.at(-1)

    if (lastGroup?.month === month) {
      lastGroup.trips.push(trip)
    } else {
      groups.push({ month, trips: [trip] })
    }
  }

  return groups
}
