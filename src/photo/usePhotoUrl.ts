import { useStoredPhoto } from '../data/hooks'
import { cachedPhotoUrl, type PhotoKind, storedPhotoUrl } from '../data/photoUrls'

export function usePhotoUrl(photoId: string | undefined, kind: PhotoKind) {
  const cached = photoId === undefined ? undefined : cachedPhotoUrl(photoId, kind)
  const bytes = useStoredPhoto(cached ? undefined : photoId, kind)

  if (cached) {
    return cached
  }

  return photoId && bytes ? storedPhotoUrl(photoId, kind, bytes) : undefined
}
