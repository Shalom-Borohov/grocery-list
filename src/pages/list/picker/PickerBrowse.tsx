import { COMMON_COPY } from '../../../copy/common'
import { itemsById } from '../../../domain/itemJoin'
import { pickerItems, usualInPicker } from '../../../domain/pickerOrder'
import type { Records } from '../../../domain/types'
import { PICKER_COPY } from './copy'
import { ItemSection } from './ItemSection'
import type { PickerRowsProps } from './PickerItemRow'
import { SetButtons } from './SetButtons'

type PickerBrowseProps = PickerRowsProps & {
  records: Records
  timesTaken: Map<string, number>
  usualIds: string[]
  listedAtOpening: ReadonlySet<string>
  onPour: (setId: string) => void
}

const NO_QUERY = ''

export function PickerBrowse(props: PickerBrowseProps) {
  const { records, timesTaken, usualIds, listedAtOpening, onPour, ...rowsProps } = props

  if (records.items.length === 0) {
    return <p className="empty-note">{PICKER_COPY.noItems}</p>
  }

  const byId = itemsById(records.items)

  const usualItems = usualInPicker(usualIds, listedAtOpening).flatMap((itemId) => {
    const usualItem = byId.get(itemId)

    return usualItem ? [usualItem] : []
  })

  return (
    <>
      {usualItems.length > 0 && <ItemSection heading={PICKER_COPY.usual} items={usualItems} {...rowsProps} />}
      {records.sets.length > 0 && <SetButtons sets={records.sets} onPour={onPour} />}
      <ItemSection heading={COMMON_COPY.allItems} items={pickerItems(records.items, timesTaken, NO_QUERY)} {...rowsProps} />
    </>
  )
}
