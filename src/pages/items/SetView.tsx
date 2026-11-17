import { useId, useState } from 'react'
import { LabelRow } from '../../components/LabelRow'
import { useAction } from '../../components/useAction'
import { updateSet } from '../../data/setsRepo'
import { setItemsInOrder } from '../../domain/setEntries'
import type { Item, SavedSet, SetEntry } from '../../domain/types'
import { ITEMS_COPY } from './copy'
import { DeleteSetButton } from './DeleteSetButton'
import { SetEntrySheet } from './SetEntrySheet'
import { SetItemsSheet } from './SetItemsSheet'

type SetViewProps = {
  savedSet: SavedSet
  items: Item[]
}

export function SetView({ savedSet, items }: SetViewProps) {
  const headingId = useId()
  const [openItemId, setOpenItemId] = useState<string>()
  const [isPickerOpen, setPickerOpen] = useState(false)
  const run = useAction()
  const rows = setItemsInOrder(savedSet, items)
  const changeEntries = (entries: SetEntry[]) => run(() => updateSet(savedSet.id, { entries }))

  return (
    <div className="set-page">
      <h1 id={headingId} className="page-title" dir="auto">
        {savedSet.name}
      </h1>
      <ul className="label-list set-rows" aria-labelledby={headingId}>
        {rows.map(({ item, setEntry }) => (
          <li key={item.id}>
            <LabelRow name={item.name} amount={setEntry.amount} onTap={() => setOpenItemId(item.id)} />
          </li>
        ))}
      </ul>
      <div className="set-actions">
        <button type="button" className="quiet-button" onClick={() => setPickerOpen(true)}>
          {ITEMS_COPY.addItems}
        </button>
        <DeleteSetButton savedSet={savedSet} />
      </div>
      <SetEntrySheet
        row={rows.find(({ item }) => item.id === openItemId)}
        entries={savedSet.entries}
        onChange={changeEntries}
        onClose={() => setOpenItemId(undefined)}
      />
      <SetItemsSheet
        isOpen={isPickerOpen}
        items={items}
        entries={savedSet.entries}
        onChange={changeEntries}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  )
}
