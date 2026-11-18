import { strFromU8, strToU8, unzipSync, Zip, ZipDeflate, ZipPassThrough } from 'fflate'
import { array, type InferOutput, literal, number, object, parse, parseJson, pipe, string } from 'valibot'
import { itemSchema, listEntrySchema, savedSetSchema, type StoredPhoto, tripSchema } from '../domain/types'
import { allTables, db } from './db'
import { revokePhotoUrls } from './photoUrls'

const BACKUP_VERSION = 1

const DATA_FILE = 'data.json'

const ZIP_LEVEL = 6

const PHOTO_FOLDER = 'photos/'

const THUMBNAIL_FOLDER = 'thumbnails/'

const PHOTO_EXTENSION = '.jpg'

const photoPath = (photoId: string) => `${PHOTO_FOLDER}${photoId}${PHOTO_EXTENSION}`

const thumbnailPath = (photoId: string) => `${THUMBNAIL_FOLDER}${photoId}${PHOTO_EXTENSION}`

const backupFileSchema = pipe(
  string(),
  parseJson(),
  object({
    version: literal(BACKUP_VERSION),
    exportedAt: number(),
    items: array(itemSchema),
    listEntries: array(listEntrySchema),
    trips: array(tripSchema),
    sets: array(savedSetSchema),
  }),
)

type BackupFile = InferOutput<typeof backupFileSchema>

export type ParsedBackup = BackupFile & {
  photos: StoredPhoto[]
  thumbnails: StoredPhoto[]
}

function zipWriter() {
  const chunks: Uint8Array<ArrayBuffer>[] = []

  const zip = new Zip((error, chunk) => {
    if (error) {
      throw error
    }

    chunks.push(chunk)
  })

  function addStored(path: string, bytes: ArrayBuffer) {
    const entry = new ZipPassThrough(path)

    zip.add(entry)
    entry.push(new Uint8Array(bytes), true)
  }

  function addDeflated(path: string, bytes: Uint8Array<ArrayBuffer>) {
    const entry = new ZipDeflate(path, { level: ZIP_LEVEL })

    zip.add(entry)
    entry.push(bytes, true)
  }

  function finish() {
    zip.end()

    return chunks
  }

  return { addStored, addDeflated, finish }
}

export const exportBackup = (now: number) =>
  db.transaction('r', allTables(), async () => {
    const writer = zipWriter()

    const backupFile: BackupFile = {
      version: BACKUP_VERSION,
      exportedAt: now,
      items: await db.items.toArray(),
      listEntries: await db.listEntries.toArray(),
      trips: await db.trips.toArray(),
      sets: await db.sets.toArray(),
    }

    writer.addDeflated(DATA_FILE, strToU8(JSON.stringify(backupFile)))
    await db.photos.each(({ id, bytes }) => writer.addStored(photoPath(id), bytes))
    await db.thumbnails.each(({ id, bytes }) => writer.addStored(thumbnailPath(id), bytes))

    return writer.finish()
  })

class NotABackupError extends Error {
  constructor() {
    super(`the file has no ${DATA_FILE}`)
    this.name = 'NotABackupError'
  }
}

const referencedPhotoIds = ({ items, trips }: BackupFile) => [
  ...items.flatMap(({ photoId }) => (photoId ? [photoId] : [])),
  ...trips.flatMap(({ receiptPhotoIds }) => receiptPhotoIds),
]

export function parseBackup(archive: Uint8Array): ParsedBackup {
  const files = unzipSync(archive)
  const dataFile = files[DATA_FILE]

  if (!dataFile) {
    throw new NotABackupError()
  }

  const backupFile = parse(backupFileSchema, strFromU8(dataFile))

  const photoFiles = referencedPhotoIds(backupFile).flatMap((photoId) => {
    const photoFile = files[photoPath(photoId)]

    return photoFile ? [{ photoId, photoFile, thumbnailFile: files[thumbnailPath(photoId)] ?? photoFile }] : []
  })

  return {
    ...backupFile,
    photos: photoFiles.map(({ photoId, photoFile }) => ({ id: photoId, bytes: photoFile.buffer })),
    thumbnails: photoFiles.map(({ photoId, thumbnailFile }) => ({ id: photoId, bytes: thumbnailFile.buffer })),
  }
}

export const restoreBackup = (backup: ParsedBackup) =>
  db.transaction('rw', allTables(), async () => {
    revokePhotoUrls(await db.photos.toCollection().primaryKeys())
    await Promise.all(allTables().map((table) => table.clear()))
    await db.items.bulkAdd(backup.items)
    await db.listEntries.bulkAdd(backup.listEntries)
    await db.trips.bulkAdd(backup.trips)
    await db.sets.bulkAdd(backup.sets)
    await db.photos.bulkAdd(backup.photos)
    await db.thumbnails.bulkAdd(backup.thumbnails)
  })
