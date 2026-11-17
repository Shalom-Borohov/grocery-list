import { useState } from 'react'
import type { Item, Trip } from '../../domain/types'
import { TRIPS_COPY } from './copy'
import { indexedLines } from './indexedLines'
import { LineSheet } from './LineSheet'
import { Receipts } from './Receipts'
import { TripActions } from './TripActions'
import { TripFields } from './TripFields'
import { TripLines } from './TripLines'

type TripViewProps = {
  trip: Trip
  items: Item[]
}

export function TripView({ trip, items }: TripViewProps) {
  const [openLineIndex, setOpenLineIndex] = useState<number>()
  const lines = indexedLines(trip, items)

  return (
    <div className="page-body trip-page">
      <header className="trip-heading">
        <h1 className="page-title">{TRIPS_COPY.tripDate(trip.finishedAt)}</h1>
        <p className="quiet-text trip-time">
          <span className="num">{TRIPS_COPY.timeSpan(trip.startedAt, trip.finishedAt)}</span>
        </p>
      </header>
      <TripFields trip={trip} />
      <Receipts trip={trip} />
      <h2 className="section-heading">{TRIPS_COPY.lines}</h2>
      <TripLines lines={lines} onOpen={setOpenLineIndex} />
      <TripActions trip={trip} items={items} />
      <LineSheet
        tripId={trip.id}
        line={lines.find(({ lineIndex }) => lineIndex === openLineIndex)}
        onClose={() => setOpenLineIndex(undefined)}
      />
    </div>
  )
}
