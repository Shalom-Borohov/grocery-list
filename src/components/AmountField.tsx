import { UNIT_LABELS, quantityText } from '../copy/amountCopy'
import { COMMON_COPY } from '../copy/common'
import { canStepDown, canStepUp, stepAmount, withUnit } from '../domain/amount'
import { type Amount, UNITS } from '../domain/types'
import './AmountField.css'
import { ChoiceGroup } from './ChoiceGroup'

type AmountFieldProps = {
  label: string
  amount: Amount
  onChange: (amount: Amount) => void
}

export function AmountField({ label, amount, onChange }: AmountFieldProps) {
  return (
    <fieldset className="amount-field">
      <legend className="amount-field-label">{label}</legend>
      <div className="amount-stepper">
        <button
          type="button"
          className="amount-step"
          aria-label={COMMON_COPY.less}
          disabled={!canStepDown(amount)}
          onClick={() => onChange(stepAmount(amount, -1))}
        >
          −
        </button>
        <output className="amount-value num" aria-live="polite">
          {quantityText(amount.quantity)}
        </output>
        <button
          type="button"
          className="amount-step"
          aria-label={COMMON_COPY.more}
          disabled={!canStepUp(amount)}
          onClick={() => onChange(stepAmount(amount, 1))}
        >
          +
        </button>
      </div>
      <ChoiceGroup
        className="segmented"
        label={COMMON_COPY.unit}
        choices={UNITS}
        chosen={amount.unit}
        labelOf={(unit) => UNIT_LABELS[unit]}
        onChoose={(unit) => onChange(withUnit(amount, unit))}
      />
    </fieldset>
  )
}
