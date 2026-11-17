import { useIonRouter } from '@ionic/react'
import { useConfirmDelete } from '../../components/useConfirmDelete'
import { deleteTrip } from '../../data/tripsRepo'
import { setEntriesFromTrip } from '../../domain/setEntries'
import type { Item, Trip } from '../../domain/types'
import { TRIPS_PATH } from '../../navigation/paths'
import { TRIPS_COPY } from './copy'
import { useSaveAsSet } from './useSaveAsSet'

export function TripActions({ trip, items }: { trip: Trip; items: Item[] }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const saveAsSet = useSaveAsSet()
  const setEntries = setEntriesFromTrip(trip, items)

  function leavePage() {
    if (router.canGoBack()) {
      router.goBack()

      return
    }

    router.push(TRIPS_PATH, 'back', 'replace')
  }

  const askToDelete = () =>
    confirmDelete({
      header: TRIPS_COPY.deleteTripQuestion,
      message: TRIPS_COPY.deleteTripWarning,
      remove: () => deleteTrip(trip.id),
      onDeleted: leavePage,
    })

  return (
    <div className="trip-actions">
      {setEntries.length > 0 && (
        <button type="button" className="outline-button" onClick={() => saveAsSet(setEntries)}>
          {TRIPS_COPY.saveAsSet}
        </button>
      )}
      <button type="button" className="danger-button" onClick={askToDelete}>
        {TRIPS_COPY.deleteTrip}
      </button>
    </div>
  )
}
