import { CameraIcon } from '../../components/icons'
import { PhotoInput } from '../../components/PhotoInputs'
import { usePhotoPick } from '../../components/usePhotoPick'
import { setItemPhoto } from '../../data/itemsRepo'
import { ITEM_COPY } from './copy'

export function AddPhotoTile({ itemId }: { itemId: string }) {
  const pick = usePhotoPick((shrunk) => setItemPhoto(itemId, shrunk))

  return (
    <PhotoInput className="item-add-photo" opensCamera={false} onPick={pick}>
      <CameraIcon />
      <span className="visually-hidden">{ITEM_COPY.addPhoto}</span>
    </PhotoInput>
  )
}
