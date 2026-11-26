import { useEffect, useState } from 'react'
import { type DeliveryOutcome, deliverFile, shareFile } from './deliverFile'

export const FILE_KEPT_FOR_SECOND_TAP_MS = 60_000

export function useFileDelivery(prepareFile: () => Promise<File>, onFailure: () => void) {
  const [fileAwaitingTap, setFileAwaitingTap] = useState<File>()
  const forgetFile = () => setFileAwaitingTap(undefined)

  useEffect(() => {
    if (!fileAwaitingTap) {
      return
    }

    const timer = setTimeout(() => setFileAwaitingTap(undefined), FILE_KEPT_FOR_SECOND_TAP_MS)

    return () => clearTimeout(timer)
  }, [fileAwaitingTap])

  async function deliver(prepare: () => Promise<File>, delivery: (file: File) => Promise<DeliveryOutcome>) {
    try {
      const file = await prepare()
      const outcome = await delivery(file)

      setFileAwaitingTap(outcome === 'needsAnotherTap' ? file : undefined)
    } catch {
      forgetFile()
      onFailure()
    }
  }

  const exportData = () => deliver(prepareFile, deliverFile)

  const shareAgain = (file: File) => deliver(async () => file, shareFile)

  return { exportData, fileAwaitingTap, shareAgain, forgetFile }
}
