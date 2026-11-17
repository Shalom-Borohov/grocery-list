import { useLiveQuery } from 'dexie-react-hooks'
import { useContext } from 'react'
import type { PhotoKind } from './photoUrls'
import { storedPhotoBytes } from './photosRepo'
import { RecordsContext } from './recordsContext'

export function useRecords() {
  return useContext(RecordsContext)
}

export function useStoredPhoto(photoId: string | undefined, kind: PhotoKind) {
  return useLiveQuery(() => (photoId ? storedPhotoBytes(photoId, kind) : undefined), [photoId, kind])
}
