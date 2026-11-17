import { useState } from 'react'
import { NoteField } from '../../components/NoteField'
import { PriceField } from '../../components/PriceField'
import { useAction } from '../../components/useAction'
import { COMMON_COPY } from '../../copy/common'
import { type TripChanges, updateTrip } from '../../data/tripsRepo'
import type { Trip } from '../../domain/types'

export function TripFields({ trip }: { trip: Trip }) {
  const run = useAction()
  const [isNoteOpen, setNoteOpen] = useState(trip.note !== undefined)
  const save = (changes: TripChanges) => run(() => updateTrip(trip.id, changes))

  function saveNote(typed: string) {
    const note = typed.trim() || undefined

    if (note !== trip.note) {
      save({ note })
    }
  }

  return (
    <div className="panel trip-fields">
      <PriceField label={COMMON_COPY.total} price={trip.total} onChange={(total) => save({ total })} />
      {isNoteOpen ? (
        <NoteField
          label={COMMON_COPY.note}
          defaultValue={trip.note}
          autoFocus={trip.note === undefined}
          onChange={(event) => saveNote(event.target.value)}
        />
      ) : (
        <button type="button" className="quiet-button trip-add-note" onClick={() => setNoteOpen(true)}>
          {COMMON_COPY.addNote}
        </button>
      )}
    </div>
  )
}
