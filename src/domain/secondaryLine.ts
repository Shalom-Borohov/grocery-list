import type { Item, ListEntry } from './types'

export type SecondaryLine =
  | { kind: 'missing' }
  | { kind: 'missedLastTrip' }
  | { kind: 'never' }
  | { kind: 'note'; note: string }
  | { kind: 'again' }

export function secondaryLine(item: Item, onList?: ListEntry): SecondaryLine | undefined {
  if (onList?.state === 'missing') {
    return { kind: 'missing' }
  }

  if (onList?.missedLastTrip) {
    return { kind: 'missedLastTrip' }
  }

  if (item.verdict === 'never') {
    return { kind: 'never' }
  }

  if (item.note) {
    return { kind: 'note', note: item.note }
  }

  return item.verdict === 'again' ? { kind: 'again' } : undefined
}
