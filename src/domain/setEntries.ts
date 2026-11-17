import { amountForNewEntry } from './amount'
import { withItems } from './itemJoin'
import { byName } from './itemNames'
import type { Amount, Item, ListEntry, SavedSet, SetEntry, Trip } from './types'

export type SetItem = { item: Item; setEntry: SetEntry }

export const withAmount = (entries: SetEntry[], itemId: string, amount: Amount) =>
  entries.map((setEntry) => (setEntry.itemId === itemId ? { ...setEntry, amount } : setEntry))

export const withoutItem = (entries: SetEntry[], itemId: string) =>
  entries.filter((setEntry) => setEntry.itemId !== itemId)

export const isInSet = (entries: SetEntry[], itemId: string) => entries.some((setEntry) => setEntry.itemId === itemId)

export const withItemToggled = (entries: SetEntry[], item: Item) =>
  isInSet(entries, item.id) ? withoutItem(entries, item.id) : [...entries, { itemId: item.id, amount: amountForNewEntry(item) }]

export const setEntriesFromList = (entries: ListEntry[]): SetEntry[] => entries.map(({ itemId, amount }) => ({ itemId, amount }))

export function setEntriesFromTrip(trip: Trip, items: Item[]): SetEntry[] {
  const existingIds = new Set(items.map(({ id }) => id))

  return trip.lines
    .filter(({ state, itemId }) => state === 'taken' && existingIds.has(itemId))
    .map(({ itemId, amount }) => ({ itemId, amount }))
}

export const setsInOrder =(sets: SavedSet[]) => sets.toSorted((first, second) => first.createdAt - second.createdAt)

export const setItemsInOrder = (savedSet: SavedSet, items: Item[]): SetItem[] =>
  withItems(savedSet.entries, items)
    .map(({ record, item }) => ({ item, setEntry: record }))
    .toSorted((first, second) => byName(first.item, second.item))
