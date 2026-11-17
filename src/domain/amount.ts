import { type Amount, type Item, LARGEST_QUANTITY, type Unit } from './types'

const PLAIN_QUANTITY = 1

const UNIT_STEPS: Record<Unit, number> = { unit: 1, kilogram: 0.5, gram: 100, liter: 1 }

const UNIT_STARTS: Record<Unit, number> = { unit: 1, kilogram: 1, gram: 100, liter: 1 }

const QUANTITY_PRECISION = 1000

const roundQuantity = (quantity: number) => Math.round(quantity * QUANTITY_PRECISION) / QUANTITY_PRECISION

type StepDirection = 1 | -1

export function stepAmount({ quantity, unit }: Amount, direction: StepDirection): Amount {
  const step = UNIT_STEPS[unit]
  const stepped = roundQuantity(quantity + direction * step)

  return { quantity: stepped < step || stepped > LARGEST_QUANTITY ? quantity : stepped, unit }
}

export const canStepDown = ({ quantity, unit }: Amount) => quantity - UNIT_STEPS[unit] >= UNIT_STEPS[unit]

export const canStepUp = ({ quantity, unit }: Amount) => roundQuantity(quantity + UNIT_STEPS[unit]) <= LARGEST_QUANTITY

export const withUnit = (amount: Amount, unit: Unit): Amount =>
  amount.unit === unit ? amount : { quantity: UNIT_STARTS[unit], unit }

export const DEFAULT_AMOUNT: Amount = { quantity: PLAIN_QUANTITY, unit: 'unit' }

export const amountForNewEntry = (item: Item) => item.usualAmount ?? DEFAULT_AMOUNT

export const isPlainAmount = ({ quantity, unit }: Amount) => quantity === PLAIN_QUANTITY && unit === 'unit'
