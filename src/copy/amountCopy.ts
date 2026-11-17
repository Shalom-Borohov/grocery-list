import { isPlainAmount } from '../domain/amount'
import type { Amount, Unit } from '../domain/types'

export const UNIT_LABELS: Record<Unit, string> = {
  unit: 'יח׳',
  kilogram: 'ק״ג',
  gram: 'גרם',
  liter: 'ליטר',
}

const QUANTITY_FORMAT = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 3 })

export const quantityText = (quantity: number) => QUANTITY_FORMAT.format(quantity)

type AmountParts ={ numeral: string; unitLabel: string | undefined }

export function amountParts(amount: Amount): AmountParts | undefined {
  if (isPlainAmount(amount)) {
    return undefined
  }

  return { numeral: quantityText(amount.quantity), unitLabel: amount.unit === 'unit' ? undefined : UNIT_LABELS[amount.unit] }
}

export function amountText(amount: Amount) {
  const parts = amountParts(amount)

  return parts && [parts.numeral, parts.unitLabel].filter(Boolean).join(' ')
}
