import { COMMON_COPY } from '../copy/common'
import { setItemPhoto } from '../data/itemsRepo'
import type { Item } from '../domain/types'
import { PhotoInputs } from './PhotoInputs'
import './PhotoSection.css'
import { useConfirmDelete } from './useConfirmDelete'
import { usePhotoPick } from './usePhotoPick'
import { ViewablePhoto } from './ViewablePhoto'

export function PhotoSection({ item }: { item: Item }) {
  const confirmDelete = useConfirmDelete()
  const pick = usePhotoPick((shrunk) => setItemPhoto(item.id, shrunk))

  const removePhoto = () =>
    confirmDelete({
      header: COMMON_COPY.removePhotoQuestion,
      message: COMMON_COPY.removePhotoMessage,
      remove: () => setItemPhoto(item.id, undefined),
    })

  return (
    <section className="photo-section">
      <span className="field-label">{COMMON_COPY.photo}</span>
      {item.photoId && <ViewablePhoto photoId={item.photoId} name={item.name} className="photo-section-thumbnail" />}
      <PhotoInputs cameraLabel={COMMON_COPY.takePhoto} libraryLabel={COMMON_COPY.choosePhoto} onPick={pick} />
      {item.photoId && (
        <button type="button" className="danger-button photo-section-remove" onClick={removePhoto}>
          {COMMON_COPY.removePhoto}
        </button>
      )}
    </section>
  )
}
