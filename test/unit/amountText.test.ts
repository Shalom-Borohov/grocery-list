import { describe, expect, it } from 'vitest'
import { INVALID_AMOUNT, parsePackSizeText, parseQuantityText } from '../../src/domain/amount'

describe('typed quantity', () => {
  it('reads whole numbers in יח׳, גרם and אריזה', () => {
    expect(parseQuantityText('250', 'gram')).toBe(250)
    expect(parseQuantityText(' 3 ', 'unit')).toBe(3)
    expect(parseQuantityText('2', 'pack')).toBe(2)
  })

  it('calls a fraction invalid where only whole numbers go', () => {
    expect(parseQuantityText('1.5', 'unit')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('250,5', 'gram')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('1.', 'pack')).toBe(INVALID_AMOUNT)
  })

  it('reads up to three decimals in ק״ג and ליטר, with a point or a comma', () => {
    expect(parseQuantityText('1.2', 'kilogram')).toBe(1.2)
    expect(parseQuantityText('1,2', 'kilogram')).toBe(1.2)
    expect(parseQuantityText('0.75', 'liter')).toBe(0.75)
    expect(parseQuantityText('0.125', 'kilogram')).toBe(0.125)
    expect(parseQuantityText('1.2345', 'kilogram')).toBe(INVALID_AMOUNT)
  })

  it('reads a number still being typed, with its point at the end', () => {
    expect(parseQuantityText('1.', 'liter')).toBe(1)
    expect(parseQuantityText('1,', 'kilogram')).toBe(1)
  })

  it('reads blank text as nothing typed yet', () => {
    expect(parseQuantityText('', 'gram')).toBeUndefined()
    expect(parseQuantityText('  ', 'kilogram')).toBeUndefined()
  })

  it('calls zero, letters, signs and more than ten thousand invalid', () => {
    expect(parseQuantityText('0', 'unit')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('0.000', 'kilogram')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('abc', 'unit')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('-2', 'unit')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('.', 'liter')).toBe(INVALID_AMOUNT)
    expect(parseQuantityText('10000', 'gram')).toBe(10_000)
    expect(parseQuantityText('10001', 'gram')).toBe(INVALID_AMOUNT)
  })
})

describe('typed pack size', () => {
  it('reads a whole number from 2 to 99', () => {
    expect(parsePackSizeText('2')).toBe(2)
    expect(parsePackSizeText(' 24 ')).toBe(24)
    expect(parsePackSizeText('99')).toBe(99)
  })

  it('reads blank text as nothing typed yet', () => {
    expect(parsePackSizeText('')).toBeUndefined()
  })

  it('calls anything outside 2 to 99, or not whole, invalid', () => {
    expect(parsePackSizeText('1')).toBe(INVALID_AMOUNT)
    expect(parsePackSizeText('100')).toBe(INVALID_AMOUNT)
    expect(parsePackSizeText('2.5')).toBe(INVALID_AMOUNT)
    expect(parsePackSizeText('12,')).toBe(INVALID_AMOUNT)
  })
})
