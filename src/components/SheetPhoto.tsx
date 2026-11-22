import type { Item } from '../domain/types'
import { DECORATIVE_IMAGE } from './ItemThumbnail'
import { FullPhoto } from './PhotoViewer'
import './SheetPhoto.css'
import { ViewablePhoto } from './ViewablePhoto'

export function SheetPhoto({ item }: { item: Item }) {
  return item.photoId ? (
    <ViewablePhoto photoId={item.photoId} name={item.name} className="sheet-photo">
      <FullPhoto photoId={item.photoId} alt={DECORATIVE_IMAGE} className="sheet-photo-image" />
    </ViewablePhoto>
  ) : null
}
