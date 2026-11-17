import { useIonRouter } from '@ionic/react'
import { useConfirmDelete } from '../../components/useConfirmDelete'
import { COMMON_COPY } from '../../copy/common'
import { deleteItem } from '../../data/itemsRepo'
import type { Item } from '../../domain/types'
import { ITEM_COPY } from './copy'
import { useItemStack } from './itemStack'

export function DeleteItemButton({ item }: { item: Item }) {
  const router = useIonRouter()
  const stack = useItemStack()
  const confirmDelete = useConfirmDelete()

  const askToDelete = () =>
    confirmDelete({
      header: COMMON_COPY.deleteQuestion(item.name),
      message: ITEM_COPY.deleteMessage,
      remove: () => deleteItem(item.id),
      onDeleted: () => router.push(stack.root, 'back', 'replace'),
    })

  return (
    <button type="button" className="danger-button item-delete-button" onClick={askToDelete}>
      {ITEM_COPY.deleteItem}
    </button>
  )
}
