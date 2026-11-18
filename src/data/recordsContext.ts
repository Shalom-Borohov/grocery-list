import { createContext } from 'react'
import type { Records } from '../domain/types'
import { db } from './db'

export const RecordsContext = createContext<Records | undefined>(undefined)

export const readItems = () => db.items.toArray()

export const readEntries = () => db.listEntries.toArray()

export const readTrips = () => db.trips.toArray()

export const readSets = () => db.sets.toArray()

export async function allRecords(): Promise<Records> {
  const [items, entries, trips, sets] = await Promise.all([readItems(), readEntries(), readTrips(), readSets()])

  return { items, entries, trips, sets }
}
