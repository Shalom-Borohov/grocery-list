import type { StepDirection } from '../domain/amount'
import './Stepper.css'

type StepperProps = {
  valueText: string
  lessLabel: string
  moreLabel: string
  canStepDown: boolean
  canStepUp: boolean
  onStep: (direction: StepDirection) => void
}

export function Stepper({ valueText, lessLabel, moreLabel, canStepDown, canStepUp, onStep }: StepperProps) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-step"
        aria-label={lessLabel}
        disabled={!canStepDown}
        onClick={() => onStep(-1)}
      >
        −
      </button>
      <output className="stepper-value num" aria-live="polite">
        {valueText}
      </output>
      <button type="button" className="stepper-step" aria-label={moreLabel} disabled={!canStepUp} onClick={() => onStep(1)}>
        +
      </button>
    </div>
  )
}
