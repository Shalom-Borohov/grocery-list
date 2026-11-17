import { ReceiptStrip } from '../../components/ReceiptStrip'
import { usePhotoPick } from '../../components/usePhotoPick'
import type { ShrunkPhoto } from '../../domain/types'
import { LIST_COPY } from './copy'

type ReceiptPhotosProps = {
  receipts: ShrunkPhoto[]
  onAdd: (receipt: ShrunkPhoto) => void
  onRemove: (receipt: ShrunkPhoto) => void
}

export function ReceiptPhotos({ receipts, onAdd, onRemove }: ReceiptPhotosProps) {
  const pick = usePhotoPick(onAdd)

  return <ReceiptStrip receipts={receipts} removeLabel={LIST_COPY.removeReceipt} onRemove={onRemove} onPick={pick} />
}
