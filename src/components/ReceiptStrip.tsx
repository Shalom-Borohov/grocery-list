import { COMMON_COPY } from '../copy/common'
import { unsavedPhotoUrl } from '../data/photoUrls'
import type { ShrunkPhoto } from '../domain/types'
import { RemoveIcon } from './icons'
import { ItemThumbnail } from './ItemThumbnail'
import { PhotoInputs } from './PhotoInputs'
import './ReceiptStrip.css'

type Receipt = string | ShrunkPhoto

type ReceiptStripProps<Shown extends Receipt> = {
  receipts: readonly Shown[]
  removeLabel: (number: number) => string
  onRemove: (receipt: Shown) => void
  onOpen?: (receipt: Shown, name: string) => void
  onPick: (file: File) => void
}

type ReceiptImageProps = {
  receipt: Receipt
  alt: string
}

const FIRST_NUMBER = 1

function ReceiptImage({ receipt, alt }: ReceiptImageProps) {
  return typeof receipt === 'string' ? (
    <ItemThumbnail photoId={receipt} alt={alt} className="receipt-image" />
  ) : (
    <img className="receipt-image" src={unsavedPhotoUrl(receipt.thumbnail)} alt={alt} />
  )
}

export function ReceiptStrip<Shown extends Receipt>(props: ReceiptStripProps<Shown>) {
  const { receipts, removeLabel, onRemove, onOpen, onPick } = props

  return (
    <div className="receipt-strip">
      {receipts.length > 0 && (
        <ul className="receipt-thumbnails">
          {receipts.map((receipt, index) => {
            const number = index + FIRST_NUMBER
            const name = COMMON_COPY.receiptNumber(number)

            return (
              <li key={typeof receipt === 'string' ? receipt : index} className="receipt">
                {onOpen ? (
                  <button type="button" className="receipt-open" aria-label={name} onClick={() => onOpen(receipt, name)}>
                    <ReceiptImage receipt={receipt} alt="" />
                  </button>
                ) : (
                  <ReceiptImage receipt={receipt} alt={name} />
                )}
                <button type="button" className="receipt-remove" aria-label={removeLabel(number)} onClick={() => onRemove(receipt)}>
                  <RemoveIcon />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <PhotoInputs cameraLabel={COMMON_COPY.takeReceipt} libraryLabel={COMMON_COPY.choosePhoto} onPick={onPick} />
    </div>
  )
}
