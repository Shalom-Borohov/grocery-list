import { exportStoredData } from '../data/backup'
import { dayDateOf } from '../domain/dayDate'

const BACKUP_FILE_PREFIX = 'groceries-backup-'

const BACKUP_EXTENSION = '.zip'

const BACKUP_MIME_TYPE = 'application/zip'

export const BACKUP_FILE_ACCEPT = [BACKUP_EXTENSION, BACKUP_MIME_TYPE].join(',')

const backupFile = (archiveChunks: Uint8Array<ArrayBuffer>[], now: number) =>
  new File(archiveChunks, `${BACKUP_FILE_PREFIX}${dayDateOf(now)}${BACKUP_EXTENSION}`, {
    type: BACKUP_MIME_TYPE,
  })

export async function freshBackupFile() {
  const now = Date.now()

  return backupFile(await exportStoredData(now), now)
}
