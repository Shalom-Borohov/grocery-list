import { IonContent, IonModal } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'
import { usePhotoUrl } from '../photo/usePhotoUrl'
import './PhotoViewer.css'
import { SheetHeader } from './SheetHeader'

export type ShownPhoto = {
  photoId: string
  title: string
  alt: string
}

type PhotoViewerProps = {
  photo: ShownPhoto | undefined
  onClose: () => void
}

function FullPhoto({ photoId, alt }: ShownPhoto) {
  const url = usePhotoUrl(photoId, 'photo')

  return url && <img className="full-photo" src={url} alt={alt} />
}

export function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  return (
    <IonModal isOpen={photo !== undefined} onDidDismiss={onClose}>
      {photo && (
        <>
          <SheetHeader title={photo.title} end={{ text: COMMON_COPY.close, onTap: onClose }} />
          <IonContent>
            <FullPhoto {...photo} />
          </IonContent>
        </>
      )}
    </IonModal>
  )
}
