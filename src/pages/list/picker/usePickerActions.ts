import { useState } from 'react'
import { useAction } from '../../../components/useAction'
import { usePourSet } from '../../../components/usePourSet'
import { createItem } from '../../../data/itemsRepo'
import { addToList, putBackEntry, removeEntry } from '../../../data/listRepo'
import { tapTakesOff } from '../../../domain/pickerOrder'
import type { Item, ListEntry } from '../../../domain/types'

export function usePickerActions(entries: ListEntry[]) {
  const [addedItemIds, setAddedItemIds] = useState<ReadonlySet<string>>(new Set())
  const [takenOffEntries, setTakenOffEntries] = useState<ReadonlyMap<string, ListEntry>>(new Map())
  const run = useAction()
  const listedItemIds = new Set(entries.map(({ itemId }) => itemId))
  const addedCount = [...addedItemIds].filter((itemId) => listedItemIds.has(itemId)).length

  const markAdded = (itemIds: string[]) => setAddedItemIds((previous) => new Set([...previous, ...itemIds]))

  const pour = usePourSet(markAdded)

  async function addItem(itemId: string, now: number) {
    const takenOff = takenOffEntries.get(itemId)

    if (takenOff) {
      await putBackEntry(takenOff)

      return
    }

    const wasListed = listedItemIds.has(itemId)

    await addToList(itemId, now)

    if (!wasListed) {
      markAdded([itemId])
    }
  }

  function toggleItem(item: Item, onList: ListEntry | undefined) {
    if (!onList) {
      run(() => addItem(item.id, Date.now()))

      return
    }

    if (tapTakesOff(onList)) {
      setTakenOffEntries((previous) => new Map(previous).set(onList.itemId, onList))
      run(() => removeEntry(onList.id))
    }
  }

  function createAndAdd(name: string, onAdded: () => void) {
    const now = Date.now()

    run(async () => addItem(await createItem(name, now), now), onAdded)
  }

  function addTyped(query: string, onAdded: () => void) {
    const typedName = query.trim()

    if (!typedName) {
      onAdded()

      return
    }

    createAndAdd(typedName, onAdded)
  }

  return { addedCount, takenOffEntries, toggleItem, createAndAdd, addTyped, pour }
}
