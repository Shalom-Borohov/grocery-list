import { useIonViewWillLeave } from '@ionic/react'
import { freshBackupFile } from '../../components/backupFile'
import { useFileDelivery } from '../../components/useFileDelivery'
import { useMessageToast } from '../../components/useMessageToast'
import { COMMON_COPY } from '../../copy/common'

export function useBackupExport() {
  const toast = useMessageToast()

  const { exportData, fileAwaitingTap, shareAgain, forgetFile } = useFileDelivery(freshBackupFile, () => {
    void toast(COMMON_COPY.actionFailed)
  })

  useIonViewWillLeave(forgetFile)

  return { exportData, fileAwaitingTap, shareAgain }
}
