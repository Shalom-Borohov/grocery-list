import { IonContent } from '@ionic/react'
import { useState } from 'react'
import { LabelRow } from '../../components/LabelRow'
import { SearchField } from '../../components/SearchField'
import { SheetHeader } from '../../components/SheetHeader'
import { SheetModal } from '../../components/SheetModal'
import { TickRing } from '../../components/TickRing'
import { COMMON_COPY } from '../../copy/common'
import { byName, matchesSearch } from '../../domain/itemNames'
import { isInSet, withItemToggled } from '../../domain/setEntries'
import type { Item, SetEntry } from '../../domain/types'
import { ITEMS_COPY } from './copy'

type SetItemsSheetProps = {
  isOpen: boolean
  items: Item[]
  entries: SetEntry[]
  onChange: (entries: SetEntry[]) => void
  onClose: () => void
}

const EMPTY_QUERY = ''

export function SetItemsSheet({ isOpen, items, entries, onChange, onClose }: SetItemsSheetProps) {
  const [query, setQuery] = useState(EMPTY_QUERY)

  function closed() {
    setQuery(EMPTY_QUERY)
    onClose()
  }

  return (
    <SheetModal name={ITEMS_COPY.addItems} isOpen={isOpen} onDidDismiss={closed}>
      <SheetHeader title={ITEMS_COPY.addItems} end={{ text: COMMON_COPY.done, onTap: onClose }} />
      <IonContent>
        <div className="set-picker">
          <SearchField query={query} placeholder={COMMON_COPY.search} onQueryChange={setQuery} />
          <ul className="label-list" aria-label={ITEMS_COPY.itemsForSet}>
            {items
              .filter((item) => matchesSearch(item.name, query))
              .toSorted(byName)
              .map((item) => {
                const isTicked = isInSet(entries, item.id)

                return (
                  <li key={item.id}>
                    <LabelRow
                      name={item.name}
                      photoId={item.photoId}
                      pressed={isTicked}
                      trailing={<TickRing isTicked={isTicked} />}
                      onTap={() => onChange(withItemToggled(entries, item))}
                    />
                  </li>
                )
              })}
          </ul>
        </div>
      </IonContent>
    </SheetModal>
  )
}
