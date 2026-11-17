import type { ListEntry, SavedSet } from './types'

export function entriesToPour(savedSet: SavedSet, onList: ListEntry[]) {
  const listedItemIds = new Set(onList.map(({ itemId }) => itemId))

  return savedSet.entries.filter(({ itemId }) => !listedItemIds.has(itemId))
}
