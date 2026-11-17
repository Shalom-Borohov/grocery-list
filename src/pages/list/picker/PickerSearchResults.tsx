import { PlusIcon } from '../../../components/icons'
import { LabelRow } from '../../../components/LabelRow'
import { findItemByName } from '../../../domain/itemNames'
import { pickerItems } from '../../../domain/pickerOrder'
import type { Records } from '../../../domain/types'
import { PICKER_COPY } from './copy'
import { PickerItemRow, type PickerRowsProps } from './PickerItemRow'

type PickerSearchResultsProps = PickerRowsProps & {
  records: Records
  timesTaken: Map<string, number>
  query: string
  onCreate: (name: string) => void
}

export function PickerSearchResults({ records, timesTaken, query, onCreate, ...rowsProps }: PickerSearchResultsProps) {
  const typedName = query.trim()
  const isNewName = !findItemByName(records.items, typedName)

  return (
    <ul className="label-list picker-results">
      {isNewName && (
        <li>
          <LabelRow
            name={PICKER_COPY.createItem(typedName)}
            column={
              <span className="round-button picker-plus">
                <PlusIcon />
              </span>
            }
            onTap={() => onCreate(typedName)}
          />
        </li>
      )}
      {pickerItems(records.items, timesTaken, typedName).map((item) => (
        <PickerItemRow key={item.id} item={item} {...rowsProps} />
      ))}
    </ul>
  )
}
