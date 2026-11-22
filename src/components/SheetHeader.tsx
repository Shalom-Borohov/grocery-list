import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react'
import { PencilIcon } from './icons'

type SheetAction = {
  text: string
  onTap: () => void
}

type TitleEdit = {
  label: string
  onTap: () => void
}

type SheetHeaderProps = {
  title: string
  titleEdit?: TitleEdit
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

function EditableTitle({ title, label, onTap }: TitleEdit & { title: string }) {
  return (
    <button type="button" className="sheet-title-button" aria-label={label} onClick={onTap}>
      <span className="sheet-title-text">{title}</span>
      <PencilIcon />
    </button>
  )
}

export function SheetHeader({ title, titleEdit, start, end }: SheetHeaderProps) {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        {start && (
          <IonButtons slot="start">
            <SheetActionButton {...start} />
          </IonButtons>
        )}
        <IonTitle>{titleEdit ? <EditableTitle title={title} {...titleEdit} /> : title}</IonTitle>
        {end && (
          <IonButtons slot="end">
            <SheetActionButton {...end} />
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  )
}
