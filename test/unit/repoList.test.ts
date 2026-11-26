import { beforeEach, describe, expect, it } from 'vitest'
import { allRecords } from '../../src/data/recordsContext'
import { createItem, deleteItem } from '../../src/data/itemsRepo'
import {
  addToList,
  pointEntryAt,
  putBackEntry,
  removeEntry,
  toggleMissing,
  toggleTaken,
  updateEntry,
} from '../../src/data/listRepo'
import { finishShopping } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { amount, packOf } from '../helpers/records'

const NOW = 1_700_000_000_000

beforeEach(resetDb)

describe('items', () => {
  it('creates an item with a trimmed name, and finds the same item when the name is typed again', async () => {
    const id = await createItem('  חלב 3% ', NOW)

    expect(await createItem('חלב 3%', NOW)).toBe(id)
    expect((await allRecords()).items).toEqual([{ id, name: 'חלב 3%', createdAt: NOW }])
  })

  it('refuses a blank name', async () => {
    await expect(createItem('   ', NOW)).rejects.toThrow()
  })
})

describe('the list', () => {
  it('adds an item once, with one unit for an item never bought', async () => {
    const milk = await createItem('חלב', NOW)

    await addToList(milk, NOW)
    await addToList(milk, NOW)

    const { entries } = await allRecords()

    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ itemId: milk, amount: amount(1), state: 'waiting', addedAt: NOW })
  })

  it('takes an item and puts it back with a second tap', async () => {
    const entryId = await addToList(await createItem('חלב', NOW), NOW)

    await toggleTaken(entryId, NOW + 1)
    expect((await allRecords()).entries[0]).toMatchObject({ state: 'taken', takenAt: NOW + 1 })

    await toggleTaken(entryId, NOW + 2)
    const [putBack] = (await allRecords()).entries

    expect(putBack.state).toBe('waiting')
    expect(putBack.takenAt).toBeUndefined()
  })

  it('puts "לא היה" back when an item the shop did not have is taken and then taken back', async () => {
    const entryId = await addToList(await createItem('טחינה', NOW), NOW)

    await toggleMissing(entryId)
    await toggleTaken(entryId, NOW + 1)
    expect((await allRecords()).entries[0]).toMatchObject({ state: 'taken', takenAt: NOW + 1 })

    await toggleTaken(entryId, NOW + 2)
    const [putBack] = (await allRecords()).entries

    expect(putBack.state).toBe('missing')
    expect(putBack.takenAt).toBeUndefined()
  })

  it('leaves a row moved to another item waiting when its tick is taken back, since the miss was the old item\'s', async () => {
    const entryId = await addToList(await createItem('חלב תנובה', NOW), NOW)

    await toggleMissing(entryId)
    await toggleTaken(entryId, NOW + 1)
    await pointEntryAt(entryId, 'חלב טרה', NOW + 2)
    await toggleTaken(entryId, NOW + 3)

    expect((await allRecords()).entries[0].state).toBe('waiting')
  })

  it('marks an item the shop did not have, and takes the mark back', async () => {
    const entryId = await addToList(await createItem('טחינה', NOW), NOW)

    await toggleMissing(entryId)
    expect((await allRecords()).entries[0].state).toBe('missing')

    await toggleMissing(entryId)
    expect((await allRecords()).entries[0].state).toBe('waiting')
  })

  it('changes an entry amount and price, and removes an entry', async () => {
    const entryId = await addToList(await createItem('מלפפונים', NOW), NOW)

    await updateEntry(entryId, { amount: amount(1.5, 'kilogram'), price: 6.9 })
    expect((await allRecords()).entries[0]).toMatchObject({ amount: amount(1.5, 'kilogram'), price: 6.9 })

    await removeEntry(entryId)
    expect((await allRecords()).entries).toEqual([])
  })

  it('puts a removed row back as it was, unless its item is on the list again', async () => {
    const milk = await createItem('חלב', NOW)
    const entryId = await addToList(milk, NOW)

    await updateEntry(entryId, { amount: amount(3), price: 7.5 })

    const [removed] = (await allRecords()).entries

    await removeEntry(entryId)
    expect(await putBackEntry(removed)).toBe(entryId)
    expect((await allRecords()).entries).toEqual([removed])

    await removeEntry(entryId)
    const relistedId = await addToList(milk, NOW + 1)

    expect(await putBackEntry(removed)).toBe(relistedId)
    expect((await allRecords()).entries.map(({ id }) => id)).toEqual([relistedId])
  })

  it('refuses to put back a row whose item was deleted meanwhile', async () => {
    const milk = await createItem('חלב', NOW)
    const entryId = await addToList(milk, NOW)
    const [removed] = (await allRecords()).entries

    await removeEntry(entryId)
    await deleteItem(milk)

    await expect(putBackEntry(removed)).rejects.toThrow()
    expect((await allRecords()).entries).toEqual([])
  })

  it('keeps a pack with how many are in it, and refuses part of a pack or a pack of fewer than 2 or more than 99', async () => {
    const entryId = await addToList(await createItem('סבון מוצק', NOW), NOW)

    await updateEntry(entryId, { amount: packOf(1, 4) })
    expect((await allRecords()).entries[0].amount).toEqual(packOf(1, 4))

    await expect(updateEntry(entryId, { amount: packOf(1, 1) })).rejects.toThrow()
    await expect(updateEntry(entryId, { amount: packOf(1, 100) })).rejects.toThrow()
    await expect(updateEntry(entryId, { amount: packOf(1, 2.5) })).rejects.toThrow()
    await expect(updateEntry(entryId, { amount: packOf(1.5, 4) })).rejects.toThrow()
  })
})

