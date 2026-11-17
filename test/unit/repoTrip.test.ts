import { beforeEach, describe, expect, it } from 'vitest'
import { createItem } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { deleteTrip, finishShopping, startTrip, updateTrip } from '../../src/data/tripsRepo'
import { storedPhotoBytes } from '../../src/data/photosRepo'
import { resetDb } from '../helpers/db'
import { amount } from '../helpers/records'
import { shrunkPhoto } from '../helpers/photo'

const NOW = 1_700_000_000_000

const RECEIPT = shrunkPhoto(new Uint8Array([1, 2]).buffer, new Uint8Array([3]).buffer)

beforeEach(resetDb)

async function listOf(...names: string[]) {
  const entryIds: string[] = []

  for (const name of names) {
    entryIds.push(await addToList(await createItem(name, NOW), NOW))
  }

  return entryIds
}

describe('a shopping trip', () => {
  it('starts shopping mode, and finishing files the trip and ends it', async () => {
    const [milk, tahini, coffee] = await listOf('חלב', 'טחינה', 'קפה')

    await startTrip(NOW)
    expect((await allRecords()).activeTrip).toEqual({ key: 'activeTrip', startedAt: NOW })

    await toggleTaken(milk, NOW + 1)
    await toggleMissing(tahini)
    await finishShopping({ total: 74.9, note: 'מהיר', receipts: [RECEIPT] }, NOW + 10)

    const { trips, entries, activeTrip } = await allRecords()

    expect(activeTrip).toBeUndefined()
    expect(trips).toHaveLength(1)
    expect(trips[0]).toMatchObject({ startedAt: NOW, finishedAt: NOW + 10, total: 74.9, note: 'מהיר' })
    expect(trips[0].lines.map(({ name, state }) => [name, state])).toEqual([
      ['חלב', 'taken'],
      ['טחינה', 'missing'],
    ])
    expect(entries.map(({ id, state, missedLastTrip }) => [id, state, missedLastTrip]).toSorted()).toEqual(
      [
        [tahini, 'waiting', true],
        [coffee, 'waiting', undefined],
      ].toSorted(),
    )
  })

  it('keeps the receipt photos of the trip', async () => {
    const [milk] = await listOf('חלב')

    await startTrip(NOW)
    await toggleTaken(milk, NOW)
    await finishShopping({ receipts: [RECEIPT] }, NOW + 1)

    const [receiptId] = (await allRecords()).trips[0].receiptPhotoIds

    expect(await storedPhotoBytes(receiptId, 'photo')).toEqual(RECEIPT.photo)
    expect(await storedPhotoBytes(receiptId, 'thumbnail')).toEqual(RECEIPT.thumbnail)
  })

  it('remembers the amount taken, so the item is added with it next time', async () => {
    const milkId = await createItem('חלב', NOW)
    const entryId = await addToList(milkId, NOW, amount(2, 'liter'))

    await startTrip(NOW)
    await toggleTaken(entryId, NOW)
    await finishShopping({ receipts: [] }, NOW + 1)
    await addToList(milkId, NOW + 2)

    expect((await allRecords()).entries[0].amount).toEqual(amount(2, 'liter'))
  })

  it('files nothing when nothing was taken or marked missing, and still ends shopping', async () => {
    await listOf('חלב')
    await startTrip(NOW)
    await finishShopping({ total: 10, receipts: [RECEIPT] }, NOW + 1)

    const { trips, entries, activeTrip } = await allRecords()

    expect(trips).toEqual([])
    expect(entries).toHaveLength(1)
    expect(activeTrip).toBeUndefined()
  })

  it('edits a finished trip and deletes it with its receipts', async () => {
    const [milk] = await listOf('חלב')

    await startTrip(NOW)
    await toggleTaken(milk, NOW)
    await finishShopping({ receipts: [RECEIPT] }, NOW + 1)

    const [filed] = (await allRecords()).trips

    await updateTrip(filed.id, { total: 12.5, note: 'עודכן' })
    expect((await allRecords()).trips[0]).toMatchObject({ total: 12.5, note: 'עודכן' })

    await deleteTrip(filed.id)
    expect((await allRecords()).trips).toEqual([])
    expect(await storedPhotoBytes(filed.receiptPhotoIds[0], 'photo')).toBeUndefined()
  })
})
