import { type ReactNode, useState } from 'react'
import { COMMON_COPY } from '../copy/common'
import { PhotoViewer } from './PhotoViewer'

type ViewablePhotoProps = {
  photoId: string
  name: string
  className: string
  children: ReactNode
}

export function ViewablePhoto({ photoId, name, className, children }: ViewablePhotoProps) {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} aria-label={COMMON_COPY.showPhoto} onClick={() => setOpen(true)}>
        {children}
      </button>
      <PhotoViewer
        photo={isOpen ? { photoId, title: name, alt: COMMON_COPY.photoOf(name) } : undefined}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
