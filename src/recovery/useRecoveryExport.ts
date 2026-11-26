import { useState } from 'react'
import { freshBackupFile } from '../components/backupFile'
import { useFileDelivery } from '../components/useFileDelivery'

export function useRecoveryExport() {
  const [failed, setFailed] = useState(false)
  const delivery = useFileDelivery(freshBackupFile, () => setFailed(true))

  function startDelivery(deliver: () => Promise<void>) {
    setFailed(false)
    void deliver()
  }

  const exportData = () => startDelivery(delivery.exportData)

  const shareAgain = (file: File) => startDelivery(() => delivery.shareAgain(file))

  return { exportData, fileAwaitingTap: delivery.fileAwaitingTap, shareAgain, failed }
}
