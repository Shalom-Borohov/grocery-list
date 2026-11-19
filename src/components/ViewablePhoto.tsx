import { useState } from 'react'
import { COMMON_COPY } from '../copy/common'
import { DECORATIVE_IMAGE, ItemThumbnail } from './ItemThumbnail'
import { PhotoViewer } from './PhotoViewer'

type ViewablePhotoProps = {
  photoId: string
  name: string
  className: string
}

export function ViewablePhoto({ photoId, name, className }: ViewablePhotoProps) {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} aria-label={COMMON_COPY.showPhoto} onClick={() => setOpen(true)}>
        <ItemThumbnail photoId={photoId} alt={DECORATIVE_IMAGE} className="photo-tile" />
      </button>
      <PhotoViewer
        photo={isOpen ? { photoId, title: name, alt: COMMON_COPY.photoOf(name) } : undefined}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
