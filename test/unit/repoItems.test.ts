import { beforeEach, describe, expect, it } from 'vitest'
import { createItem, deleteItem, setItemPhoto, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { storedPhotoBytes } from '../../src/data/photosRepo'
import { allRecords } from '../../src/data/recordsContext'
import { createSetFromEntries, deleteSet, pourSet, updateSet } from '../../src/data/setsRepo'
import { seedSet } from '../helpers/seed'
import { finishShopping } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { shrunkPhoto } from '../helpers/photo'
import { amount } from '../helpers/records'

const NOW = 1_700_000_000_000

const PHOTO = shrunkPhoto(new Uint8Array([7]).buffer, new Uint8Array([8]).buffer)

beforeEach(resetDb)

describe('editing an item', () => {
  it('keeps a note, a verdict and a usual amount, and can clear the verdict', async () => {
    const id = await createItem('עגבניות שרי', NOW)

    await updateItem(id, { note: ' רק מהאריזה הסגורה ', verdict: 'again', usualAmount: amount(2) })
    expect((await allRecords()).items[0]).toMatchObject({ note: 'רק מהאריזה הסגורה', verdict: 'again', usualAmount: amount(2) })

    await updateItem(id, { verdict: undefined })
    expect((await allRecords()).items[0].verdict).toBeUndefined()
  })

  it('renames an item, but not to the name of another item', async () => {
    const id = await createItem('ביצים', NOW)

    await createItem('חלב', NOW)
    await updateItem(id, { name: 'ביצים L' })
    expect((await allRecords()).items.find((candidate) => candidate.id === id)?.name).toBe('ביצים L')

    await expect(updateItem(id, { name: ' חלב ' })).rejects.toThrow()
  })

  it('replaces and removes the item photo', async () => {
    const id = await createItem('לחם', NOW)

    await setItemPhoto(id, PHOTO)
    const { photoId } = (await allRecords()).items[0]

    expect(photoId && (await storedPhotoBytes(photoId, 'photo'))).toEqual(PHOTO.photo)

    await setItemPhoto(id, undefined)
    expect((await allRecords()).items[0].photoId).toBeUndefined()
    expect(photoId && (await storedPhotoBytes(photoId, 'photo'))).toBeUndefined()
  })
})

describe('deleting an item', () => {
  it('takes it off the list, out of every set and deletes its photo, while finished trips keep its name', async () => {
    const milk = await createItem('חלב', NOW)
    const eggs = await createItem('ביצים', NOW)

    await setItemPhoto(milk, PHOTO)
    const { photoId } = (await allRecords()).items.find(({ id }) => id === milk) ?? {}

    await toggleTaken(await addToList(milk, NOW), NOW)
    await finishShopping({ receipts: [] }, NOW + 1)
    await addToList(milk, NOW + 2)
    await seedSet('בסיס', [milk, eggs], NOW)

    await deleteItem(milk)

    const { items, entries, sets, trips } = await allRecords()

    expect(items.map(({ id }) => id)).toEqual([eggs])
    expect(entries).toEqual([])
    expect(sets[0].entries.map(({ itemId }) => itemId)).toEqual([eggs])
    expect(trips[0].lines[0].name).toBe('חלב')
    expect(photoId && (await storedPhotoBytes(photoId, 'photo'))).toBeUndefined()
  })
})

describe('saved sets', () => {
  it('pours a set into the list, skipping what is already there', async () => {
    const milk = await createItem('חלב', NOW)
    const eggs = await createItem('ביצים', NOW)
    const setId = await seedSet('בסיס', [milk, eggs], NOW)

    await addToList(eggs, NOW)
    expect(await pourSet(setId, NOW + 1)).toEqual([milk])

    const { entries } = await allRecords()

    expect(entries.map(({ itemId }) => itemId).toSorted()).toEqual([milk, eggs].toSorted())
  })

  it('makes a set from given amounts in one step', async () => {
    const milk = await createItem('חלב', NOW)
    const setId = await createSetFromEntries('מהרשימה', [{ itemId: milk, amount: amount(3, 'liter') }], NOW)

    expect((await allRecords()).sets).toEqual([
      { id: setId, name: 'מהרשימה', entries: [{ itemId: milk, amount: amount(3, 'liter') }], createdAt: NOW },
    ])
  })

  it('renames a set, changes its items and deletes it', async () => {
    const milk = await createItem('חלב', NOW)
    const setId = await seedSet('בסיס', [], NOW)

    await updateSet(setId, { name: 'שישי', entries: [{ itemId: milk, amount: amount(2, 'liter') }] })
    expect((await allRecords()).sets[0]).toMatchObject({ name: 'שישי', entries: [{ itemId: milk, amount: amount(2, 'liter') }] })

    await deleteSet(setId)
    expect((await allRecords()).sets).toEqual([])
  })
})
