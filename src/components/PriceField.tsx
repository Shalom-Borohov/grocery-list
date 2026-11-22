import { useId, useState } from 'react'
import { COMMON_COPY } from '../copy/common'
import { INVALID_PRICE, parsePriceText } from '../domain/price'
import './PriceField.css'

type PriceFieldProps = {
  label: string
  price: number | undefined
  hint?: number
  description?: string
  onChange: (price: number | undefined) => void
  onValidityChange?: (isValid: boolean) => void
}

const NO_PRICE_TEXT = ''

const AGOROT_DIGITS = 2

function priceText(price: number | undefined) {
  if (price === undefined) {
    return NO_PRICE_TEXT
  }

  return Number.isInteger(price) ? String(price) : price.toFixed(AGOROT_DIGITS)
}

export function PriceField({ label, price, hint, description, onChange, onValidityChange }: PriceFieldProps) {
  const [text, setText] = useState(() => priceText(price))
  const [isInvalid, setInvalid] = useState(false)
  const messageId = useId()
  const descriptionId = useId()

  const describedBy = [isInvalid && messageId, description && descriptionId]
    .filter((id) => typeof id === 'string')
    .join(' ')

  function change(typed: string) {
    setText(typed)
    const parsed = parsePriceText(typed)
    const isTypedInvalid = parsed === INVALID_PRICE

    setInvalid(isTypedInvalid)
    onValidityChange?.(!isTypedInvalid)

    if (parsed !== INVALID_PRICE) {
      onChange(parsed)
    }
  }

  return (
    <div className="price-field">
      <label className="price-field-label">
        <span className="field-label">{label}</span>
        <span className="price-field-box">
          <span className="price-field-currency" aria-hidden="true">
            ₪
          </span>
          <input
            className="field num"
            inputMode="decimal"
            value={text}
            placeholder={hint === undefined ? undefined : priceText(hint)}
            aria-invalid={isInvalid}
            aria-describedby={describedBy || undefined}
            onChange={(event) => change(event.target.value)}
          />
        </span>
      </label>
      {isInvalid && (
        <span id={messageId} className="field-error">
          {COMMON_COPY.invalidPrice}
        </span>
      )}
      {description && (
        <span id={descriptionId} className="quiet-text price-field-description">
          {description}
        </span>
      )}
      {hint !== undefined && text === NO_PRICE_TEXT && (
        <button type="button" className="quiet-button price-field-hint" onClick={() => change(priceText(hint))}>
          {COMMON_COPY.sameAsLastTime(COMMON_COPY.shekels(hint))}
        </button>
      )}
    </div>
  )
}
