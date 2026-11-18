import { IonContent, IonModal } from '@ionic/react'
import { useState } from 'react'
import { AmountField } from '../../components/AmountField'
import { NoteField } from '../../components/NoteField'
import { PhotoSection } from '../../components/PhotoSection'
import { SheetHeader } from '../../components/SheetHeader'
import { TextField } from '../../components/TextField'
import { useAction } from '../../components/useAction'
import { COMMON_COPY } from '../../copy/common'
import { updateItemUnlessNameTaken } from '../../data/itemsRepo'
import { DEFAULT_AMOUNT } from '../../domain/amount'
import { isName, type Item } from '../../domain/types'
import { ITEM_COPY } from './copy'

type EditItemSheetProps = {
  item: Item
  isOpen: boolean
  onClose: () => void
}

function EditItemForm({ item, onClose }: Omit<EditItemSheetProps, 'isOpen'>) {
  const [name, setName] = useState(item.name)
  const [note, setNote] = useState(item.note)
  const [usualAmount, setUsualAmount] = useState(item.usualAmount ?? DEFAULT_AMOUNT)
  const [isNameTaken, setNameTaken] = useState(false)
  const run = useAction()

  function save() {
    run(
      () => updateItemUnlessNameTaken(item.id, { name: isName(name) ? name : item.name, note, usualAmount }),
      (outcome) => (outcome === 'saved' ? onClose() : setNameTaken(true)),
    )
  }

  function changeName(typed: string) {
    setName(typed)
    setNameTaken(false)
  }

  return (
    <>
      <SheetHeader
        title={COMMON_COPY.edit}
        start={{ text: COMMON_COPY.cancel, onTap: onClose }}
        end={{ text: COMMON_COPY.save, onTap: save }}
      />
      <IonContent>
        <div className="sheet-body">
          <TextField
            label={ITEM_COPY.name}
            defaultValue={item.name}
            error={isNameTaken ? COMMON_COPY.duplicateName : undefined}
            onTextChange={changeName}
          />
          <AmountField label={ITEM_COPY.usualAmount} amount={usualAmount} onChange={setUsualAmount} />
          <NoteField label={COMMON_COPY.note} defaultValue={item.note} onChange={(event) => setNote(event.target.value)} />
          <PhotoSection item={item} />
        </div>
      </IonContent>
    </>
  )
}

export function EditItemSheet({ item, isOpen, onClose }: EditItemSheetProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <EditItemForm item={item} onClose={onClose} />
    </IonModal>
  )
}
