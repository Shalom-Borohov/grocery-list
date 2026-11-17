import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react'
import { useParams } from 'react-router-dom'
import { useNamePrompt } from '../../components/useNamePrompt'
import { COMMON_COPY } from '../../copy/common'
import { useRecords } from '../../data/hooks'
import { updateSet } from '../../data/setsRepo'
import type { SavedSet } from '../../domain/types'
import { ITEMS_PATH } from '../../navigation/paths'
import { ITEMS_COPY } from './copy'
import { PourFooter } from './PourFooter'
import './set.css'
import { SetView } from './SetView'

export function SetPage() {
  const { setId } = useParams()
  const records = useRecords()
  const savedSet = records?.sets.find(({ id }) => id === setId)
  const askName = useNamePrompt()

  const rename = ({ id, name }: SavedSet) =>
    askName({
      header: ITEMS_COPY.rename,
      placeholder: COMMON_COPY.setName,
      confirmText: COMMON_COPY.save,
      currentName: name,
      save: (newName) => updateSet(id, { name: newName }),
    })

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ITEMS_PATH} text={COMMON_COPY.items} />
          </IonButtons>
          {savedSet && (
            <IonButtons slot="end">
              <button type="button" className="sheet-action" onClick={() => rename(savedSet)}>
                {ITEMS_COPY.rename}
              </button>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {records &&
          (savedSet ? (
            <SetView savedSet={savedSet} items={records.items} />
          ) : (
            <p className="empty-note">{ITEMS_COPY.setNotFound}</p>
          ))}
      </IonContent>
      {savedSet && <PourFooter savedSet={savedSet} />}
    </IonPage>
  )
}
