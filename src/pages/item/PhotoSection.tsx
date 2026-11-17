import { ItemThumbnail } from '../../components/ItemThumbnail'
import { PhotoInputs } from '../../components/PhotoInputs'
import { useConfirmDelete } from '../../components/useConfirmDelete'
import { usePhotoPick } from '../../components/usePhotoPick'
import { COMMON_COPY } from '../../copy/common'
import { setItemPhoto } from '../../data/itemsRepo'
import type { Item } from '../../domain/types'
import { ITEM_COPY } from './copy'

export function PhotoSection({ item }: { item: Item }) {
  const confirmDelete = useConfirmDelete()
  const pick = usePhotoPick((shrunk) => setItemPhoto(item.id, shrunk))

  const removePhoto = () =>
    confirmDelete({
      header: ITEM_COPY.removePhotoQuestion,
      message: ITEM_COPY.removePhotoMessage,
      remove: () => setItemPhoto(item.id, undefined),
    })

  return (
    <section className="item-edit-photo">
      <span className="field-label">{COMMON_COPY.photo}</span>
      {item.photoId && <ItemThumbnail photoId={item.photoId} alt={item.name} className="item-edit-thumbnail" />}
      <PhotoInputs cameraLabel={COMMON_COPY.takePhoto} libraryLabel={COMMON_COPY.choosePhoto} onPick={pick} />
      {item.photoId && (
        <button type="button" className="danger-button item-remove-photo" onClick={removePhoto}>
          {COMMON_COPY.removePhoto}
        </button>
      )}
    </section>
  )
}
