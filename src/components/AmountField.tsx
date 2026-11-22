import { AMOUNT_COPY, UNIT_LABELS, quantityText } from '../copy/amountCopy'
import { COMMON_COPY } from '../copy/common'
import { canStepDown, canStepPackSize, canStepUp, stepAmount, stepPackSize, withUnit } from '../domain/amount'
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
  return (
    <fieldset className="amount-field">
      <legend className="amount-field-label">{label}</legend>
      <Stepper
        valueText={quantityText(amount.quantity)}
        lessLabel={COMMON_COPY.less}
        moreLabel={COMMON_COPY.more}
        canStepDown={canStepDown(amount)}
        canStepUp={canStepUp(amount)}
        onStep={(direction) => onChange(stepAmount(amount, direction))}
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
        valueText={quantityText(pack.packSize)}
        lessLabel={AMOUNT_COPY.fewerInPack}
        moreLabel={AMOUNT_COPY.moreInPack}
        canStepDown={canStepPackSize(pack, -1)}
        canStepUp={canStepPackSize(pack, 1)}
        onStep={(direction) => onChange(stepPackSize(pack, direction))}
      />
    </fieldset>
  )
}
