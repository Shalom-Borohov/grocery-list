import { parse } from 'valibot'
import { amountForNewEntry } from '../domain/amount'
import { type ListEntry, listEntrySchema } from '../domain/types'
import { db } from './db'
import { existing } from './errors'

const existingEntry = async (entryId: string) => existing(await db.listEntries.get(entryId), 'list entry', entryId)

export const newListEntry = (itemId: string, amount: ListEntry['amount'], now: number) =>
  parse(listEntrySchema, { id: crypto.randomUUID(), itemId, amount, state: 'waiting', addedAt: now })

export const addToList = (itemId: string, now: number, amount?: ListEntry['amount']) =>
  db.transaction('rw', db.items, db.listEntries, async () => {
    const listed = await db.listEntries.where('itemId').equals(itemId).first()

    if (listed) {
      return listed.id
    }

    const item = existing(await db.items.get(itemId), 'item', itemId)
    const entry = newListEntry(itemId, amount ?? amountForNewEntry(item), now)

    await db.listEntries.add(entry)

    return entry.id
  })

const putEntry = (entry: ListEntry) => db.listEntries.put(parse(listEntrySchema, entry))

export const toggleTaken = (entryId: string, now: number) =>
  db.transaction('rw', db.listEntries, async () => {
    const { takenAt: _takenAt, ...entry } = await existingEntry(entryId)

    await putEntry(entry.state === 'taken' ? { ...entry, state: 'waiting' } : { ...entry, state: 'taken', takenAt: now })
  })

export const toggleMissing = (entryId: string) =>
  db.transaction('rw', db.listEntries, async () => {
    const { takenAt: _takenAt, ...entry } = await existingEntry(entryId)

    await putEntry({ ...entry, state: entry.state === 'missing' ? 'waiting' : 'missing' })
  })

type EntryChanges = Partial<Pick<ListEntry, 'amount' | 'price'>>

export const updateEntry = (entryId: string, changes: EntryChanges) =>
  db.transaction('rw', db.listEntries, async () => {
    await putEntry({ ...(await existingEntry(entryId)), ...changes })
  })

export const removeEntry = (entryId: string) => db.listEntries.delete(entryId)
