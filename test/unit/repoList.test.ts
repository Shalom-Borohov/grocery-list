import { beforeEach, describe, expect, it } from 'vitest'
import { allRecords } from '../../src/data/recordsContext'
import { createItem } from '../../src/data/itemsRepo'
import {
  addToList,
  pointEntryAt,
  removeEntry,
  toggleMissing,
  toggleTaken,
  updateEntry,
} from '../../src/data/listRepo'
import { finishShopping, startTrip } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { amount } from '../helpers/records'

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
})

describe('pointing a row at another item', () => {
  it('moves the row to a new item with the typed name, keeping its amount, price and state, and leaves the old item', async () => {
    const milk = await createItem('חלב', NOW)
    const entryId = await addToList(milk, NOW)

    await startTrip(NOW)
    await toggleMissing(entryId)
    await finishShopping({ receipts: [] }, NOW + 1)
    await startTrip(NOW + 2)
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
