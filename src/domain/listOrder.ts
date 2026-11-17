import type { EntryState, ListEntry } from './types'

const STATE_RANK: Record<EntryState, number> = { waiting: 0, missing: 1, taken: 2 }

const NOT_TAKEN = 0

const orderKey = (entry: ListEntry) => (entry.state === 'taken' ? (entry.takenAt ?? NOT_TAKEN) : entry.addedAt)

export const orderEntries = (entries: ListEntry[]) =>
  entries.toSorted(
    (first, second) => STATE_RANK[first.state] - STATE_RANK[second.state] || orderKey(first) - orderKey(second),
  )

export function entryCounts(entries: ListEntry[]): Record<EntryState, number> {
  const counts: Record<EntryState, number> = { waiting: 0, taken: 0, missing: 0 }

  for (const entry of entries) {
    counts[entry.state] += 1
  }

  return counts
}
