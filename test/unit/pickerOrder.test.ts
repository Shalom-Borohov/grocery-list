import { describe, expect, it } from 'vitest'
import { findItemByName } from '../../src/domain/itemNames'
import { pickerItems, tapTakesOff, usualInPicker } from '../../src/domain/pickerOrder'
import { timesTakenByItem } from '../../src/domain/usualHints'
import { entry, item, line, trip } from '../helpers/records'

const items = [
  item({ id: 'rice', name: 'אורז בסמטי' }),
  item({ id: 'milk', name: 'חלב 3%' }),
  item({ id: 'eggs', name: 'ביצים L' }),
  item({ id: 'tahini', name: 'טחינה גולמית' }),
  item({ id: 'cucumbers', name: 'מלפפונים' }),
]

const trips = [
  trip({ id: 'one', finishedAt: 1, lines: [line({ itemId: 'milk', name: 'חלב 3%' }), line({ itemId: 'eggs', name: 'ביצים L' })] }),
  trip({ id: 'two', finishedAt: 2, lines: [line({ itemId: 'milk', name: 'חלב 3%' })] }),
  trip({ id: 'three', finishedAt: 3, lines: [line({ itemId: 'tahini', name: 'טחינה גולמית', state: 'missing' })] }),
]

const idsOf = (picked: { id: string }[]) => picked.map(({ id }) => id)

const timesTaken = timesTakenByItem(trips)

describe('the add picker', () => {
  it('lists the most often bought first, then the rest in alphabetical order', () => {
    expect(idsOf(pickerItems(items, timesTaken, ''))).toEqual(['milk', 'eggs', 'rice', 'tahini', 'cucumbers'])
  })

  it('searches part of a name', () => {
    expect(idsOf(pickerItems(items, timesTaken, ' בסמ '))).toEqual(['rice'])
  })

  it('leaves out of "בדרך כלל" what was listed when the sheet opened, and keeps what was added in this opening', () => {
    const usual = ['milk', 'eggs', 'bread']

    expect(usualInPicker(usual, new Set(['eggs']))).toEqual(['milk', 'bread'])
  })

  it('keeps an item listed at opening out of "בדרך כלל" even after it is taken off the list', () => {
    expect(usualInPicker(['milk', 'eggs'], new Set(['eggs', 'milk']))).toEqual([])
  })

  it('takes a row off the list only while it waits, never one taken or missing in the shop', () => {
    expect(tapTakesOff(entry({ id: 'one', itemId: 'milk' }))).toBe(true)
    expect(tapTakesOff(entry({ id: 'one', itemId: 'milk', state: 'taken' }))).toBe(false)
    expect(tapTakesOff(entry({ id: 'one', itemId: 'milk', state: 'missing' }))).toBe(false)
  })
})

describe('item names', () => {
  it('finds an item by its name, ignoring spaces around it and letter case', () => {
    expect(findItemByName(items, '  ביצים l ')?.id).toBe('eggs')
    expect(findItemByName(items, 'ביצים')).toBeUndefined()
  })
})
