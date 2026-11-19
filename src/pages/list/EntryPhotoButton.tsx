import { CameraIcon } from '../../components/icons'
import { DECORATIVE_IMAGE, ItemThumbnail } from '../../components/ItemThumbnail'

type EntryPhotoButtonProps = {
  photoId?: string
  label: string
  onTap: () => void
}

const ROW_CAMERA_ICON_SIZE = 20

export function EntryPhotoButton({ photoId, label, onTap }: EntryPhotoButtonProps) {
  return (
    <button type="button" className="entry-photo-button" aria-label={label} onClick={onTap}>
      {photoId ? (
        <ItemThumbnail photoId={photoId} alt={DECORATIVE_IMAGE} className="label-row-photo" />
      ) : (
        <span className="label-row-photo entry-photo-placeholder">
          <CameraIcon size={ROW_CAMERA_ICON_SIZE} />
        </span>
      )}
    </button>
  )
}
