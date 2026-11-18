import { IonFooter } from '@ionic/react'
import { TickIcon } from '../../components/icons'
import { useAction } from '../../components/useAction'
import { useMessageToast } from '../../components/useMessageToast'
import { COMMON_COPY } from '../../copy/common'
import { addToList } from '../../data/listRepo'
import { ITEM_COPY } from './copy'

const LISTED_TICK_SIZE = 18

type AddToListFooterProps = {
  itemId: string
  isListed: boolean
}

export function AddToListFooter({ itemId, isListed }: AddToListFooterProps) {
  const run = useAction()
  const toast = useMessageToast()

  const add = () => run(() => addToList(itemId, Date.now()), () => void toast(ITEM_COPY.addedToList))

  return (
    <IonFooter className="ion-no-border item-footer">
      {isListed ? (
        <p className="item-listed" role="status">
          <TickIcon size={LISTED_TICK_SIZE} />
          {COMMON_COPY.alreadyListed}
        </p>
      ) : (
        <button type="button" className="primary-button item-add-button" onClick={add}>
          {COMMON_COPY.addToList}
        </button>
      )}
    </IonFooter>
  )
}
