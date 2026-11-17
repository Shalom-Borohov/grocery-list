import { IonFooter } from '@ionic/react'
import { usePourSet } from '../../components/usePourSet'
import { COMMON_COPY } from '../../copy/common'
import type { SavedSet } from '../../domain/types'

export function PourFooter({ savedSet }: { savedSet: SavedSet }) {
  const pour = usePourSet()

  return (
    <IonFooter className="ion-no-border set-footer">
      <button
        type="button"
        className="primary-button set-pour-button"
        disabled={savedSet.entries.length === 0}
        onClick={() => pour(savedSet.id)}
      >
        {COMMON_COPY.addToList}
      </button>
    </IonFooter>
  )
}
