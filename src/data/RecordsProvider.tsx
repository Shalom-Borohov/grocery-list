import { useLiveQuery } from 'dexie-react-hooks'
import { type ReactNode, useMemo } from 'react'
import { activeTripIn, readEntries, readItems, readSets, readSettings, readTrips, RecordsContext } from './recordsContext'

export function RecordsProvider({ children }: { children: ReactNode }) {
  const items = useLiveQuery(readItems)
  const entries = useLiveQuery(readEntries)
  const trips = useLiveQuery(readTrips)
  const sets = useLiveQuery(readSets)
  const settings = useLiveQuery(readSettings)

  const records = useMemo(
    () =>
      items && entries && trips && sets && settings
        ? { items, entries, trips, sets, activeTrip: activeTripIn(settings) }
        : undefined,
    [items, entries, trips, sets, settings],
  )

  return <RecordsContext value={records}>{children}</RecordsContext>
}
