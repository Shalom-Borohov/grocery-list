import { useIonRouter } from '@ionic/react'
import { useId } from 'react'
import { ChevronIcon } from '../../components/icons'
import { LabelRow } from '../../components/LabelRow'
import { SecondaryText } from '../../components/SecondaryText'
import { COMMON_COPY } from '../../copy/common'
import { amountForNewEntry } from '../../domain/amount'
import { byName } from '../../domain/itemNames'
import { secondaryLine } from '../../domain/secondaryLine'
import type { Item } from '../../domain/types'
import { itemPath } from '../../navigation/paths'

export function AllItemsList({ items }: { items: Item[] }) {
  const router = useIonRouter()
  const headingId = useId()

  return (
    <>
      <h2 id={headingId} className="section-heading">
        {COMMON_COPY.allItems}
      </h2>
      <ul className="label-list" aria-labelledby={headingId}>
        {items.toSorted(byName).map((item) => {
          const line = secondaryLine(item)

          return (
            <li key={item.id}>
              <LabelRow
                name={item.name}
                amount={amountForNewEntry(item)}
                secondary={line && <SecondaryText line={line} />}
                photoId={item.photoId}
                trailing={
                  <span className="items-chevron">
                    <ChevronIcon />
                  </span>
                }
                onTap={() => router.push(itemPath('items', item.id))}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}
