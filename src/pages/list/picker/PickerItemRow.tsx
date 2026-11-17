import { LabelRow } from '../../../components/LabelRow'
import { SecondaryText } from '../../../components/SecondaryText'
import { TickRing } from '../../../components/TickRing'
import { amountForNewEntry } from '../../../domain/amount'
import { secondaryLine } from '../../../domain/secondaryLine'
import type { Item, ListEntry } from '../../../domain/types'

type ToggleItem =(item: Item, onList: ListEntry | undefined) => void

export type PickerRowsProps = {
  entryByItem: Map<string, ListEntry>
  onToggle: ToggleItem
}

export function PickerItemRow({ item, entryByItem, onToggle }: PickerRowsProps & { item: Item }) {
  const onList = entryByItem.get(item.id)
  const isAdded = onList !== undefined
  const line = secondaryLine(item, onList)

  return (
    <li>
      <LabelRow
        name={item.name}
        amount={onList?.amount ?? amountForNewEntry(item)}
        secondary={line && <SecondaryText line={line} />}
        photoId={item.photoId}
        isTaken={onList?.state === 'taken'}
        pressed={isAdded}
        trailing={<TickRing isTicked={isAdded} />}
        onTap={() => onToggle(item, onList)}
      />
    </li>
  )
}
