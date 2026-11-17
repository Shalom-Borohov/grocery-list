import { IonBackButton, IonButtons, IonHeader, IonToolbar } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useItemStack } from './itemStack'

export function ItemHeader({ onEdit }: { onEdit?: () => void }) {
  const stack = useItemStack()

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref={stack.root} text={stack.name} />
        </IonButtons>
        {onEdit && (
          <IonButtons slot="end">
            <button type="button" className="sheet-action" onClick={onEdit}>
              {COMMON_COPY.edit}
            </button>
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  )
}
