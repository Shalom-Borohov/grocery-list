import { AmountColumn } from '../../components/LabelRow'
import { VerdictSwitch } from '../../components/VerdictSwitch'
import { ViewablePhoto } from '../../components/ViewablePhoto'
import { amountParts } from '../../copy/amountCopy'
import type { ItemHistory } from '../../domain/itemHistory'
import type { Item } from '../../domain/types'
import { AddPhotoTile } from './AddPhotoTile'
import { ITEM_COPY } from './copy'
import { itemFacts } from './itemFacts'
import { NoteBox } from './NoteBox'

type ItemCardProps = {
  item: Item
  history: ItemHistory
  onEdit: () => void
}

function UsualAmount({ item }: { item: Item }) {
  const parts = item.usualAmount && amountParts(item.usualAmount)

  return (
    <div className="item-amount">
      {parts && (
        <>
          <span className="visually-hidden">{ITEM_COPY.usualAmount}</span>
          <AmountColumn numeral={parts.numeral} unitLabel={parts.unitLabel} size="large" />
        </>
      )}
    </div>
  )
}

export function ItemCard({ item, history, onEdit }: ItemCardProps) {
  return (
    <section className="item-card panel">
      <div className="item-top-row">
        <UsualAmount item={item} />
        <div className="item-heading">
          <h1 className="item-name" dir="auto">
            {item.name}
          </h1>
          <p className="item-facts">{itemFacts(history)}</p>
        </div>
        {item.photoId ? (
          <ViewablePhoto photoId={item.photoId} name={item.name} className="item-photo-button" />
        ) : (
          <AddPhotoTile itemId={item.id} />
        )}
      </div>
      <VerdictSwitch item={item} label={ITEM_COPY.verdict} />
      <NoteBox note={item.note} onOpen={onEdit} />
    </section>
  )
}