describe('pointing a row at another item', () => {
  it('moves the row to a new item with the typed name, keeping its amount, price and state, and leaves the old item', async () => {
    const milk = await createItem('חלב', NOW)
    const entryId = await addToList(milk, NOW)

    await toggleMissing(entryId)
    await finishShopping({ receipts: [] }, NOW + 1)
    await updateEntry(entryId, { amount: amount(2, 'liter'), price: 7.5 })
    await toggleTaken(entryId, NOW + 3)

    expect(await pointEntryAt(entryId, '  חלב 3% ', NOW + 4)).toBe('pointed')

    const { items, entries } = await allRecords()
    const newMilk = items.find((found) => found.name === 'חלב 3%')

    expect(items.map((found) => found.name).sort()).toEqual(['חלב', 'חלב 3%'])
    expect(entries).toEqual([
      {
        id: entryId,
        itemId: newMilk?.id,
        amount: amount(2, 'liter'),
        price: 7.5,
        state: 'taken',
        takenAt: NOW + 3,
        addedAt: NOW,
      },
    ])
  })

  it('moves the row to the item that already has the typed name', async () => {
    const milk = await createItem('חלב', NOW)
    const oatMilk = await createItem('חלב שיבולת', NOW)
    const entryId = await addToList(milk, NOW)

    expect(await pointEntryAt(entryId, 'חלב שיבולת', NOW + 1)).toBe('pointed')

    const { items, entries } = await allRecords()

    expect(items).toHaveLength(2)
    expect(entries[0].itemId).toBe(oatMilk)
  })

  it('changes nothing when the typed name is the row’s own item', async () => {
    const milk = await createItem('חלב', NOW)
    const entryId = await addToList(milk, NOW)

    expect(await pointEntryAt(entryId, ' חלב ', NOW + 1)).toBe('unchanged')
    expect((await allRecords()).entries[0].itemId).toBe(milk)
  })

  it('changes nothing when the item with the typed name is already on the list', async () => {
    const milk = await createItem('חלב', NOW)
    const eggs = await createItem('ביצים', NOW)
    const entryId = await addToList(milk, NOW)

    await addToList(eggs, NOW + 1)

    expect(await pointEntryAt(entryId, 'ביצים', NOW + 2)).toBe('alreadyListed')

    const { entries } = await allRecords()

    expect(entries).toHaveLength(2)
    expect(entries.find((found) => found.id === entryId)?.itemId).toBe(milk)
  })
})
