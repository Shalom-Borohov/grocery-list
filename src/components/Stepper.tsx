import { useId, useState } from 'react'
import { INVALID_AMOUNT, type ParsedNumber, type StepDirection } from '../domain/amount'
import './Stepper.css'

type StepperProps = {
  label: string
  valueText: string
  inputMode: 'decimal' | 'numeric'
  errorText: string
  lessLabel: string
  moreLabel: string
  canStepDown: boolean
  canStepUp: boolean
  parse: (text: string) => ParsedNumber
  onStep: (direction: StepDirection) => void
  onType: (typed: number) => void
}

export function Stepper(props: StepperProps) {
  const { label, valueText, inputMode, errorText, lessLabel, moreLabel, canStepDown, canStepUp, parse } = props
  const [draft, setDraft] = useState<string>()
  const [textWhileTyping, setTextWhileTyping] = useState<string>()
  const [wasLeftInvalid, setLeftInvalid] = useState(false)
  const errorId = useId()
  const isInvalid = wasLeftInvalid && draft !== undefined && parse(draft) === INVALID_AMOUNT

  function type(typed: string) {
    setDraft(typed)
    const parsed = parse(typed)

    if (typeof parsed === 'number') {
      props.onType(parsed)
    }
  }

  function leave() {
    setTextWhileTyping(undefined)

    if (draft !== undefined && parse(draft) === INVALID_AMOUNT) {
      setLeftInvalid(true)
    } else {
      setDraft(undefined)
    }
  }

  function selectAfterTap(input: HTMLInputElement) {
    setTimeout(() => input.setSelectionRange(0, input.value.length))
  }

  function step(direction: StepDirection) {
    setDraft(undefined)
    setTextWhileTyping(undefined)
    setLeftInvalid(false)
    props.onStep(direction)
  }

  return (
    <div className="stepper-field">
      <div className="stepper">
        <button type="button" className="stepper-step" aria-label={lessLabel} disabled={!canStepDown} onClick={() => step(-1)}>
          −
        </button>
        <input
          className="stepper-value num"
          aria-label={label}
          inputMode={inputMode}
          autoComplete="off"
          value={draft ?? valueText}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
          onFocus={(event) => {
            setTextWhileTyping(valueText)
            selectAfterTap(event.currentTarget)
          }}
          onBlur={leave}
          onChange={(event) => type(event.target.value)}
        />
        <button type="button" className="stepper-step" aria-label={moreLabel} disabled={!canStepUp} onClick={() => step(1)}>
          +
        </button>
      </div>
      <output className="visually-hidden" aria-live="polite">
        {textWhileTyping ?? valueText}
      </output>
      {isInvalid && (
        <span id={errorId} className="field-error">
          {errorText}
        </span>
      )}
    </div>
  )
}
