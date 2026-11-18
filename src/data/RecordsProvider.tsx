import { useLiveQuery } from 'dexie-react-hooks'
import { type ReactNode, useMemo } from 'react'
import { readEntries, readItems, readSets, readTrips, RecordsContext } from './recordsContext'

export function RecordsProvider({ children }: { children: ReactNode }) {
  const items = useLiveQuery(readItems)
  const entries = useLiveQuery(readEntries)
  const trips = useLiveQuery(readTrips)
  const sets = useLiveQuery(readSets)

  const records = useMemo(
    () => (items && entries && trips && sets ? { items, entries, trips, sets } : undefined),
    [items, entries, trips, sets],
  )

  return <RecordsContext value={records}>{children}</RecordsContext>
}
