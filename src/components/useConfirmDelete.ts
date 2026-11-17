import { useIonAlert } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'
import { useAction } from './useAction'

type DeleteQuestion = {
  header: string
  message: string
  remove: () => Promise<void>
  onDeleted?: () => void
}

export function useConfirmDelete() {
  const [presentAlert] = useIonAlert()
  const run = useAction()

  return ({ header, message, remove, onDeleted }: DeleteQuestion) =>
    void presentAlert({
      header,
      message,
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        { text: COMMON_COPY.delete, role: 'destructive', handler: () => run(remove, onDeleted) },
      ],
    })
}
