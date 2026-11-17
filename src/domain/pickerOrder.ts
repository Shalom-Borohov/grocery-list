import { byName, matchesSearch } from './itemNames'
import type { Item, ListEntry } from './types'

const NEVER_TAKEN = 0

export function pickerItems(items: Item[], timesTaken: Map<string, number>, query: string) {
  const countOf = (itemId: string) => timesTaken.get(itemId) ?? NEVER_TAKEN

  return items
    .filter(({ name }) => matchesSearch(name, query))
    .toSorted((first, second) => countOf(second.id) - countOf(first.id) || byName(first, second))
}

export const usualInPicker = (usualIds: string[], listedAtOpening: ReadonlySet<string>) =>
  usualIds.filter((itemId) => !listedAtOpening.has(itemId))

export const tapTakesOff = (onList: ListEntry) => onList.state === 'waiting'
