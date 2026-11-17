import { describe, expect, it } from 'vitest'
import { timesTakenByItem, usualItemIds } from '../../src/domain/usualHints'
import { line, trip } from '../helpers/records'

const tripTaking = (finishedAt: number, itemIds: string[]) =>
  trip({ id: `trip-${finishedAt}`, finishedAt, lines: itemIds.map((itemId) => line({ itemId, name: itemId })) })

describe('what you usually buy', () => {
  it('offers nothing before the third trip', () => {
    const trips = [tripTaking(1, ['milk']), tripTaking(2, ['milk'])]

    expect(usualItemIds(trips)).toEqual([])
  })

  it('offers an item taken on at least half of the trips, most often bought first', () => {
    const trips = [tripTaking(1, ['milk', 'eggs']), tripTaking(2, ['milk', 'bread']), tripTaking(3, ['milk', 'eggs'])]

    expect(usualItemIds(trips)).toEqual(['milk', 'eggs'])
  })

  it('counts only the last six trips, where exactly half is enough', () => {
    const trips = [
      tripTaking(1, ['eggs', 'rice']),
      tripTaking(2, ['eggs']),
      tripTaking(3, ['eggs', 'rice']),
      tripTaking(4, ['bread']),
      tripTaking(5, ['eggs', 'rice']),
      tripTaking(6, ['bread']),
      tripTaking(7, ['bread']),
    ]

    expect(usualItemIds(trips)).toEqual(['bread', 'eggs'])
  })

  it('leaves out items the shop did not have', () => {
    const missingTahini = trip({
      id: 'missing',
      finishedAt: 4,
      lines: [line({ itemId: 'tahini', name: 'tahini', state: 'missing' })],
    })

    const trips = [tripTaking(1, ['milk', 'tahini']), tripTaking(2, ['milk']), tripTaking(3, ['milk']), missingTahini]

    expect(usualItemIds(trips)).toEqual(['milk'])
  })

  it('counts the trips each item was taken on', () => {
    const missingMilk = trip({ id: 'missing', finishedAt: 3, lines: [line({ itemId: 'milk', name: 'milk', state: 'missing' })] })

    expect(timesTakenByItem([tripTaking(1, ['milk', 'eggs']), tripTaking(2, ['milk']), missingMilk])).toEqual(
      new Map([
        ['milk', 2],
        ['eggs', 1],
      ]),
    )
  })
})
