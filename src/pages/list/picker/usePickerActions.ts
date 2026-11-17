import { useState } from 'react'
import { useAction } from '../../../components/useAction'
import { usePourSet } from '../../../components/usePourSet'
import { createItem } from '../../../data/itemsRepo'
import { addToList, removeEntry } from '../../../data/listRepo'
import { tapTakesOff } from '../../../domain/pickerOrder'
import type { Item, ListEntry } from '../../../domain/types'

export function usePickerActions(entries: ListEntry[]) {
  const [addedItemIds, setAddedItemIds] = useState<ReadonlySet<string>>(new Set())
  const run = useAction()
  const listedItemIds = new Set(entries.map(({ itemId }) => itemId))
  const addedCount = [...addedItemIds].filter((itemId) => listedItemIds.has(itemId)).length

  const markAdded = (itemIds: string[]) => setAddedItemIds((previous) => new Set([...previous, ...itemIds]))

  const pour = usePourSet(markAdded)

  async function addItem(itemId: string, now: number) {
    await addToList(itemId, now)
    markAdded([itemId])
  }

  function toggleItem(item: Item, onList: ListEntry | undefined) {
    if (!onList) {
      run(() => addItem(item.id, Date.now()))

      return
    }

    if (tapTakesOff(onList)) {
      run(() => removeEntry(onList.id))
    }
  }

  function createAndAdd(name: string, onAdded: () => void) {
    const now = Date.now()

    run(async () => addItem(await createItem(name, now), now), onAdded)
  }

  return { addedCount, toggleItem, createAndAdd, pour }
}
