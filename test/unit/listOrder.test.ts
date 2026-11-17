import { describe, expect, it } from 'vitest'
import { entryCounts, orderEntries } from '../../src/domain/listOrder'
import { entry } from '../helpers/records'

describe('the list in the shop', () => {
  it('shows what is left to take first, in the order it was added, and taken items last', () => {
    const entries = [
      entry({ id: 'milk', itemId: 'milk', addedAt: 3 }),
      entry({ id: 'bread', itemId: 'bread', addedAt: 1, state: 'taken', takenAt: 9 }),
      entry({ id: 'eggs', itemId: 'eggs', addedAt: 2 }),
      entry({ id: 'tahini', itemId: 'tahini', addedAt: 4, state: 'missing' }),
      entry({ id: 'rice', itemId: 'rice', addedAt: 5, state: 'taken', takenAt: 7 }),
    ]

    expect(orderEntries(entries).map(({ id }) => id)).toEqual(['eggs', 'milk', 'tahini', 'rice', 'bread'])
  })

  it('counts what is left, what is in the cart and what the shop did not have', () => {
    const entries = [
      entry({ id: 'milk', itemId: 'milk' }),
      entry({ id: 'eggs', itemId: 'eggs' }),
      entry({ id: 'bread', itemId: 'bread', state: 'taken' }),
      entry({ id: 'tahini', itemId: 'tahini', state: 'missing' }),
    ]

    expect(entryCounts(entries)).toEqual({ waiting: 2, taken: 1, missing: 1 })
  })
})
