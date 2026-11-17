import { parse } from 'valibot'
import { entriesToPour } from '../domain/pourSet'
import { type SavedSet, savedSetSchema } from '../domain/types'
import { db } from './db'
import { existing } from './errors'
import { newListEntry } from './listRepo'

type SetChanges = Partial<Pick<SavedSet, 'name' | 'entries'>>

export async function createSetFromEntries(name: string, entries: SavedSet['entries'], now: number) {
  const savedSet = parse(savedSetSchema, { id: crypto.randomUUID(), name, entries, createdAt: now })

  await db.sets.add(savedSet)

  return savedSet.id
}

export const updateSet = (setId: string, changes: SetChanges) =>
  db.transaction('rw', db.sets, async () => {
    await db.sets.put(parse(savedSetSchema, { ...existing(await db.sets.get(setId), 'set', setId), ...changes }))
  })

export const deleteSet = (setId: string) => db.sets.delete(setId)

export const pourSet = (setId: string, now: number) =>
  db.transaction('rw', db.items, db.listEntries, db.sets, async () => {
    const savedSet = existing(await db.sets.get(setId), 'set', setId)
    const toPour = entriesToPour(savedSet, await db.listEntries.toArray())
    const items = await db.items.bulkGet(toPour.map(({ itemId }) => itemId))

    const entries = toPour.map(({ itemId, amount }, index) =>
      newListEntry(existing(items[index], 'item', itemId).id, amount, now),
    )

    await db.listEntries.bulkAdd(entries)

    return entries.map(({ itemId }) => itemId)
  })
