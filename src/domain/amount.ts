import {
  type Amount,
  isPackSize,
  isQuantity,
  type Item,
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

export const QUANTITY_FRACTION_DIGITS = 3

const QUANTITY_PRECISION = 10 ** QUANTITY_FRACTION_DIGITS

const FRACTION_UNITS: ReadonlySet<Unit> = new Set(['kilogram', 'liter'])

const WHOLE_TEXT_PATTERN = /^\d+$/

const FRACTION_TEXT_PATTERN = new RegExp(
  `^(\\d+([.,]\\d{0,${QUANTITY_FRACTION_DIGITS}})?|[.,]\\d{1,${QUANTITY_FRACTION_DIGITS}})$`,
)

const DECIMAL_COMMA = ','

const DECIMAL_POINT = '.'

export const INVALID_AMOUNT = 'invalid'

export type ParsedNumber = number | undefined | typeof INVALID_AMOUNT

const roundQuantity = (quantity: number) => Math.round(quantity * QUANTITY_PRECISION) / QUANTITY_PRECISION

export type StepDirection = 1 | -1

const steppedQuantity = ({ quantity, unit }: Amount, direction: StepDirection) =>
  roundQuantity(quantity + direction * UNIT_STEPS[unit])

const canStep = (amount: Amount, direction: StepDirection) => isQuantity(steppedQuantity(amount, direction))

export function stepAmount(amount: Amount, direction: StepDirection): Amount {
  return canStep(amount, direction) ? { ...amount, quantity: steppedQuantity(amount, direction) } : amount
}

export const canStepDown = (amount: Amount) => canStep(amount, -1)

export const canStepUp = (amount: Amount) => canStep(amount, 1)

const steppedPackSize = ({ packSize }: PackAmount, direction: StepDirection) => packSize + direction * PACK_SIZE_STEP

export const canStepPackSize = (pack: PackAmount, direction: StepDirection) => isPackSize(steppedPackSize(pack, direction))

export function stepPackSize(pack: PackAmount, direction: StepDirection): PackAmount {
  const packSize = steppedPackSize(pack, direction)

  return isPackSize(packSize) ? { ...pack, packSize } : pack
}

export const allowsFraction = (unit: Unit) => FRACTION_UNITS.has(unit)

function parseNumberText(text: string, pattern: RegExp, isAllowed: (parsed: number) => boolean): ParsedNumber {
  const trimmed = text.trim()

  if (!trimmed) {
    return undefined
  }

  if (!pattern.test(trimmed)) {
    return INVALID_AMOUNT
  }

  const parsed = Number(trimmed.replace(DECIMAL_COMMA, DECIMAL_POINT))

  return isAllowed(parsed) ? parsed : INVALID_AMOUNT
}

export const parseQuantityText = (text: string, unit: Unit) =>
  parseNumberText(text, allowsFraction(unit) ? FRACTION_TEXT_PATTERN : WHOLE_TEXT_PATTERN, isQuantity)

export const parsePackSizeText = (text: string) => parseNumberText(text, WHOLE_TEXT_PATTERN, isPackSize)

export const withUnit = (amount: Amount, unit: Unit): Amount => (amount.unit === unit ? amount : UNIT_STARTS[unit])

export const DEFAULT_AMOUNT: Amount = { quantity: PLAIN_QUANTITY, unit: 'unit' }

export const amountForNewEntry = (item: Item) => item.usualAmount ?? DEFAULT_AMOUNT

export const isPlainAmount = ({ quantity, unit }: Amount) => quantity === PLAIN_QUANTITY && unit === 'unit'
