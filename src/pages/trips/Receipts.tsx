import { useState } from 'react'
import { PhotoViewer, type ShownPhoto } from '../../components/PhotoViewer'
import { ReceiptStrip } from '../../components/ReceiptStrip'
import { useConfirmDelete } from '../../components/useConfirmDelete'
import { usePhotoPick } from '../../components/usePhotoPick'
import { addTripReceipt, removeTripReceipt } from '../../data/tripsRepo'
import type { Trip } from '../../domain/types'
import { TRIPS_COPY } from './copy'

export function Receipts({ trip }: { trip: Trip }) {
  const [shown, setShown] = useState<ShownPhoto>()
  const confirmDelete = useConfirmDelete()
  const addReceipt = usePhotoPick((receipt) => addTripReceipt(trip.id, receipt))

  const deleteReceipt = (photoId: string) =>
    confirmDelete({
      header: TRIPS_COPY.deleteReceiptQuestion,
      message: TRIPS_COPY.deleteReceiptWarning,
      remove: () => removeTripReceipt(trip.id, photoId),
    })

  return (
    <section className="trip-receipts">
      <h2 className="section-heading">{TRIPS_COPY.receipts}</h2>
      <ReceiptStrip
        receipts={trip.receiptPhotoIds}
        removeLabel={TRIPS_COPY.deleteReceipt}
        onRemove={deleteReceipt}
        onOpen={(photoId, name) => setShown({ photoId, title: name, alt: name })}
        onPick={addReceipt}
      />
      <PhotoViewer photo={shown} onClose={() => setShown(undefined)} />
    </section>
  )
}
