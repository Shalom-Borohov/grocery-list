import { afterEach, beforeEach } from 'vitest'
import type { ShrunkPhoto } from '../../src/domain/types'

export const shrunkPhoto = (photo: ArrayBuffer, thumbnail: ArrayBuffer): ShrunkPhoto => ({ photo, thumbnail })

export const SHRUNK_PHOTO_BYTES = [1, 2, 3]

export const fakeShrunkPhoto = () => shrunkPhoto(new Uint8Array(SHRUNK_PHOTO_BYTES).buffer, new Uint8Array([4]).buffer)

export const PHOTO_URL = 'blob:item-photo'

const ORIGINAL_CREATE = URL.createObjectURL

const ORIGINAL_REVOKE = URL.revokeObjectURL

export function stubObjectUrls(createUrl: (blob: Blob) => string = () => PHOTO_URL) {
  beforeEach(() => {
    URL.createObjectURL = createUrl
    URL.revokeObjectURL = () => {}
  })

  afterEach(() => {
    URL.createObjectURL = ORIGINAL_CREATE
    URL.revokeObjectURL = ORIGINAL_REVOKE
  })
}

export const cameraPhoto = () => new File([new Uint8Array([9, 9, 9])], 'IMG_0001.jpg', { type: 'image/jpeg' })
