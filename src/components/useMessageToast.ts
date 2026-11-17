import { useIonToast } from '@ionic/react'

const TOAST_DURATION_MS = 2500

export function useMessageToast() {
  const [presentToast, dismissToast] = useIonToast()

  return async (message: string) => {
    await dismissToast()

    return presentToast({ message, duration: TOAST_DURATION_MS, position: 'top' })
  }
}
