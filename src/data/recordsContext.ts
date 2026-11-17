import { createContext } from 'react'
import { ACTIVE_TRIP_KEY, type ActiveTrip, type Records } from '../domain/types'
import { db } from './db'

export const RecordsContext = createContext<Records | undefined>(undefined)

export const readItems = () => db.items.toArray()

export const readEntries = () => db.listEntries.toArray()

export const readTrips = () => db.trips.toArray()

export const readSets = () => db.sets.toArray()

export const readSettings = () => db.settings.toArray()

export const activeTripIn = (settings: ActiveTrip[]) => settings.find(({ key }) => key === ACTIVE_TRIP_KEY)

export async function allRecords(): Promise<Records> {
  const [items, entries, trips, sets, settings] = await Promise.all([
    readItems(),
    readEntries(),
    readTrips(),
    readSets(),
    readSettings(),
  ])

  return { items, entries, trips, sets, activeTrip: activeTripIn(settings) }
}
