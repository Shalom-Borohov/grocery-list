import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react'

type SheetAction = {
  text: string
  onTap: () => void
}

type SheetHeaderProps = {
  title: string
  start?: SheetAction
  end?: SheetAction
}

function SheetActionButton({ text, onTap }: SheetAction) {
  return (
    <button type="button" className="sheet-action" onClick={onTap}>
      {text}
    </button>
  )
}

export function SheetHeader({ title, start, end }: SheetHeaderProps) {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        {start && (
          <IonButtons slot="start">
            <SheetActionButton {...start} />
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {end && (
          <IonButtons slot="end">
            <SheetActionButton {...end} />
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  )
}
