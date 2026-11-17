import { useState } from 'react'
import { ItemThumbnail } from '../../components/ItemThumbnail'
import { PhotoViewer } from '../../components/PhotoViewer'
import { ITEM_COPY } from './copy'

type ItemPhotoProps = {
  photoId: string
  name: string
}

const DECORATIVE_IMAGE = ''

export function ItemPhoto({ photoId, name }: ItemPhotoProps) {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="item-photo-button" aria-label={ITEM_COPY.showPhoto} onClick={() => setOpen(true)}>
        <ItemThumbnail photoId={photoId} alt={DECORATIVE_IMAGE} className="item-photo" />
      </button>
      <PhotoViewer
        photo={isOpen ? { photoId, title: name, alt: ITEM_COPY.photoOf(name) } : undefined}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
