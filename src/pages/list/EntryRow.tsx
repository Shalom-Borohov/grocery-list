import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react'
import { useRef } from 'react'
import { LabelRow } from '../../components/LabelRow'
import { SecondaryText } from '../../components/SecondaryText'
import { TickRing } from '../../components/TickRing'
import { useAction } from '../../components/useAction'
import { COMMON_COPY } from '../../copy/common'
import { removeEntry, toggleMissing, toggleTaken } from '../../data/listRepo'
import { secondaryLine } from '../../domain/secondaryLine'
import type { ListEntry } from '../../domain/types'
import { LIST_COPY } from './copy'
import type { ListRow } from './listRows'

type EntryRowProps = {
  row: ListRow
  isShopping: boolean
  onOpenSheet: () => void
}

type SwipeAction = { label: string; color: string; act: () => Promise<unknown> }

function swipeActionFor(entry: ListEntry, isShopping: boolean): SwipeAction | undefined {
  if (!isShopping) {
    return { label: LIST_COPY.remove, color: 'danger', act: () => removeEntry(entry.id) }
  }

  if (entry.state === 'taken') {
    return undefined
  }

  return entry.state === 'missing'
    ? { label: LIST_COPY.wasThere, color: 'medium', act: () => toggleMissing(entry.id) }
    : { label: COMMON_COPY.missing, color: 'danger', act: () => toggleMissing(entry.id) }
}

export function EntryRow({ row: { entry, item }, isShopping, onOpenSheet }: EntryRowProps) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)
  const run = useAction()
  const line = secondaryLine(item, entry)
  const isTaken = isShopping && entry.state === 'taken'
  const swipeAction = swipeActionFor(entry, isShopping)

  function swipe(action: SwipeAction) {
    void sliding.current?.close()
    run(action.act)
  }

  return (
    <IonItemSliding ref={sliding} className="entry-sliding" disabled={!swipeAction}>
      <IonItem lines="none" className="entry-item">
        <LabelRow
          name={item.name}
          amount={entry.amount}
          secondary={line && <SecondaryText line={line} />}
          photoId={item.photoId}
          isTaken={isTaken}
          trailing={isShopping && <TickRing isTicked={isTaken} />}
          pressed={isShopping ? isTaken : undefined}
          columnLabel={LIST_COPY.rowDetails(item.name)}
          onColumnTap={onOpenSheet}
          onTap={isShopping ? () => run(() => toggleTaken(entry.id, Date.now())) : onOpenSheet}
        />
      </IonItem>
      {swipeAction && (
        <IonItemOptions side="end">
          <IonItemOption color={swipeAction.color} onClick={() => swipe(swipeAction)}>
            {swipeAction.label}
          </IonItemOption>
        </IonItemOptions>
      )}
    </IonItemSliding>
  )
}
