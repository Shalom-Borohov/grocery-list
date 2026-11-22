import { describe, expect, it } from 'vitest'
import {
  amountForNewEntry,
  canStepPackSize,
  canStepUp,
  isPlainAmount,
  stepAmount,
  stepPackSize,
  withUnit,
} from '../../src/domain/amount'
import { entriesToPour } from '../../src/domain/pourSet'
import { amount, entry, item, packOf, savedSet } from '../helpers/records'

describe('the amount an item is added with', () => {
  it('is the amount taken last time, or one unit for an item never bought', () => {
    expect(amountForNewEntry(item({ id: 'milk', name: 'חלב', usualAmount: amount(2, 'liter') }))).toEqual(amount(2, 'liter'))
    expect(amountForNewEntry(item({ id: 'bread', name: 'לחם' }))).toEqual(amount(1))
  })

  it('is not worth showing when it is one unit', () => {
    expect(isPlainAmount(amount(1))).toBe(true)
    expect(isPlainAmount(amount(1, 'kilogram'))).toBe(false)
    expect(isPlainAmount(amount(2))).toBe(false)
  })
})

describe('stepping an amount', () => {
  it('steps units and liters by one, kilos by half and grams by a hundred', () => {
    expect(stepAmount(amount(2), 1)).toEqual(amount(3))
    expect(stepAmount(amount(1, 'kilogram'), 1)).toEqual(amount(1.5, 'kilogram'))
    expect(stepAmount(amount(500, 'gram'), -1)).toEqual(amount(400, 'gram'))
    expect(stepAmount(amount(1, 'liter'), 1)).toEqual(amount(2, 'liter'))
  })

  it('never steps below one step', () => {
    expect(stepAmount(amount(1), -1)).toEqual(amount(1))
    expect(stepAmount(amount(0.5, 'kilogram'), -1)).toEqual(amount(0.5, 'kilogram'))
    expect(stepAmount(amount(0.3, 'kilogram'), -1)).toEqual(amount(0.3, 'kilogram'))
  })

  it('never steps above the largest amount a list entry can hold', () => {
    expect(stepAmount(amount(10_000), 1)).toEqual(amount(10_000))
    expect(stepAmount(amount(9_950, 'gram'), 1)).toEqual(amount(9_950, 'gram'))
    expect(canStepUp(amount(10_000))).toBe(false)
    expect(canStepUp(amount(9_999))).toBe(true)
  })

  it('starts a new unit at its usual first amount, and leaves the amount alone when the unit stays', () => {
    expect(withUnit(amount(3), 'gram')).toEqual(amount(100, 'gram'))
    expect(withUnit(amount(3), 'kilogram')).toEqual(amount(1, 'kilogram'))
    expect(withUnit(amount(3, 'liter'), 'liter')).toEqual(amount(3, 'liter'))
  })
})

describe('a pack', () => {
  it('starts as one pack of 2, and goes back to a plain unit without its size', () => {
    expect(withUnit(amount(3), 'pack')).toEqual(packOf(1, 2))
    expect(withUnit(packOf(2, 6), 'pack')).toEqual(packOf(2, 6))
    expect(withUnit(packOf(2, 6), 'unit')).toEqual(amount(1))
  })

  it('counts packs one at a time and keeps how many are in each', () => {
    expect(stepAmount(packOf(1, 4), 1)).toEqual(packOf(2, 4))
    expect(stepAmount(packOf(1, 4), -1)).toEqual(packOf(1, 4))
    expect(isPlainAmount(packOf(1, 4))).toBe(false)
  })

  it('holds between 2 and 99, one at a time', () => {
    expect(stepPackSize(packOf(1, 4), 1)).toEqual(packOf(1, 5))
    expect(stepPackSize(packOf(1, 2), -1)).toEqual(packOf(1, 2))
    expect(stepPackSize(packOf(1, 99), 1)).toEqual(packOf(1, 99))
    expect(canStepPackSize(packOf(1, 2), -1)).toBe(false)
    expect(canStepPackSize(packOf(1, 3), -1)).toBe(true)
    expect(canStepPackSize(packOf(1, 99), 1)).toBe(false)
    expect(canStepPackSize(packOf(1, 98), 1)).toBe(true)
  })
})

describe('pouring a set into the list', () => {
  it('adds only the set items that are not on the list yet, with the set amounts', () => {
    const weekly = savedSet({
      id: 'weekly',
      name: 'בסיס',
      entries: [
        { itemId: 'milk', amount: amount(2, 'liter') },
        { itemId: 'eggs', amount: amount(12) },
      ],
    })

    const onList = [entry({ id: 'one', itemId: 'eggs', amount: amount(6) })]

    expect(entriesToPour(weekly, onList)).toEqual([{ itemId: 'milk', amount: amount(2, 'liter') }])
  })

  it('treats an item taken in this trip as already on the list', () => {
    const weekly = savedSet({ id: 'weekly', name: 'בסיס', entries: [{ itemId: 'milk', amount: amount(2, 'liter') }] })

    expect(entriesToPour(weekly, [entry({ id: 'one', itemId: 'milk', state: 'taken' })])).toEqual([])
  })
})
