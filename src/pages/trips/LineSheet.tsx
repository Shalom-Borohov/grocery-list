import { IonContent, IonModal, useIonRouter } from '@ionic/react'
import { PriceField } from '../../components/PriceField'
import { SheetHeader } from '../../components/SheetHeader'
import { useAction } from '../../components/useAction'
import { VerdictSwitch } from '../../components/VerdictSwitch'
import { COMMON_COPY } from '../../copy/common'
import { updateTripLine } from '../../data/tripsRepo'
import type { Item } from '../../domain/types'
import { itemPath } from '../../navigation/paths'
import { TRIPS_COPY } from './copy'
import { type IndexedLine, lineName } from './indexedLines'

type LineSheetProps = {
  tripId: string
  line: IndexedLine | undefined
  onClose: () => void
}

type LineFormProps = {
  tripId: string
  line: IndexedLine
  onClose: () => void
}

const CLOSED_BREAKPOINT = 0

const SHEET_HEIGHT = 0.6

const SHEET_BREAKPOINTS = [CLOSED_BREAKPOINT, SHEET_HEIGHT]

function ItemChoices({ item, onClose }: { item: Item; onClose: () => void }) {
  const router = useIonRouter()

  function openItem() {
    onClose()
    router.push(itemPath('trips', item.id))
  }

  return (
    <>
      <VerdictSwitch item={item} label={TRIPS_COPY.verdict} />
      <button type="button" className="quiet-button line-item-link" onClick={openItem}>
        {COMMON_COPY.itemPage}
      </button>
    </>
  )
}

function LineForm({ tripId, line, onClose }: LineFormProps) {
  const run = useAction()
  const { tripLine, lineIndex, item } = line

  return (
    <>
      <SheetHeader title={lineName(line)} end={{ text: COMMON_COPY.done, onTap: onClose }} />
      <IonContent>
        <div className="sheet-body">
          {tripLine.state === 'taken' && (
            <PriceField
              label={COMMON_COPY.price}
              price={tripLine.price}
              onChange={(price) => run(() => updateTripLine(tripId, lineIndex, { price }))}
            />
          )}
          {item && <ItemChoices item={item} onClose={onClose} />}
        </div>
      </IonContent>
    </>
  )
}

export function LineSheet({ tripId, line, onClose }: LineSheetProps) {
  return (
    <IonModal
      isOpen={line !== undefined}
      breakpoints={SHEET_BREAKPOINTS}
      initialBreakpoint={SHEET_HEIGHT}
      onDidDismiss={onClose}
    >
      {line && <LineForm key={line.lineIndex} tripId={tripId} line={line} onClose={onClose} />}
    </IonModal>
  )
}
