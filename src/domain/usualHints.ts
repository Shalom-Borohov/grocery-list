import type { Trip } from './types'

const TRIPS_CONSIDERED = 6

const MINIMUM_TRIPS = 3

const SHARE_NEEDED = 0.5

const NEVER = 0

export const newestFirst = (trips: Trip[]) => trips.toSorted((first, second) => second.finishedAt - first.finishedAt)

export const takenItemIds = (trip: Trip) =>
  new Set(trip.lines.filter(({ state }) => state === 'taken').map(({ itemId }) => itemId))

export function timesTakenByItem(trips: Trip[]) {
  const timesTaken = new Map<string, number>()

  for (const trip of trips) {
    for (const itemId of takenItemIds(trip)) {
      timesTaken.set(itemId, (timesTaken.get(itemId) ?? NEVER) + 1)
    }
  }

  return timesTaken
}

function lastTakenByItem(trips: Trip[]) {
  const lastTaken = new Map<string, number>()

  for (const trip of trips) {
    for (const itemId of takenItemIds(trip)) {
      lastTaken.set(itemId, Math.max(lastTaken.get(itemId) ?? NEVER, trip.finishedAt))
    }
  }

  return lastTaken
}

export function usualItemIds(trips: Trip[]) {
  if (trips.length < MINIMUM_TRIPS) {
    return []
  }

  const recent = newestFirst(trips).slice(0, TRIPS_CONSIDERED)
  const timesTaken = timesTakenByItem(recent)
  const lastTaken = lastTakenByItem(recent)
  const needed = recent.length * SHARE_NEEDED
  const countOf = (itemId: string) => timesTaken.get(itemId) ?? NEVER
  const lastOf = (itemId: string) => lastTaken.get(itemId) ?? NEVER

  return [...timesTaken.keys()]
    .filter((itemId) => countOf(itemId) >= needed)
    .toSorted((first, second) => countOf(second) - countOf(first) || lastOf(second) - lastOf(first))
}
