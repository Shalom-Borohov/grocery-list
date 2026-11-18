import { useIonActionSheet, useIonRouter } from '@ionic/react'
import { useNamePrompt } from '../../components/useNamePrompt'
import { COMMON_COPY } from '../../copy/common'
import { createItem } from '../../data/itemsRepo'
import { createSetFromEntries } from '../../data/setsRepo'
import { setEntriesFromList } from '../../domain/setEntries'
import type { ListEntry } from '../../domain/types'
import { itemPath, setPath } from '../../navigation/paths'
import { ITEMS_COPY } from './copy'

export function useAddMenu() {
  const [presentActionSheet] = useIonActionSheet()
  const router = useIonRouter()
  const askName = useNamePrompt()

  const askItemName = () =>
    askName({
      header: COMMON_COPY.newItem,
      placeholder: COMMON_COPY.itemName,
      confirmText: COMMON_COPY.add,
      save: async (name) => router.push(itemPath('items', await createItem(name, Date.now()))),
    })

  const askSetName = (header: string, entries: ListEntry[]) =>
    askName({
      header,
      placeholder: COMMON_COPY.setName,
      confirmText: COMMON_COPY.add,
      save: async (name) => router.push(setPath(await createSetFromEntries(name, setEntriesFromList(entries), Date.now()))),
    })

  const fromListButtons = (onList: ListEntry[]) =>
    onList.length > 0 ? [{ text: ITEMS_COPY.setFromList, handler: () => askSetName(ITEMS_COPY.setFromList, onList) }] : []

  return (onList: ListEntry[]) =>
    void presentActionSheet({
      buttons: [
        { text: COMMON_COPY.newItem, handler: askItemName },
        { text: ITEMS_COPY.emptySet, handler: () => askSetName(ITEMS_COPY.emptySet, []) },
        ...fromListButtons(onList),
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
}
