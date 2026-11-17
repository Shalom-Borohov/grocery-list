import { normalizeText } from './text'
import type { Item } from './types'

const NAME_COLLATOR = new Intl.Collator('he')

export const compareNames = (first: string, second: string) => NAME_COLLATOR.compare(first, second)

export const byName = (first: Item, second: Item) => compareNames(first.name, second.name)

export function findItemByName(items: Item[], name: string) {
  const wanted = normalizeText(name)

  return items.find((candidate) => normalizeText(candidate.name) === wanted)
}

export const matchesSearch = (name: string, query: string) => normalizeText(name).includes(normalizeText(query))
