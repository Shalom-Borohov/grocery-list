import type { Amount, Item, ListEntry, SavedSet, Trip, TripLine } from '../../src/domain/types'

export const CREATED_AT = 1_700_000_000_000

export const ONE_UNIT: Amount = { quantity: 1, unit: 'unit' }

export const amount = (quantity: number, unit: Amount['unit'] = 'unit'): Amount => ({ quantity, unit })

export const item = (fields: Partial<Item> & Pick<Item, 'id' | 'name'>): Item => ({
  createdAt: CREATED_AT,
  ...fields,
})

export const entry = (fields: Partial<ListEntry> & Pick<ListEntry, 'id' | 'itemId'>): ListEntry => ({
  amount: ONE_UNIT,
  state: 'waiting',
  addedAt: CREATED_AT,
  ...fields,
})

export const line = (fields: Partial<TripLine> & Pick<TripLine, 'itemId' | 'name'>): TripLine => ({
  amount: ONE_UNIT,
  state: 'taken',
  ...fields,
})

export const trip = (fields: Partial<Trip> & Pick<Trip, 'id' | 'finishedAt'>): Trip => ({
  startedAt: fields.finishedAt,
  receiptPhotoIds: [],
  lines: [],
  ...fields,
})

export const savedSet = (fields: Partial<SavedSet> & Pick<SavedSet, 'id' | 'name'>): SavedSet => ({
  entries: [],
  createdAt: CREATED_AT,
  ...fields,
})
