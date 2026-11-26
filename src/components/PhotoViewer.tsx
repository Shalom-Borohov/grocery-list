import { IonContent } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'
import { usePhotoUrl } from '../photo/usePhotoUrl'
import './PhotoViewer.css'
import { SheetHeader } from './SheetHeader'
import { SheetModal } from './SheetModal'

export type ShownPhoto = {
  photoId: string
  title: string
  alt: string
}

type PhotoViewerProps = {
  photo: ShownPhoto | undefined
  onClose: () => void
}

type FullPhotoProps = Pick<ShownPhoto, 'photoId' | 'alt'> & { className: string }

export function FullPhoto({ photoId, alt, className }: FullPhotoProps) {
  const url = usePhotoUrl(photoId, 'photo')

  return url && <img className={className} src={url} alt={alt} decoding="async" />
}

export function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  return (
    <SheetModal name={photo?.title} isOpen={photo !== undefined} onDidDismiss={onClose}>
      {photo && (
        <>
          <SheetHeader title={photo.title} end={{ text: COMMON_COPY.close, onTap: onClose }} />
          <IonContent>
            <FullPhoto photoId={photo.photoId} alt={photo.alt} className="full-photo" />
          </IonContent>
        </>
      )}
    </SheetModal>
  )
}
