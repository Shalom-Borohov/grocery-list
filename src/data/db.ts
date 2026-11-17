import Dexie, { type EntityTable } from 'dexie'
import type { ActiveTrip, Item, ListEntry, SavedSet, StoredPhoto, Trip } from '../domain/types'

const DB_NAME = 'grocery-list'

class GroceryListDb extends Dexie {
  declare items: EntityTable<Item, 'id'>
  declare listEntries: EntityTable<ListEntry, 'id'>
  declare trips: EntityTable<Trip, 'id'>
  declare sets: EntityTable<SavedSet, 'id'>
  declare settings: EntityTable<ActiveTrip, 'key'>
  declare photos: EntityTable<StoredPhoto, 'id'>
  declare thumbnails: EntityTable<StoredPhoto, 'id'>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      items: 'id',
      listEntries: 'id, itemId',
      trips: 'id, finishedAt',
      sets: 'id',
      settings: 'key',
      photos: 'id',
      thumbnails: 'id',
    })
  }
}

export const db = new GroceryListDb()

export const allTables = () => [db.items, db.listEntries, db.trips, db.sets, db.settings, db.photos, db.thumbnails]
