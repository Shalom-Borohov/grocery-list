import { describe, expect, it } from 'vitest'
import { canStepDown, canStepUp, stepAmount } from '../../src/domain/amount'
import { amount, packOf } from '../helpers/records'

describe('stepping an amount', () => {
  it('steps down from a typed number while the result stays above 0', () => {
    expect(stepAmount(amount(150, 'gram'), -1)).toEqual(amount(50, 'gram'))
    expect(stepAmount(amount(1.5, 'liter'), -1)).toEqual(amount(0.5, 'liter'))
    expect(stepAmount(amount(0.7, 'kilogram'), -1)).toEqual(amount(0.2, 'kilogram'))
    expect(canStepDown(amount(150, 'gram'))).toBe(true)
    expect(canStepDown(amount(0.7, 'kilogram'))).toBe(true)
  })

  it('stops − where a step would reach 0 or below', () => {
    expect(canStepDown(amount(100, 'gram'))).toBe(false)
    expect(canStepDown(amount(50, 'gram'))).toBe(false)
    expect(canStepDown(amount(0.5, 'kilogram'))).toBe(false)
    expect(canStepDown(amount(1))).toBe(false)
    expect(canStepDown(packOf(1, 6))).toBe(false)
    expect(stepAmount(amount(50, 'gram'), -1)).toEqual(amount(50, 'gram'))
  })

  it('steps up from a typed number up to ten thousand', () => {
    expect(stepAmount(amount(250, 'gram'), 1)).toEqual(amount(350, 'gram'))
    expect(stepAmount(amount(1.2, 'kilogram'), 1)).toEqual(amount(1.7, 'kilogram'))
    expect(canStepUp(amount(9950, 'gram'))).toBe(false)
    expect(stepAmount(amount(9950, 'gram'), 1)).toEqual(amount(9950, 'gram'))
  })
})
