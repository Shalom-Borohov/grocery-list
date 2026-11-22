import {
  type Amount,
  isPackSize,
  type Item,
  LARGEST_QUANTITY,
  type PackAmount,
  SMALLEST_PACK_SIZE,
  type Unit,
} from './types'

const PLAIN_QUANTITY = 1

const UNIT_STEPS: Record<Unit, number> = { unit: 1, pack: 1, kilogram: 0.5, gram: 100, liter: 1 }

const UNIT_STARTS: Record<Unit, Amount> = {
  unit: { quantity: 1, unit: 'unit' },
  pack: { quantity: 1, unit: 'pack', packSize: SMALLEST_PACK_SIZE },
  kilogram: { quantity: 1, unit: 'kilogram' },
  gram: { quantity: 100, unit: 'gram' },
  liter: { quantity: 1, unit: 'liter' },
}

const PACK_SIZE_STEP = 1

const QUANTITY_PRECISION = 1000

const roundQuantity = (quantity: number) => Math.round(quantity * QUANTITY_PRECISION) / QUANTITY_PRECISION

export type StepDirection = 1 | -1

export function stepAmount(amount: Amount, direction: StepDirection): Amount {
  const { quantity, unit } = amount
  const step = UNIT_STEPS[unit]
  const stepped = roundQuantity(quantity + direction * step)

  return { ...amount, quantity: stepped < step || stepped > LARGEST_QUANTITY ? quantity : stepped }
}

export const canStepDown = ({ quantity, unit }: Amount) => quantity - UNIT_STEPS[unit] >= UNIT_STEPS[unit]

export const canStepUp = ({ quantity, unit }: Amount) => roundQuantity(quantity + UNIT_STEPS[unit]) <= LARGEST_QUANTITY

const steppedPackSize = ({ packSize }: PackAmount, direction: StepDirection) => packSize + direction * PACK_SIZE_STEP

export const canStepPackSize = (pack: PackAmount, direction: StepDirection) => isPackSize(steppedPackSize(pack, direction))

export function stepPackSize(pack: PackAmount, direction: StepDirection): PackAmount {
  const packSize = steppedPackSize(pack, direction)

  return isPackSize(packSize) ? { ...pack, packSize } : pack
}

export const withUnit = (amount: Amount, unit: Unit): Amount => (amount.unit === unit ? amount : UNIT_STARTS[unit])

export const DEFAULT_AMOUNT: Amount = { quantity: PLAIN_QUANTITY, unit: 'unit' }

export const amountForNewEntry = (item: Item) => item.usualAmount ?? DEFAULT_AMOUNT

export const isPlainAmount = ({ quantity, unit }: Amount) => quantity === PLAIN_QUANTITY && unit === 'unit'
