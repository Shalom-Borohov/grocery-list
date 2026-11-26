import { parse } from 'valibot'
import { amountForNewEntry } from '../domain/amount'
import { type ListEntry, listEntrySchema } from '../domain/types'
import { db } from './db'
import { existing } from './errors'
import { createItem } from './itemsRepo'

const existingEntry = async (entryId: string) => existing(await db.listEntries.get(entryId), 'list entry', entryId)

const listedEntry = (itemId: string) => db.listEntries.where('itemId').equals(itemId).first()

export const newListEntry = (itemId: string, amount: ListEntry['amount'], now: number) =>
  parse(listEntrySchema, { id: crypto.randomUUID(), itemId, amount, state: 'waiting', addedAt: now })

export const addToList = (itemId: string, now: number, amount?: ListEntry['amount']) =>
  db.transaction('rw', db.items, db.listEntries, async () => {
    const listed = await listedEntry(itemId)

    if (listed) {
      return listed.id
    }

    const item = existing(await db.items.get(itemId), 'item', itemId)
    const entry = newListEntry(itemId, amount ?? amountForNewEntry(item), now)

    await db.listEntries.add(entry)

    return entry.id
  })

const putEntry = (entry: ListEntry) => db.listEntries.put(parse(listEntrySchema, entry))

function takenEntry(entry: ListEntry, now: number): ListEntry {
  const taken: ListEntry = { ...entry, state: 'taken', takenAt: now }

  return entry.state === 'missing' ? { ...taken, takenFromMissing: true } : taken
}

const takenBackEntry = ({ takenAt: _takenAt, takenFromMissing, ...entry }: ListEntry): ListEntry => ({
  ...entry,
  state: takenFromMissing ? 'missing' : 'waiting',
})

export const toggleTaken = (entryId: string, now: number) =>
  db.transaction('rw', db.listEntries, async () => {
    const entry = await existingEntry(entryId)

    await putEntry(entry.state === 'taken' ? takenBackEntry(entry) : takenEntry(entry, now))
  })

export const toggleMissing = (entryId: string) =>
  db.transaction('rw', db.listEntries, async () => {
    const { takenAt: _takenAt, takenFromMissing: _takenFromMissing, ...entry } = await existingEntry(entryId)

    await putEntry({ ...entry, state: entry.state === 'missing' ? 'waiting' : 'missing' })
  })

type EntryChanges = Partial<Pick<ListEntry, 'amount' | 'price'>>

export const updateEntry = (entryId: string, changes: EntryChanges) =>
  db.transaction('rw', db.listEntries, async () => {
    await putEntry({ ...(await existingEntry(entryId)), ...changes })
  })

export const removeEntry = (entryId: string) => db.listEntries.delete(entryId)

export const putBackEntry = (entry: ListEntry) =>
  db.transaction('rw', db.items, db.listEntries, async () => {
    const listed = await listedEntry(entry.itemId)

    if (listed) {
      return listed.id
    }

    existing(await db.items.get(entry.itemId), 'item', entry.itemId)
    await db.listEntries.add(parse(listEntrySchema, entry))

    return entry.id
  })

type PointOutcome = 'pointed' | 'unchanged' | 'alreadyListed'

export const pointEntryAt = (entryId: string, name: string, now: number) =>
  db.transaction('rw', db.items, db.listEntries, async (): Promise<PointOutcome> => {
    const {
      missedLastTrip: _missedLastTrip,
      takenFromMissing: _takenFromMissing,
      ...entry
    } = await existingEntry(entryId)
    const itemId = await createItem(name, now)
    const listed = await listedEntry(itemId)

    if (listed) {
      return listed.id === entryId ? 'unchanged' : 'alreadyListed'
    }

    await putEntry({ ...entry, itemId })

    return 'pointed'
  })
