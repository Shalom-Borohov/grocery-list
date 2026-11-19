import { IonContent, IonModal, useIonRouter } from '@ionic/react'
import { AddableNote } from '../../components/AddableNote'
import { AmountField } from '../../components/AmountField'
import { PhotoSection } from '../../components/PhotoSection'
import { PriceField } from '../../components/PriceField'
import { SheetHeader } from '../../components/SheetHeader'
import { useAction } from '../../components/useAction'
import { VerdictSwitch } from '../../components/VerdictSwitch'
import { COMMON_COPY } from '../../copy/common'
import { updateItem } from '../../data/itemsRepo'
import { removeEntry, toggleMissing, updateEntry } from '../../data/listRepo'
import { lastPrice } from '../../domain/itemHistory'
import type { Trip } from '../../domain/types'
import { itemPath } from '../../navigation/paths'
import { LIST_COPY } from './copy'
import type { ListRow } from './listRows'
import { useEditRowName } from './useEditRowName'

type RowSheetProps = {
  row: ListRow | undefined
  trips: Trip[]
  onClose: () => void
}

type RowSheetContentProps = Omit<RowSheetProps, 'row'> & { row: ListRow }

function RowSheetContent({ row: { entry, item }, trips, onClose }: RowSheetContentProps) {
  const router = useIonRouter()
  const run = useAction()
  const editName = useEditRowName()

  function goToItem() {
    onClose()
    router.push(itemPath('list', item.id))
  }

  return (
    <>
      <SheetHeader title={item.name} end={{ text: COMMON_COPY.close, onTap: onClose }} />
      <IonContent>
        <div className="sheet-body">
          <AmountField
            label={COMMON_COPY.amount}
            amount={entry.amount}
            onChange={(amount) => run(() => updateEntry(entry.id, { amount }))}
          />
          <PriceField
            label={COMMON_COPY.price}
            price={entry.price}
            hint={lastPrice(item.id, trips)}
            onChange={(price) => run(() => updateEntry(entry.id, { price }))}
          />
          <section className="list-verdict">
            <span className="field-label" aria-hidden="true">
              {COMMON_COPY.nextTime}
            </span>
            <VerdictSwitch item={item} label={COMMON_COPY.nextTime} />
          </section>
          <AddableNote
            key={item.id}
            note={item.note}
            addButtonClassName="list-add-note"
            onSave={(note) => run(() => updateItem(item.id, { note }))}
          />
          <PhotoSection item={item} />
          <div className="list-sheet-actions">
            <button type="button" className="quiet-button" onClick={() => editName({ entry, item })}>
              {LIST_COPY.editName}
            </button>
            <button type="button" className="quiet-button" onClick={() => run(() => toggleMissing(entry.id))}>
              {LIST_COPY.missingToggle(entry.state === 'missing')}
            </button>
            <button type="button" className="quiet-button" onClick={goToItem}>
              {COMMON_COPY.itemPage}
            </button>
            <button type="button" className="danger-button" onClick={() => run(() => removeEntry(entry.id), onClose)}>
              {LIST_COPY.removeFromList}
            </button>
          </div>
        </div>
      </IonContent>
    </>
  )
}

const CLOSED_BREAKPOINT = 0

const SHEET_HEIGHT = 0.9

const SHEET_BREAKPOINTS = [CLOSED_BREAKPOINT, SHEET_HEIGHT]

export function RowSheet({ row, ...rest }: RowSheetProps) {
  return (
    <IonModal
      isOpen={row !== undefined}
      breakpoints={SHEET_BREAKPOINTS}
      initialBreakpoint={SHEET_HEIGHT}
      expandToScroll={false}
      onDidDismiss={rest.onClose}
    >
      {row && <RowSheetContent row={row} {...rest} />}
    </IonModal>
  )
}
