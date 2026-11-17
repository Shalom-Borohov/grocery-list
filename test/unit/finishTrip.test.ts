import { describe, expect, it } from 'vitest'
import { filesATrip, finishTrip } from '../../src/domain/finishTrip'
import { amount, entry, item } from '../helpers/records'

const STARTED_AT = 1_000

const FINISHED_AT = 2_000

const items = [
  item({ id: 'milk', name: 'חלב 3%' }),
  item({ id: 'tahini', name: 'טחינה גולמית' }),
  item({ id: 'coffee', name: 'קפה טחון' }),
]

const finish = (entries: Parameters<typeof finishTrip>[0]['entries']) =>
  finishTrip({
    entries,
    items,
    tripId: 'trip',
    startedAt: STARTED_AT,
    finishedAt: FINISHED_AT,
    details: { total: 412.3, note: 'עמוס' },
  })

describe('finishing a trip', () => {
  it('files what was taken and what the shop did not have, with the details from the finish sheet', () => {
    const { trip } = finish([
      entry({ id: 'one', itemId: 'milk', state: 'taken', amount: amount(2, 'liter'), price: 6.9 }),
      entry({ id: 'two', itemId: 'tahini', state: 'missing' }),
      entry({ id: 'three', itemId: 'coffee' }),
    ])

    expect(trip).toEqual({
      id: 'trip',
      startedAt: STARTED_AT,
      finishedAt: FINISHED_AT,
      total: 412.3,
      note: 'עמוס',
      lines: [
        { itemId: 'milk', name: 'חלב 3%', amount: amount(2, 'liter'), state: 'taken', price: 6.9 },
        { itemId: 'tahini', name: 'טחינה גולמית', amount: amount(1), state: 'missing' },
      ],
    })
  })

  it('files lines in the order the items were taken, then the ones the shop did not have, whatever order the list is stored in', () => {
    const { trip } = finish([
      entry({ id: 'zz', itemId: 'tahini', state: 'missing', addedAt: 1 }),
      entry({ id: 'yy', itemId: 'coffee', state: 'taken', takenAt: 20 }),
      entry({ id: 'aa', itemId: 'milk', state: 'taken', takenAt: 10 }),
    ])

    expect(trip?.lines.map(({ itemId }) => itemId)).toEqual(['milk', 'coffee', 'tahini'])
  })

  it('takes taken items off the list and keeps the rest, marking what the shop did not have', () => {
    const waiting = entry({ id: 'three', itemId: 'coffee' })

    const { removedEntryIds, keptEntries } = finish([
      entry({ id: 'one', itemId: 'milk', state: 'taken' }),
      entry({ id: 'two', itemId: 'tahini', state: 'missing', price: 12 }),
      waiting,
    ])

    expect(removedEntryIds).toEqual(['one'])
    expect(keptEntries).toEqual([
      entry({ id: 'two', itemId: 'tahini', state: 'waiting', missedLastTrip: true }),
      waiting,
    ])
  })

  it('clears "not there last time" from an item left waiting, since the trip just filed is now the last one', () => {
    const { keptEntries } = finish([
      entry({ id: 'one', itemId: 'milk', state: 'taken' }),
      entry({ id: 'two', itemId: 'coffee', missedLastTrip: true }),
    ])

    expect(keptEntries).toEqual([entry({ id: 'two', itemId: 'coffee' })])
  })

  it('drops a price typed on an item left waiting, so it is never filed on a later trip unconfirmed', () => {
    const { keptEntries } = finish([
      entry({ id: 'one', itemId: 'milk', state: 'taken' }),
      entry({ id: 'two', itemId: 'coffee', price: 32.9 }),
    ])

    expect(keptEntries).toEqual([entry({ id: 'two', itemId: 'coffee' })])
  })

  it('remembers the amount taken as the item usual amount', () => {
    const { usualAmounts } = finish([
      entry({ id: 'one', itemId: 'milk', state: 'taken', amount: amount(2, 'liter') }),
      entry({ id: 'two', itemId: 'tahini', state: 'missing', amount: amount(3) }),
    ])

    expect(usualAmounts).toEqual([{ itemId: 'milk', amount: amount(2, 'liter') }])
  })

  it('files nothing and changes nothing when nothing was taken or marked missing', () => {
    const waiting = entry({ id: 'one', itemId: 'milk' })

    expect(finish([waiting])).toEqual({ trip: undefined, keptEntries: [waiting], removedEntryIds: [], usualAmounts: [] })
  })

  it('files a trip only when something was taken or marked missing', () => {
    expect(filesATrip([entry({ id: 'one', itemId: 'milk' })])).toBe(false)
    expect(filesATrip([entry({ id: 'one', itemId: 'milk', state: 'taken' })])).toBe(true)
    expect(filesATrip([entry({ id: 'one', itemId: 'milk', state: 'missing' })])).toBe(true)
    expect(filesATrip([])).toBe(false)
  })
})
