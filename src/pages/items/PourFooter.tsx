import { IonFooter } from '@ionic/react'
import { usePourSet } from '../../components/usePourSet'
import { COMMON_COPY } from '../../copy/common'
import { canPour } from '../../domain/pourSet'
import type { SavedSet } from '../../domain/types'

export function PourFooter({ savedSet }: { savedSet: SavedSet }) {
  const pour = usePourSet()

  return (
    <IonFooter className="ion-no-border set-footer">
      <button
        type="button"
        className="primary-button set-pour-button"
        disabled={!canPour(savedSet)}
        onClick={() => pour(savedSet.id)}
      >
        {COMMON_COPY.addToList}
      </button>
    </IonFooter>
  )
}
