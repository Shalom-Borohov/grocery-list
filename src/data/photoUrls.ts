const PHOTO_KINDS = ['photo', 'thumbnail'] as const

export type PhotoKind = (typeof PHOTO_KINDS)[number]

const JPEG_TYPE = 'image/jpeg'

const jpegUrl = (bytes: ArrayBuffer) => URL.createObjectURL(new Blob([bytes], { type: JPEG_TYPE }))

const storedUrls = new Map<string, string>()

const storedKey = (photoId: string, kind: PhotoKind) => `${kind}/${photoId}`

export const cachedPhotoUrl = (photoId: string, kind: PhotoKind) => storedUrls.get(storedKey(photoId, kind))

export function storedPhotoUrl(photoId: string, kind: PhotoKind, bytes: ArrayBuffer) {
  const key = storedKey(photoId, kind)
  const known = storedUrls.get(key)

  if (known) {
    return known
  }

  const url = jpegUrl(bytes)

  storedUrls.set(key, url)

  return url
}

export function revokePhotoUrls(photoIds: string[]) {
  for (const photoId of photoIds) {
    for (const kind of PHOTO_KINDS) {
      const key = storedKey(photoId, kind)
      const url = storedUrls.get(key)

      if (url) {
        URL.revokeObjectURL(url)
        storedUrls.delete(key)
      }
    }
  }
}

const unsavedUrls = new WeakMap<ArrayBuffer, string>()

const revokeWhenBytesCollected = new FinalizationRegistry<string>((url) => URL.revokeObjectURL(url))

export function unsavedPhotoUrl(bytes: ArrayBuffer) {
  const known = unsavedUrls.get(bytes)

  if (known) {
    return known
  }

  const url = jpegUrl(bytes)

  unsavedUrls.set(bytes, url)
  revokeWhenBytesCollected.register(bytes, url)

  return url
}
