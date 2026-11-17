import { useIonRouter } from '@ionic/react'
import { useConfirmDelete } from '../../components/useConfirmDelete'
import { COMMON_COPY } from '../../copy/common'
import { deleteSet } from '../../data/setsRepo'
import type { SavedSet } from '../../domain/types'
import { ITEMS_PATH } from '../../navigation/paths'
import { ITEMS_COPY } from './copy'

export function DeleteSetButton({ savedSet }: { savedSet: SavedSet }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()

  const askToDelete = () =>
    confirmDelete({
      header: COMMON_COPY.deleteQuestion(savedSet.name),
      message: ITEMS_COPY.deleteSetMessage,
      remove: () => deleteSet(savedSet.id),
      onDeleted: () => router.push(ITEMS_PATH, 'back', 'replace'),
    })

  return (
    <button type="button" className="danger-button" onClick={askToDelete}>
      {ITEMS_COPY.deleteSet}
    </button>
  )
}
