import { isPriceAmount, toAgorot } from './price'
import type { ListEntry, Unit } from './types'

export type TakenTotal = {
  total: number | undefined
  pricedCount: number
}

const PRICED_PER_ROW_UNITS: ReadonlySet<Unit> = new Set(['gram'])

const rowCost = ({ amount, price }: ListEntry & { price: number }) =>
  PRICED_PER_ROW_UNITS.has(amount.unit) ? price : price * amount.quantity

const isPriced = (entry: ListEntry): entry is ListEntry & { price: number } => entry.price !== undefined

export function takenTotal(entries: ListEntry[]): TakenTotal {
  const priced = entries.filter(({ state }) => state === 'taken').filter(isPriced)
  const sum = toAgorot(priced.reduce((running, entry) => running + rowCost(entry), 0))
  const total = priced.length > 0 && isPriceAmount(sum) ? sum : undefined

  return { total, pricedCount: priced.length }
}
