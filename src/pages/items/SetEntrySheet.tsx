import { IonContent } from '@ionic/react'
import { AmountField } from '../../components/AmountField'
import { SheetHeader } from '../../components/SheetHeader'
import { SheetModal } from '../../components/SheetModal'
import { COMMON_COPY } from '../../copy/common'
import { type SetItem, withAmount, withoutItem } from '../../domain/setEntries'
import type { SetEntry } from '../../domain/types'
import { ITEMS_COPY } from './copy'

type SetEntrySheetProps = {
  row: SetItem | undefined
  entries: SetEntry[]
  onChange: (entries: SetEntry[]) => void
  onClose: () => void
}

export function SetEntrySheet({ row, entries, onChange, onClose }: SetEntrySheetProps) {
  function remove(itemId: string) {
    onChange(withoutItem(entries, itemId))
    onClose()
  }

  return (
    <SheetModal name={row?.item.name} isOpen={row !== undefined} onDidDismiss={onClose}>
      {row && (
        <>
          <SheetHeader title={row.item.name} end={{ text: COMMON_COPY.close, onTap: onClose }} />
          <IonContent>
            <div className="sheet-body">
              <AmountField
                label={COMMON_COPY.amount}
                amount={row.setEntry.amount}
                onChange={(amount) => onChange(withAmount(entries, row.item.id, amount))}
              />
              <button type="button" className="danger-button" onClick={() => remove(row.item.id)}>
                {ITEMS_COPY.removeFromSet}
              </button>
            </div>
          </IonContent>
        </>
      )}
    </SheetModal>
  )
}
