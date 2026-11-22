import { strToU8, zipSync } from 'fflate'
import { beforeEach, describe, expect, it } from 'vitest'
import { exportBackup, parseBackup, restoreBackup } from '../../src/data/backup'
import { createItem, setItemPhoto, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { storedPhotoBytes } from '../../src/data/photosRepo'
import { cachedPhotoUrl, storedPhotoUrl } from '../../src/data/photoUrls'
import { allRecords } from '../../src/data/recordsContext'
import { seedSet } from '../helpers/seed'
import { finishShopping } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { shrunkPhoto, stubObjectUrls } from '../helpers/photo'
import { amount, item, packOf } from '../helpers/records'

const NOW = new Date(2026, 10, 17, 10, 0).getTime()

const ITEM_PHOTO = shrunkPhoto(new Uint8Array([255, 216, 1]).buffer, new Uint8Array([255, 216, 2]).buffer)

const RECEIPT = shrunkPhoto(new Uint8Array([255, 216, 3]).buffer, new Uint8Array([255, 216, 4]).buffer)

const DATA_FILE = 'data.json'

const archiveOf = (data: object) => zipSync({ [DATA_FILE]: strToU8(JSON.stringify(data)) })

const exportedArchive = async () => new Uint8Array(await new Blob(await exportBackup(NOW)).arrayBuffer())

async function seed() {
  const tomatoes = await createItem('עגבניות שרי', NOW)
  const milk = await createItem('חלב', NOW)

  await updateItem(tomatoes, { note: 'רק מהאריזה הסגורה', verdict: 'again' })
  await setItemPhoto(tomatoes, ITEM_PHOTO)
  await toggleTaken(await addToList(tomatoes, NOW, amount(2)), NOW)
  await finishShopping({ total: 9.9, receipts: [RECEIPT] }, NOW + 1)
  await toggleTaken(await addToList(milk, NOW + 2), NOW + 3)
  await seedSet('בסיס', [tomatoes, milk], NOW)
}

async function snapshotWithPhotos() {
  const records = await allRecords()

  const photoIds = [
    ...records.items.flatMap(({ photoId }) => (photoId ? [photoId] : [])),
    ...records.trips.flatMap(({ receiptPhotoIds }) => receiptPhotoIds),
  ]

  const photos = await Promise.all(
    photoIds.map(async (photoId) => [await storedPhotoBytes(photoId, 'photo'), await storedPhotoBytes(photoId, 'thumbnail')]),
  )

  return { records, photos }
}

describe('backup', () => {
  beforeEach(resetDb)
  stubObjectUrls()

  it('survives a round trip through a zip: items, the list, trips, sets and every photo', async () => {
    await seed()
    const before = await snapshotWithPhotos()
    const archive = await exportedArchive()

    await resetDb()
    await restoreBackup(parseBackup(archive))

    expect(await snapshotWithPhotos()).toEqual(before)
  })

  it('keeps packs, with how many are in each, through a round trip', async () => {
    const soap = await createItem('סבון מוצק', NOW)

    await toggleTaken(await addToList(soap, NOW, packOf(2, 4)), NOW)
    await finishShopping({ receipts: [] }, NOW + 1)
    await addToList(soap, NOW + 2)
    await seedSet('ניקיון', [soap], NOW)
    const before = await allRecords()
    const archive = await exportedArchive()

    await resetDb()
    await restoreBackup(parseBackup(archive))

    const after = await allRecords()

    expect(after).toEqual(before)
    expect(after.entries[0].amount).toEqual(packOf(2, 4))
  })

  it('restores a backup made while the app still had shopping mode', async () => {
    const milk = item({ id: 'milk', name: 'חלב' })

    const shoppingModeBackup = {
      version: 1,
      exportedAt: NOW,
      items: [milk],
      listEntries: [],
      trips: [],
      sets: [],
      activeTrip: { key: 'activeTrip', startedAt: NOW },
    }

    await restoreBackup(parseBackup(archiveOf(shoppingModeBackup)))

    expect((await allRecords()).items).toEqual([milk])
  })

  it('replaces what is on the phone', async () => {
    await createItem('ישן', NOW)
    const archive = await exportedArchive()

    await createItem('חדש', NOW)
    await restoreBackup(parseBackup(archive))

    expect((await allRecords()).items.map(({ name }) => name)).toEqual(['ישן'])
  })

  it('lets go of the shown photos of what it replaces', async () => {
    const archive = await exportedArchive()

    await setItemPhoto(await createItem('חלב', NOW), ITEM_PHOTO)

    const photoIds = (await allRecords()).items.flatMap(({ photoId }) => (photoId ? [photoId] : []))

    photoIds.forEach((photoId) => storedPhotoUrl(photoId, 'thumbnail', ITEM_PHOTO.thumbnail))
    await restoreBackup(parseBackup(archive))

    expect(photoIds.map((photoId) => cachedPhotoUrl(photoId, 'thumbnail'))).toEqual([undefined])
  })

  it('rejects a file that is not a backup, leaving the phone untouched', async () => {
    await createItem('חלב', NOW)

    const notBackup = archiveOf({ version: 1, items: 'oops' })

    expect(() => parseBackup(notBackup)).toThrow()
    expect(() => parseBackup(new Uint8Array([1, 2, 3]))).toThrow()
    expect((await allRecords()).items.map(({ name }) => name)).toEqual(['חלב'])
  })
})
