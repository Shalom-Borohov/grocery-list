import { isPlainAmount } from '../domain/amount'
import type { Amount, MeasuredUnit, Unit } from '../domain/types'
import { SINGLE } from './common'

export const UNIT_LABELS: Record<Unit, string> = {
  unit: 'יח׳',
  pack: 'אריזה',
  kilogram: 'ק״ג',
  gram: 'גרם',
  liter: 'ליטר',
}

export const AMOUNT_COPY = {
  packSize: 'כמה באריזה',
  fewerInPack: 'פחות באריזה',
  moreInPack: 'יותר באריזה',
  packColumn: (packSize: number) => `${UNIT_LABELS.pack} ×${packSize}`,
  packsSpoken: (quantityText: string, quantity: number, packSize: number) =>
    `${quantityText} ${quantity === SINGLE ? UNIT_LABELS.pack : 'אריזות'} של ${packSize}`,
} as const

const QUANTITY_FORMAT = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 3 })

export const quantityText = (quantity: number) => QUANTITY_FORMAT.format(quantity)

type AmountParts = { numeral: string; unitLabel: string | undefined; spokenUnlikeShown?: string }

const measuredUnitLabel = (unit: MeasuredUnit) => (unit === 'unit' ? undefined : UNIT_LABELS[unit])

export function amountParts(amount: Amount): AmountParts | undefined {
  if (isPlainAmount(amount)) {
    return undefined
  }

  const numeral = quantityText(amount.quantity)

  if (amount.unit === 'pack') {
    return {
      numeral,
      unitLabel: AMOUNT_COPY.packColumn(amount.packSize),
      spokenUnlikeShown: AMOUNT_COPY.packsSpoken(numeral, amount.quantity, amount.packSize),
    }
  }

  return { numeral, unitLabel: measuredUnitLabel(amount.unit) }
}

export function amountText(amount: Amount) {
  const parts = amountParts(amount)

  return parts && (parts.spokenUnlikeShown ?? [parts.numeral, parts.unitLabel].filter(Boolean).join(' '))
}
