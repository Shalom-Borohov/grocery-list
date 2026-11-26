import { useRef } from 'react'
import { BACKUP_FILE_ACCEPT } from '../../components/backupFile'
import { ImportIcon, ShareIcon } from '../../components/icons'
import { COMMON_COPY } from '../../copy/common'
import { useRecords } from '../../data/hooks'
import { SETTINGS_COPY } from './copy'
import { useBackupExport } from './useBackupExport'
import { useBackupRestore } from './useBackupRestore'

function BackupCounts() {
  const records = useRecords()

  if (!records) {
    return null
  }

  const { items, trips } = records
  const itemPhotos = items.filter(({ photoId }) => photoId).length
  const receiptPhotos = trips.reduce((count, { receiptPhotoIds }) => count + receiptPhotoIds.length, 0)

  return <p className="settings-counts">{SETTINGS_COPY.counts(items.length, trips.length, itemPhotos + receiptPhotos)}</p>
}

export function BackupTile() {
  const fileInput = useRef<HTMLInputElement>(null)
  const { exportData, fileAwaitingTap, shareAgain } = useBackupExport()
  const restoreFromFile = useBackupRestore()

  return (
    <section className="panel settings-tile">
      <h2>{SETTINGS_COPY.backup}</h2>
      <p className="quiet-text settings-note">{SETTINGS_COPY.storageNote}</p>
      <BackupCounts />
      {fileAwaitingTap ? (
        <div className="settings-ready" role="status">
          <span>{COMMON_COPY.backupReady}</span>
          <button type="button" className="primary-button settings-action" onClick={() => void shareAgain(fileAwaitingTap)}>
            <ShareIcon />
            {COMMON_COPY.share}
          </button>
        </div>
      ) : (
        <button type="button" className="primary-button settings-action" onClick={() => void exportData()}>
          <ShareIcon />
          {COMMON_COPY.exportBackup}
        </button>
      )}
      <button type="button" className="quiet-button settings-action" onClick={() => fileInput.current?.click()}>
        <ImportIcon />
        {SETTINGS_COPY.restoreBackup}
      </button>
      <input
        ref={fileInput}
        className="visually-hidden"
        type="file"
        accept={BACKUP_FILE_ACCEPT}
        tabIndex={-1}
        aria-label={SETTINGS_COPY.backupFile}
        onChange={(event) => void restoreFromFile(event)}
      />
    </section>
  )
}
