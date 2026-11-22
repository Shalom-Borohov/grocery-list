import { describe, expect, it } from 'vitest'
import { takenTotal } from '../../src/domain/takenTotal'
import { amount, entry, packOf } from '../helpers/records'

describe('the total of what was taken', () => {
  it('adds each taken row as its price for one unit times its amount', () => {
    const estimate = takenTotal([
      entry({ id: 'milk', itemId: 'milk', state: 'taken', amount: amount(2), price: 6.9 }),
      entry({ id: 'tomatoes', itemId: 'tomatoes', state: 'taken', amount: amount(1.5, 'kilogram'), price: 8.9 }),
    ])

    expect(estimate).toEqual({ total: 27.15, pricedCount: 2 })
  })

  it('counts a pack row as its price for one pack times the number of packs', () => {
    const estimate = takenTotal([
      entry({ id: 'soap', itemId: 'soap', state: 'taken', amount: packOf(2, 4), price: 19.9 }),
    ])

    expect(estimate.total).toBe(39.8)
  })

  it('counts a row weighed in grams once, since its price is for the whole pack', () => {
    const estimate = takenTotal([
      entry({ id: 'cheese', itemId: 'cheese', state: 'taken', amount: amount(200, 'gram'), price: 12.9 }),
    ])

    expect(estimate.total).toBe(12.9)
  })

  it('leaves out rows still waiting, rows the shop did not have and taken rows without a price', () => {
    const estimate = takenTotal([
      entry({ id: 'milk', itemId: 'milk', state: 'taken', price: 6.9 }),
      entry({ id: 'bread', itemId: 'bread', state: 'taken' }),
      entry({ id: 'eggs', itemId: 'eggs', state: 'waiting', price: 15 }),
      entry({ id: 'coffee', itemId: 'coffee', state: 'missing', price: 30 }),
    ])

    expect(estimate).toEqual({ total: 6.9, pricedCount: 1 })
  })

  it('rounds the sum to agorot', () => {
    const estimate = takenTotal([entry({ id: 'gum', itemId: 'gum', state: 'taken', amount: amount(3), price: 0.1 })])

    expect(estimate.total).toBe(0.3)
  })

  it('has no total when no taken row has a price', () => {
    const estimate = takenTotal([
      entry({ id: 'bread', itemId: 'bread', state: 'taken' }),
      entry({ id: 'eggs', itemId: 'eggs', state: 'waiting', price: 15 }),
    ])

    expect(estimate).toEqual({ total: undefined, pricedCount: 0 })
  })

  it('has no total when the sum is above the largest price a total can hold', () => {
    const estimate = takenTotal([
      entry({ id: 'tv', itemId: 'tv', state: 'taken', amount: amount(2), price: 60_000 }),
    ])

    expect(estimate.total).toBeUndefined()
  })
})
