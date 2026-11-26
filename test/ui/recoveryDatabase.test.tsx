import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { EXPORT_BUTTON, LIST_HASH, openAppAt, sharedArchive, silenceRenderErrors } from '../helpers/recovery'
import { stubShare } from '../helpers/share'

const STORED_VERSION_OF_FIRST_SCHEMA = 10

const STORE_NAMES = ['listEntries', 'trips', 'sets', 'settings', 'photos', 'thumbnails']

const item = { id: 'item-1', name: 'חלב', createdAt: 1, photoId: 'photo-1' }

const itemWithoutName = { id: 'item-2', createdAt: 2 }

const entry = { id: 'entry-1', itemId: 'item-1', amount: { quantity: 1, unit: 'unit' }, state: 'waiting', addedAt: 3 }

const photo = { id: 'photo-1', bytes: new Uint8Array([255, 216, 9]).buffer }

const thumbnail = { id: 'photo-1', bytes: new Uint8Array([255, 216, 10]).buffer }

const notAPhoto = { id: 'photo-2', bytes: 'not bytes' }

const ITEM_ROWS = [item, itemWithoutName]

const ROWS: Partial<Record<string, object[]>> = {
  listEntries: [entry],
  photos: [photo, notAPhoto],
  thumbnails: [thumbnail],
}

function requestDone(request: IDBRequest | IDBOpenDBRequest) {
  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function storeWithItemsKeyedDifferently() {
  const request = indexedDB.open(db.name, STORED_VERSION_OF_FIRST_SCHEMA)

  request.onupgradeneeded = () => {
    const itemStore = request.result.createObjectStore('items', { autoIncrement: true })

    ITEM_ROWS.forEach((row) => itemStore.add(row))

    for (const storeName of STORE_NAMES) {
      const store = request.result.createObjectStore(storeName, { keyPath: 'id' })

      for (const row of ROWS[storeName] ?? []) {
        store.add(row)
      }
    }
  }

  await requestDone(request)
  request.result.close()
}

describe('a database the app cannot upgrade', () => {
  silenceRenderErrors()

  beforeEach(async () => {
    db.close()
    await requestDone(indexedDB.deleteDatabase(db.name))
    await storeWithItemsKeyedDifferently()
  })

  it('shows the recovery screen', async () => {
    expect(await openAppAt(LIST_HASH)).toBeVisible()
  })

  it('exports every stored row as it is, read straight from the phone', async () => {
    const share = stubShare()

    await openAppAt(LIST_HASH)
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    const { data, files } = await sharedArchive(share)

    expect(data.items).toEqual(ITEM_ROWS)
    expect(data.listEntries).toEqual([entry])
    expect(data.trips).toEqual([])
    expect(data.sets).toEqual([])
    expect([...files['photos/photo-1.jpg']]).toEqual([255, 216, 9])
    expect([...files['thumbnails/photo-1.jpg']]).toEqual([255, 216, 10])
    expect(files['photos/photo-2.jpg']).toBeUndefined()
  })

  it('leaves the database at the version on the phone', async () => {
    const share = stubShare()

    await openAppAt(LIST_HASH)
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))
    await sharedArchive(share)

    const request = indexedDB.open(db.name)

    await requestDone(request)
    expect(request.result.version).toBe(STORED_VERSION_OF_FIRST_SCHEMA)
    request.result.close()
  })
})
