import { IonContent, IonPage } from '@ionic/react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRecords } from '../../data/hooks'
import { itemHistory } from '../../domain/itemHistory'
import type { Item, Records } from '../../domain/types'
import { AddToListFooter } from './AddToListFooter'
import { ITEM_COPY } from './copy'
import { DeleteItemButton } from './DeleteItemButton'
import { EditItemSheet } from './EditItemSheet'
import { ItemCard } from './ItemCard'
import { ItemHeader } from './ItemHeader'
import { PriceBars } from './PriceBars'
import './item.css'

type ItemDetailsProps = {
  item: Item
  records: Records
  onEdit: () => void
}

function ItemDetails({ item, records, onEdit }: ItemDetailsProps) {
  const history = itemHistory(item.id, records.trips)

  return (
    <>
      <IonContent>
        <div className="page-body item-page">
          <ItemCard item={item} history={history} onEdit={onEdit} />
          <PriceBars prices={history.prices} />
          <DeleteItemButton item={item} />
        </div>
      </IonContent>
      <AddToListFooter itemId={item.id} isListed={records.entries.some((entry) => entry.itemId === item.id)} />
    </>
  )
}

export function ItemPage() {
  const { itemId } = useParams()
  const records = useRecords()
  const [isEditing, setEditing] = useState(false)
  const item = records?.items.find(({ id }) => id === itemId)
  const startEditing = () => setEditing(true)

  return (
    <IonPage>
      <ItemHeader onEdit={item && startEditing} />
      {records && item ? (
        <>
          <ItemDetails item={item} records={records} onEdit={startEditing} />
          <EditItemSheet item={item} isOpen={isEditing} onClose={() => setEditing(false)} />
        </>
      ) : (
        <IonContent>{records && <p className="empty-note">{ITEM_COPY.notFound}</p>}</IonContent>
      )}
    </IonPage>
  )
}
