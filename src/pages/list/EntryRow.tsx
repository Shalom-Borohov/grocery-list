import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react'
import { useRef } from 'react'
import { LabelRow } from '../../components/LabelRow'
import { SecondaryText } from '../../components/SecondaryText'
import { useAction } from '../../components/useAction'
import { removeEntry, toggleMissing, toggleTaken } from '../../data/listRepo'
import { COMMON_COPY } from '../../copy/common'
import { type SecondaryLine, secondaryLine } from '../../domain/secondaryLine'
import type { ListEntry } from '../../domain/types'
import { LIST_COPY } from './copy'
import { EntryPhotoButton } from './EntryPhotoButton'
import { EntryTickButton } from './EntryTickButton'
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

type EntrySecondaryProps = {
  price: number | undefined
  line: SecondaryLine | undefined
}

function EntrySecondary({ price, line }: EntrySecondaryProps) {
  return (
    <>
      {price !== undefined && <span className="entry-price num">{COMMON_COPY.shekels(price)}</span>}
      {price !== undefined && line && COMMON_COPY.separator}
      {line && <SecondaryText line={line} />}
    </>
  )
}

const shownPrice = (entry: ListEntry) => (entry.state === 'missing' ? undefined : entry.price)

export function EntryRow({ row: { entry, item }, onOpenSheet }: EntryRowProps) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)
  const run = useAction()
  const line = secondaryLine(item, entry)
  const price = shownPrice(entry)
  const hasSecondary = price !== undefined || line !== undefined
  const isTaken = entry.state === 'taken'
  const swipeActions = swipeActionsFor(entry)
  const canSwipe = swipeActions.length > 0

  function swipe(action: SwipeAction) {
    void sliding.current?.close()
    run(action.act)
  }

  const end = (
    <>
      <EntryTickButton
        isTaken={isTaken}
        label={LIST_COPY.rowTick(item.name)}
        onTap={() => run(() => toggleTaken(entry.id, Date.now()))}
      />
      <EntryPhotoButton photoId={item.photoId} label={LIST_COPY.rowPhoto(item.name)} onTap={onOpenSheet} />
    </>
  )

  return (
    <IonItemSliding ref={sliding} className="entry-sliding" disabled={!canSwipe}>
      <IonItem lines="none" className="entry-item">
        <LabelRow
          name={item.name}
          amount={entry.amount}
          secondary={hasSecondary && <EntrySecondary price={price} line={line} />}
          isTaken={isTaken}
          end={end}
          columnLabel={LIST_COPY.rowDetails(item.name)}
          onColumnTap={onOpenSheet}
          onTap={onOpenSheet}
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
