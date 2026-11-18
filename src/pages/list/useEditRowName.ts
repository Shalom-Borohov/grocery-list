import { useMessageToast } from '../../components/useMessageToast'
import { useNamePrompt } from '../../components/useNamePrompt'
import { COMMON_COPY } from '../../copy/common'
import { updateItemUnlessNameTaken } from '../../data/itemsRepo'
import { pointEntryAt } from '../../data/listRepo'
import { LIST_COPY } from './copy'
import type { ListRow } from './listRows'

export function useEditRowName() {
  const askName = useNamePrompt()
  const toast = useMessageToast()

  async function rename(itemId: string, name: string) {
    if ((await updateItemUnlessNameTaken(itemId, { name })) === 'nameTaken') {
      await toast(COMMON_COPY.duplicateName)
    }
  }

  async function pointAt(entryId: string, name: string) {
    if ((await pointEntryAt(entryId, name, Date.now())) === 'alreadyListed') {
      await toast(COMMON_COPY.alreadyListed)
    }
  }

  return ({ entry, item }: ListRow) =>
    askName({
      header: LIST_COPY.editName,
      placeholder: COMMON_COPY.itemName,
      confirmText: LIST_COPY.rename,
      currentName: item.name,
      save: (name) => rename(item.id, name),
      alternative: { text: COMMON_COPY.newItem, save: (name) => pointAt(entry.id, name) },
    })
}
