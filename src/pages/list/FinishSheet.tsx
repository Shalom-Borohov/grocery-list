import { IonContent, IonModal } from '@ionic/react'
import { useState } from 'react'
import { NoteField } from '../../components/NoteField'
import { PriceField } from '../../components/PriceField'
import { SheetHeader } from '../../components/SheetHeader'
import { useAction } from '../../components/useAction'
import { useMessageToast } from '../../components/useMessageToast'
import { COMMON_COPY } from '../../copy/common'
import { cancelShopping, finishShopping } from '../../data/tripsRepo'
import { filesATrip } from '../../domain/finishTrip'
import type { EntryState, ListEntry, ShrunkPhoto } from '../../domain/types'
import { LIST_COPY } from './copy'
import { ReceiptPhotos } from './ReceiptPhotos'

type FinishSheetProps = {
  isOpen: boolean
  entries: ListEntry[]
  counts: Record<EntryState, number>
  onClose: () => void
}

type FinishFormProps = Omit<FinishSheetProps, 'isOpen'>

function TripDetailsForm({ onClose }: Pick<FinishFormProps, 'onClose'>) {
  const [total, setTotal] = useState<number>()
  const [isTotalValid, setTotalValid] = useState(true)
  const [note, setNote] = useState('')
  const [receipts, setReceipts] = useState<ShrunkPhoto[]>([])
  const run = useAction()
  const toast = useMessageToast()

  function save() {
    run(
      () => finishShopping({ total, note, receipts }, Date.now()),
      () => {
        onClose()
        void toast(LIST_COPY.tripSaved)
      },
    )
  }

  return (
    <>
      <PriceField label={COMMON_COPY.total} price={total} onChange={setTotal} onValidityChange={setTotalValid} />
      <ReceiptPhotos
        receipts={receipts}
        onAdd={(receipt) => setReceipts((current) => [...current, receipt])}
        onRemove={(removed) => setReceipts((current) => current.filter((receipt) => receipt !== removed))}
      />
      <NoteField label={COMMON_COPY.note} value={note} onChange={(event) => setNote(event.target.value)} />
      <button type="button" className="primary-button" disabled={!isTotalValid} onClick={save}>
        {COMMON_COPY.save}
      </button>
    </>
  )
}

function FinishForm({ entries, counts, onClose }: FinishFormProps) {
  const run = useAction()

  return (
    <>
      <SheetHeader title={LIST_COPY.finishTitle} start={{ text: COMMON_COPY.cancel, onTap: onClose }} />
      <IonContent>
        <div className="sheet-body">
          {filesATrip(entries) ? (
            <>
              <p className="finish-counts">{LIST_COPY.finishCounts(counts.taken, counts.missing)}</p>
              <TripDetailsForm onClose={onClose} />
            </>
          ) : (
            <>
              <p className="finish-counts">{LIST_COPY.nothingToFile}</p>
              <button type="button" className="primary-button" onClick={() => run(cancelShopping, onClose)}>
                {LIST_COPY.leaveShopping}
              </button>
            </>
          )}
        </div>
      </IonContent>
    </>
  )
}

export function FinishSheet({ isOpen, ...rest }: FinishSheetProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={rest.onClose}>
      <FinishForm {...rest} />
    </IonModal>
  )
}
