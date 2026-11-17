import { describe, expect, it } from 'vitest'
import { itemHistory, lastPrice } from '../../src/domain/itemHistory'
import { line, trip } from '../helpers/records'

const tomatoes = (fields: Partial<Parameters<typeof line>[0]>) => line({ itemId: 'tomatoes', name: 'עגבניות שרי', ...fields })

const trips = [
  trip({ id: 'oct-1', finishedAt: 100, lines: [tomatoes({ price: 7.9 })] }),
  trip({ id: 'oct-15', finishedAt: 200, lines: [tomatoes({ state: 'missing' })] }),
  trip({ id: 'oct-29', finishedAt: 300, lines: [tomatoes({ price: 8.9 })] }),
  trip({ id: 'nov-5', finishedAt: 400, lines: [tomatoes({})] }),
  trip({ id: 'nov-12', finishedAt: 500, lines: [tomatoes({ price: 9.9 }), line({ itemId: 'milk', name: 'חלב', price: 50 })] }),
  trip({ id: 'nov-14', finishedAt: 600, lines: [line({ itemId: 'milk', name: 'חלב' })] }),
]

describe('an item history', () => {
  it('counts the trips it was bought on and the ones the shop did not have it, and when it was last bought', () => {
    expect(itemHistory('tomatoes', trips)).toMatchObject({ timesBought: 4, timesMissing: 1, lastBoughtAt: 500 })
  })

  it('lists recorded prices newest first, each as a share of the highest', () => {
    expect(itemHistory('tomatoes', trips).prices).toEqual([
      { finishedAt: 500, price: 9.9, share: 1 },
      { finishedAt: 300, price: 8.9, share: 8.9 / 9.9 },
      { finishedAt: 100, price: 7.9, share: 7.9 / 9.9 },
    ])
  })

  it('is empty for an item never bought', () => {
    expect(itemHistory('bread', trips)).toEqual({ timesBought: 0, timesMissing: 0, lastBoughtAt: undefined, prices: [] })
  })

  it('gives the newest recorded price, whatever order the trips are in', () => {
    expect(lastPrice('tomatoes', trips.toReversed())).toBe(9.9)
    expect(lastPrice('milk', trips)).toBe(50)
    expect(lastPrice('bread', trips)).toBeUndefined()
  })
})
