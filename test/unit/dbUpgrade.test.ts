import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { allRecords } from '../../src/data/recordsContext'
import { CREATED_AT, item } from '../helpers/records'

const SHOPPING_MODE_VERSION = 1

const SHOPPING_MODE_TABLES = {
  items: 'id',
  listEntries: 'id, itemId',
  trips: 'id, finishedAt',
  sets: 'id',
  settings: 'key',
  photos: 'id',
  thumbnails: 'id',
}

const MILK = item({ id: 'milk', name: 'חלב' })

beforeEach(async () => {
  db.close()
  await Dexie.delete(db.name)
})

describe('opening a database from before shopping mode went', () => {
  it('drops the settings table and keeps everything else', async () => {
    const shoppingModeDb = new Dexie(db.name)

    shoppingModeDb.version(SHOPPING_MODE_VERSION).stores(SHOPPING_MODE_TABLES)
    await shoppingModeDb.table('settings').put({ key: 'activeTrip', startedAt: CREATED_AT })
    await shoppingModeDb.table('items').put(MILK)
    shoppingModeDb.close()

    await db.open()

    expect(db.backendDB().objectStoreNames.contains('settings')).toBe(false)
    expect((await allRecords()).items).toEqual([MILK])
  })
})
