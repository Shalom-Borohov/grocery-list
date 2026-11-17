import { withItems } from '../../domain/itemJoin'
import { orderEntries } from '../../domain/listOrder'
import type { Item, ListEntry } from '../../domain/types'

export type ListRow = { entry: ListEntry; item: Item }

export const listRows = (items: Item[], entries: ListEntry[]): ListRow[] =>
  withItems(orderEntries(entries), items).map(({ record, item }) => ({ entry: record, item }))
