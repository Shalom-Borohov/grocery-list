import { AddableNote } from '../../components/AddableNote'
import { PriceField } from '../../components/PriceField'
import { useAction } from '../../components/useAction'
import { COMMON_COPY } from '../../copy/common'
import { type TripChanges, updateTrip } from '../../data/tripsRepo'
import type { Trip } from '../../domain/types'

export function TripFields({ trip }: { trip: Trip }) {
  const run = useAction()
  const save = (changes: TripChanges) => run(() => updateTrip(trip.id, changes))

  return (
    <div className="panel trip-fields">
      <PriceField label={COMMON_COPY.total} price={trip.total} onChange={(total) => save({ total })} />
      <AddableNote note={trip.note} addButtonClassName="trip-add-note" onSave={(note) => save({ note })} />
    </div>
  )
}
