import { IonContent, IonModal } from '@ionic/react'
import { useState } from 'react'
import { NoteField } from '../../components/NoteField'
import { PriceField } from '../../components/PriceField'
import { SheetHeader } from '../../components/SheetHeader'
import { useAction } from '../../components/useAction'
import { useMessageToast } from '../../components/useMessageToast'
import { COMMON_COPY } from '../../copy/common'
import { finishShopping } from '../../data/tripsRepo'
import type { EntryState, ShrunkPhoto } from '../../domain/types'
import { LIST_COPY } from './copy'
import { ReceiptPhotos } from './ReceiptPhotos'

type FinishSheetProps = {
  isOpen: boolean
  counts: Record<EntryState, number>
  onClose: () => void
}

function FinishForm({ counts, onClose }: Omit<FinishSheetProps, 'isOpen'>) {
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
      <SheetHeader title={LIST_COPY.finishTitle} start={{ text: COMMON_COPY.cancel, onTap: onClose }} />
      <IonContent>
        <div className="sheet-body">
          <p className="finish-counts">{LIST_COPY.finishCounts(counts.taken, counts.missing)}</p>
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
