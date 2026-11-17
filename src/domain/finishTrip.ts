import { orderEntries } from './listOrder'
import type { Amount, Item, ListEntry, Trip, TripLine } from './types'

type TripDetails = Pick<Trip, 'total' | 'note'>

type FiledTrip = Omit<Trip, 'receiptPhotoIds'>

type FinishInput = {
  entries: ListEntry[]
  items: Item[]
  tripId: string
  startedAt: number
  finishedAt: number
  details: TripDetails
}

type UsualAmount = { itemId: string; amount: Amount }

type FinishedTrip = {
  trip: FiledTrip | undefined
  keptEntries: ListEntry[]
  removedEntryIds: string[]
  usualAmounts: UsualAmount[]
}

const isFiled = ({ state }: ListEntry) => state === 'taken' || state === 'missing'

export const filesATrip = (entries: ListEntry[]) => entries.some(isFiled)

function tripLine(entry: ListEntry, name: string): TripLine {
  const { itemId, amount, price } = entry

  return entry.state === 'taken' ? { itemId, name, amount, state: 'taken', price } : { itemId, name, amount, state: 'missing' }
}

const keptEntry = (entry: ListEntry): ListEntry => {
  const { missedLastTrip: _missedLastTrip, price: _price, takenAt: _takenAt, ...kept } = entry

  return entry.state === 'missing' ? { ...kept, state: 'waiting', missedLastTrip: true } : kept
}

export function finishTrip({ entries, items, tripId, startedAt, finishedAt, details }: FinishInput): FinishedTrip {
  if (!filesATrip(entries)) {
    return { trip: undefined, keptEntries: entries, removedEntryIds: [], usualAmounts: [] }
  }

  const namesById = new Map(items.map(({ id, name }) => [id, name]))
  const taken = orderEntries(entries.filter(({ state }) => state === 'taken'))
  const missing = orderEntries(entries.filter(({ state }) => state === 'missing'))

  const lines = [...taken, ...missing].flatMap((entry) => {
    const name = namesById.get(entry.itemId)

    return name === undefined ? [] : [tripLine(entry, name)]
  })

  return {
    trip: { id: tripId, startedAt, finishedAt, ...details, lines },
    keptEntries: entries.filter(({ state }) => state !== 'taken').map(keptEntry),
    removedEntryIds: taken.map(({ id }) => id),
    usualAmounts: taken.map(({ itemId, amount }) => ({ itemId, amount })),
  }
}
