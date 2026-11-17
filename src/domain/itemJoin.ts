import type { Item } from './types'

type WithItem<Linked> = { record: Linked; item: Item }

export const itemsById = (items: Item[]) => new Map(items.map((item) => [item.id, item]))

export function withItems<Linked extends { itemId: string }>(records: Linked[], items: Item[]): WithItem<Linked>[] {
  const byId = itemsById(items)

  return records.flatMap((record) => {
    const item = byId.get(record.itemId)

    return item ? [{ record, item }] : []
  })
}
