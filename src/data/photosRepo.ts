import type { ShrunkPhoto } from '../domain/types'
import { db } from './db'
import { type PhotoKind, revokePhotoUrls } from './photoUrls'

const photoTable = (kind: PhotoKind) => (kind === 'photo' ? db.photos : db.thumbnails)

export const storedPhotoBytes = async (photoId: string, kind: PhotoKind) => (await photoTable(kind).get(photoId))?.bytes

export async function storePhoto({ photo: photoBytes, thumbnail: thumbnailBytes }: ShrunkPhoto) {
  const id = crypto.randomUUID()

  await db.photos.add({ id, bytes: photoBytes })
  await db.thumbnails.add({ id, bytes: thumbnailBytes })

  return id
}

export async function deletePhotos(photoIds: string[]) {
  await db.photos.bulkDelete(photoIds)
  await db.thumbnails.bulkDelete(photoIds)
  revokePhotoUrls(photoIds)
}

export const photoTables = () => [db.photos, db.thumbnails]
