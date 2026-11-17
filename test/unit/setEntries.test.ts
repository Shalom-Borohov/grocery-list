import { describe, expect, it } from 'vitest'
import {
  isInSet,
  setEntriesFromList,
  setEntriesFromTrip,
  setItemsInOrder,
  setsInOrder,
  withAmount,
  withItemToggled,
  withoutItem,
} from '../../src/domain/setEntries'
import { amount, entry, item, line, savedSet, trip } from '../helpers/records'

const milkEntry = { itemId: 'milk', amount: amount(2, 'liter') }

const eggsEntry = { itemId: 'eggs', amount: amount(12) }

describe('editing a set', () => {
  it('changes the amount of one item', () => {
    expect(withAmount([milkEntry, eggsEntry], 'eggs', amount(6))).toEqual([milkEntry, { itemId: 'eggs', amount: amount(6) }])
  })

  it('removes an item', () => {
    expect(withoutItem([milkEntry, eggsEntry], 'milk')).toEqual([eggsEntry])
  })

  it('tells whether an item is in the set', () => {
    expect(isInSet([milkEntry], 'milk')).toBe(true)
    expect(isInSet([milkEntry], 'eggs')).toBe(false)
  })

  it('toggles an item: adds it with the amount it is added to the list with, or takes it out', () => {
    const coffee = item({ id: 'coffee', name: 'קפה', usualAmount: amount(2) })

    expect(withItemToggled([milkEntry], coffee)).toEqual([milkEntry, { itemId: 'coffee', amount: amount(2) }])
    expect(withItemToggled([milkEntry], item({ id: 'milk', name: 'חלב' }))).toEqual([])
  })

  it('makes set entries from the list with the amounts on the list', () => {
    const listed = [entry({ id: 'one', itemId: 'milk', amount: amount(3, 'liter'), state: 'taken', price: 6.9 })]

    expect(setEntriesFromList(listed)).toEqual([{ itemId: 'milk', amount: amount(3, 'liter') }])
  })

  it('makes set entries from a trip: the items taken on it that still exist, with the amounts bought', () => {
    const filed = trip({
      id: 'trip',
      finishedAt: 1,
      lines: [
        line({ itemId: 'milk', name: 'חלב', amount: amount(2, 'liter'), price: 6.9 }),
        line({ itemId: 'tahini', name: 'טחינה', state: 'missing' }),
        line({ itemId: 'gone', name: 'נמחק' }),
      ],
    })

    expect(setEntriesFromTrip(filed, [item({ id: 'milk', name: 'חלב' }), item({ id: 'tahini', name: 'טחינה' })])).toEqual([
      { itemId: 'milk', amount: amount(2, 'liter') },
    ])
  })
})

describe('set order', () => {
  it('puts sets in the order they were made, oldest first', () => {
    const friday = savedSet({ id: 'friday', name: 'שישי', createdAt: 20 })
    const basics = savedSet({ id: 'basics', name: 'בסיס', createdAt: 10 })

    expect(setsInOrder([friday, basics]).map(({ id }) => id)).toEqual(['basics', 'friday'])
  })

  it('lists the items of a set alphabetically, without items that are gone', () => {
    const basics = savedSet({ id: 'basics', name: 'בסיס', entries: [milkEntry, { itemId: 'gone', amount: amount(1) }, eggsEntry] })
    const items = [item({ id: 'milk', name: 'חלב' }), item({ id: 'eggs', name: 'ביצים' })]

    expect(setItemsInOrder(basics, items).map(({ item: setItem, setEntry }) => [setItem.name, setEntry])).toEqual([
      ['ביצים', eggsEntry],
      ['חלב', milkEntry],
    ])
  })
})
