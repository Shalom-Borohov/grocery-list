import { IonContent } from '@ionic/react'
import { useState } from 'react'
import { NoteField } from '../../components/NoteField'
import { PriceField } from '../../components/PriceField'
import { SheetHeader } from '../../components/SheetHeader'
import { SheetModal } from '../../components/SheetModal'
import { useAction } from '../../components/useAction'
import { useMessageToast } from '../../components/useMessageToast'
import { COMMON_COPY } from '../../copy/common'
import { finishShopping } from '../../data/tripsRepo'
import { takenTotal } from '../../domain/takenTotal'
import type { EntryState, ListEntry, ShrunkPhoto } from '../../domain/types'
import { LIST_COPY } from './copy'
import { ReceiptPhotos } from './ReceiptPhotos'

type FinishSheetProps = {
  isOpen: boolean
  counts: Record<EntryState, number>
  entries: ListEntry[]
  onClose: () => void
}

function FinishForm({ counts, entries, onClose }: Omit<FinishSheetProps, 'isOpen'>) {
  const [estimate] = useState(() => takenTotal(entries))
  const [total, setTotal] = useState(estimate.total)
  const [isTotalValid, setTotalValid] = useState(true)
  const [note, setNote] = useState('')
  const [receipts, setReceipts] = useState<ShrunkPhoto[]>([])
  const run = useAction()
  const toast = useMessageToast()
  const isPartialEstimate = estimate.total !== undefined && estimate.pricedCount < counts.taken
  const showsPricedShare = isPartialEstimate && isTotalValid && total === estimate.total

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
      <SheetHeader title={LIST_COPY.finishTitle} start={{ text: COMMON_COPY.cancel, onTap: onClose }} />
      <IonContent>
        <div className="sheet-body">
          <p className="finish-counts">{LIST_COPY.finishCounts(counts.taken, counts.missing)}</p>
          <PriceField
            label={COMMON_COPY.total}
            price={total}
            description={showsPricedShare ? LIST_COPY.pricedShare(estimate.pricedCount, counts.taken) : undefined}
            onChange={setTotal}
            onValidityChange={setTotalValid}
          />
          <ReceiptPhotos
            receipts={receipts}
            onAdd={(receipt) => setReceipts((current) => [...current, receipt])}
            onRemove={(removed) => setReceipts((current) => current.filter((receipt) => receipt !== removed))}
          />
          <NoteField label={COMMON_COPY.note} value={note} onChange={(event) => setNote(event.target.value)} />
          <button type="button" className="primary-button" disabled={!isTotalValid} onClick={save}>
            {COMMON_COPY.save}
          </button>
        </div>
      </IonContent>
    </>
  )
}

export function FinishSheet({ isOpen, ...rest }: FinishSheetProps) {
  return (
    <SheetModal name={LIST_COPY.finishTitle} isOpen={isOpen} onDidDismiss={rest.onClose}>
      <FinishForm {...rest} />
    </SheetModal>
  )
}
