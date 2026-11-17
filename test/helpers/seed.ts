import { db } from '../../src/data/db'
import { createItem, type ItemChanges, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { createSetFromEntries } from '../../src/data/setsRepo'
import { finishShopping, startTrip } from '../../src/data/tripsRepo'
import { amountForNewEntry } from '../../src/domain/amount'
import { CREATED_AT } from './records'

export async function seedSet(name: string, itemIds: string[], now: number) {
  const items = await db.items.bulkGet(itemIds)
  const entries = items.flatMap((found) => (found ? [{ itemId: found.id, amount: amountForNewEntry(found) }] : []))

  return createSetFromEntries(name, entries, now)
}

export async function seedItem(name: string, changes: ItemChanges = {}) {
  const itemId = await createItem(name, CREATED_AT)

  await updateItem(itemId, changes)

  return itemId
}

export async function finishTripTaking(itemIds: string[], finishedAt: number) {
  await startTrip(finishedAt)

  for (const itemId of itemIds) {
    await toggleTaken(await addToList(itemId, finishedAt), finishedAt)
  }

  await finishShopping({ receipts: [] }, finishedAt)
}
