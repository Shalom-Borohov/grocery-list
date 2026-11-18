import { parse } from 'valibot'
import { findItemByName } from '../domain/itemNames'
import { type Item, itemSchema, type ShrunkPhoto } from '../domain/types'
import { db } from './db'
import { DuplicateNameError, existing } from './errors'
import { deletePhotos, photoTables, storePhoto } from './photosRepo'

export type ItemChanges = Partial<Pick<Item, 'name' | 'note' | 'verdict' | 'usualAmount'>>

export const createItem = (name: string, now: number) =>
  db.transaction('rw', db.items, async () => {
    const found = findItemByName(await db.items.toArray(), name)

    if (found) {
      return found.id
    }

    const item = parse(itemSchema, { id: crypto.randomUUID(), name, createdAt: now })

    await db.items.add(item)

    return item.id
  })

export const updateItem = (itemId: string, changes: ItemChanges) =>
  db.transaction('rw', db.items, async () => {
    const item = parse(itemSchema, { ...existing(await db.items.get(itemId), 'item', itemId), ...changes })
    const sameName = findItemByName(await db.items.toArray(), item.name)

    if (sameName && sameName.id !== itemId) {
      throw new DuplicateNameError(item.name)
    }

    await db.items.put(item)
  })

export async function updateItemUnlessNameTaken(itemId: string, changes: ItemChanges): Promise<'saved' | 'nameTaken'> {
  try {
    await updateItem(itemId, changes)

    return 'saved'
  } catch (error) {
    if (error instanceof DuplicateNameError) {
      return 'nameTaken'
    }

    throw error
  }
}

export const setItemPhoto = (itemId: string, photo: ShrunkPhoto | undefined) =>
  db.transaction('rw', [db.items, ...photoTables()], async () => {
    const { photoId: oldPhotoId, ...item } = existing(await db.items.get(itemId), 'item', itemId)

    if (oldPhotoId) {
      await deletePhotos([oldPhotoId])
    }

    await db.items.put(photo ? { ...item, photoId: await storePhoto(photo) } : item)
  })

export const deleteItem = (itemId: string) =>
  db.transaction('rw', [db.items, db.listEntries, db.sets, ...photoTables()], async () => {
    const item = existing(await db.items.get(itemId), 'item', itemId)

    await db.items.delete(itemId)
    await db.listEntries.where('itemId').equals(itemId).delete()
    await db.sets.toCollection().modify((savedSet) => {
      savedSet.entries = savedSet.entries.filter((setEntry) => setEntry.itemId !== itemId)
    })

    if (item.photoId) {
      await deletePhotos([item.photoId])
    }
  })
