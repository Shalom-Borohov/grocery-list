import { usePhotoUrl } from '../photo/usePhotoUrl'

type ItemThumbnailProps = {
  photoId: string
  alt: string
  className: string
}

export function ItemThumbnail({ photoId, alt, className }: ItemThumbnailProps) {
  const url = usePhotoUrl(photoId, 'thumbnail')

  return url ? <img className={className} src={url} alt={alt} /> : <span className={className} aria-hidden="true" />
}
