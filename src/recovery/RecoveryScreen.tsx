import { useAppUpdate } from '../appUpdate/useAppUpdate'
import { COMMON_COPY } from '../copy/common'
import { RECOVERY_COPY } from './copy'
import { startAgain } from './startAgain'
import { useRecoveryExport } from './useRecoveryExport'
import './recovery.css'

export function RecoveryScreen() {
  const { exportData, fileAwaitingTap, shareAgain, failed } = useRecoveryExport()
  const { updateWaiting, applyUpdate } = useAppUpdate()

  return (
    <main className="recovery">
      <h1>{RECOVERY_COPY.title}</h1>
      <p>{RECOVERY_COPY.explanation}</p>
      <div role="status">
        {fileAwaitingTap && <p>{COMMON_COPY.backupReady}</p>}
        {failed && <p>{COMMON_COPY.actionFailed}</p>}
      </div>
      {fileAwaitingTap ? (
        <button type="button" className="primary-button" onClick={() => shareAgain(fileAwaitingTap)}>
          {COMMON_COPY.share}
        </button>
      ) : (
        <button type="button" className="primary-button" onClick={exportData}>
          {COMMON_COPY.exportBackup}
        </button>
      )}
      <button type="button" className="quiet-button" onClick={() => startAgain(updateWaiting, applyUpdate)}>
        {RECOVERY_COPY.reload}
      </button>
    </main>
  )
}
