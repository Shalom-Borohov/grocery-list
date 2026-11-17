import { describe, expect, it } from 'vitest'
import { itemsById, withItems } from '../../src/domain/itemJoin'
import { item } from '../helpers/records'

const milk = item({ id: 'milk', name: 'חלב' })

const eggs = item({ id: 'eggs', name: 'ביצים' })

describe('joining records to their items', () => {
  it('finds an item by its id', () => {
    const byId = itemsById([milk, eggs])

    expect(byId.get('eggs')).toBe(eggs)
    expect(byId.get('bread')).toBeUndefined()
  })

  it('pairs each record with its item, in the records order, and leaves out records whose item is gone', () => {
    const records = [
      { itemId: 'eggs', note: 'first' },
      { itemId: 'bread', note: 'gone' },
      { itemId: 'milk', note: 'last' },
    ]

    expect(withItems(records, [milk, eggs])).toEqual([
      { record: records[0], item: eggs },
      { record: records[2], item: milk },
    ])
  })
})
