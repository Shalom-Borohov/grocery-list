import { AMOUNT_COPY, UNIT_LABELS, quantityInputText } from '../copy/amountCopy'
import { COMMON_COPY } from '../copy/common'
import {
  allowsFraction,
  canStepDown,
  canStepPackSize,
  canStepUp,
  parsePackSizeText,
  parseQuantityText,
  stepAmount,
  stepPackSize,
  withUnit,
} from '../domain/amount'
import { type Amount, type PackAmount, UNITS } from '../domain/types'
import './AmountField.css'
import { ChoiceGroup } from './ChoiceGroup'
import { Stepper } from './Stepper'

type AmountFieldProps = {
  label: string
  amount: Amount
  onChange: (amount: Amount) => void
}

export function AmountField({ label, amount, onChange }: AmountFieldProps) {
  const isFraction = allowsFraction(amount.unit)

  return (
    <fieldset className="amount-field">
      <legend className="amount-field-label">{label}</legend>
      <Stepper
        key={amount.unit}
        label={label}
        valueText={quantityInputText(amount.quantity)}
        inputMode={isFraction ? 'decimal' : 'numeric'}
        errorText={isFraction ? AMOUNT_COPY.fractionQuantityError : AMOUNT_COPY.wholeQuantityError}
        lessLabel={COMMON_COPY.less}
        moreLabel={COMMON_COPY.more}
        canStepDown={canStepDown(amount)}
        canStepUp={canStepUp(amount)}
        parse={(text) => parseQuantityText(text, amount.unit)}
        onStep={(direction) => onChange(stepAmount(amount, direction))}
        onType={(quantity) => onChange({ ...amount, quantity })}
      />
      <ChoiceGroup
        className="segmented"
        label={COMMON_COPY.unit}
        choices={UNITS}
        chosen={amount.unit}
        labelOf={(unit) => UNIT_LABELS[unit]}
        onChoose={(unit) => onChange(withUnit(amount, unit))}
      />
      {amount.unit === 'pack' && <PackSizeField pack={amount} onChange={onChange} />}
    </fieldset>
  )
}

type PackSizeFieldProps = {
  pack: PackAmount
  onChange: (amount: Amount) => void
}

function PackSizeField({ pack, onChange }: PackSizeFieldProps) {
  return (
    <fieldset className="amount-field">
      <legend className="amount-field-label">{AMOUNT_COPY.packSize}</legend>
      <Stepper
        label={AMOUNT_COPY.packSize}
        valueText={quantityInputText(pack.packSize)}
        inputMode="numeric"
        errorText={AMOUNT_COPY.packSizeError}
        lessLabel={AMOUNT_COPY.fewerInPack}
        moreLabel={AMOUNT_COPY.moreInPack}
        canStepDown={canStepPackSize(pack, -1)}
        canStepUp={canStepPackSize(pack, 1)}
        parse={parsePackSizeText}
        onStep={(direction) => onChange(stepPackSize(pack, direction))}
        onType={(packSize) => onChange({ ...pack, packSize })}
      />
    </fieldset>
  )
}
