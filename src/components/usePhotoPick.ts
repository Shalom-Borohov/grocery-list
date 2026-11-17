import type { ShrunkPhoto } from '../domain/types'
import { shrinkPhoto } from '../photo/shrink'
import { useAction } from './useAction'

export function usePhotoPick(save: (photo: ShrunkPhoto) => unknown) {
  const run = useAction()

  return (file: File) => run(async () => save(await shrinkPhoto(file)))
}
