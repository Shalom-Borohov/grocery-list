import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react'
import { useRef } from 'react'
import { LabelRow } from '../../components/LabelRow'
import { SecondaryText } from '../../components/SecondaryText'
import { TickRing } from '../../components/TickRing'
import { useAction } from '../../components/useAction'
import { removeEntry, toggleMissing, toggleTaken } from '../../data/listRepo'
import { secondaryLine } from '../../domain/secondaryLine'
import type { ListEntry } from '../../domain/types'
import { LIST_COPY } from './copy'
import { EntryPhotoButton } from './EntryPhotoButton'
import type { ListRow } from './listRows'

type EntryRowProps = {
  row: ListRow
  onOpenSheet: () => void
}

type SwipeAction = { label: string; color: string; act: () => Promise<unknown> }

function swipeActionsFor(entry: ListEntry): SwipeAction[] {
  if (entry.state === 'taken') {
    return []
  }

  const missingToggle: SwipeAction = {
    label: LIST_COPY.missingToggle(entry.state === 'missing'),
    color: 'medium',
    act: () => toggleMissing(entry.id),
  }

  return [missingToggle, { label: LIST_COPY.remove, color: 'danger', act: () => removeEntry(entry.id) }]
}

export function EntryRow({ row: { entry, item }, onOpenSheet }: EntryRowProps) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)
  const run = useAction()
  const line = secondaryLine(item, entry)
  const isTaken = entry.state === 'taken'
  const swipeActions = swipeActionsFor(entry)
  const canSwipe = swipeActions.length > 0

  function swipe(action: SwipeAction) {
    void sliding.current?.close()
    run(action.act)
  }

  return (
    <IonItemSliding ref={sliding} className="entry-sliding" disabled={!canSwipe}>
      <IonItem lines="none" className="entry-item">
        <LabelRow
          name={item.name}
          amount={entry.amount}
          secondary={line && <SecondaryText line={line} />}
          isTaken={isTaken}
          trailing={<TickRing isTicked={isTaken} />}
          end={<EntryPhotoButton photoId={item.photoId} label={LIST_COPY.rowPhoto(item.name)} onTap={onOpenSheet} />}
          pressed={isTaken}
          columnLabel={LIST_COPY.rowDetails(item.name)}
          onColumnTap={onOpenSheet}
          onTap={() => run(() => toggleTaken(entry.id, Date.now()))}
        />
      </IonItem>
      {canSwipe && (
        <IonItemOptions side="end">
          {swipeActions.map((action) => (
            <IonItemOption key={action.label} color={action.color} onClick={() => swipe(action)}>
              {action.label}
            </IonItemOption>
          ))}
        </IonItemOptions>
      )}
    </IonItemSliding>
  )
}
