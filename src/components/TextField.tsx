import { useId } from 'react'
import './TextField.css'

type TextFieldProps = {
  label: string
  defaultValue?: string
  error?: string
  onTextChange?: (text: string) => void
}

export function TextField({ label, defaultValue, error, onTextChange }: TextFieldProps) {
  const errorId = useId()

  return (
    <div className="text-field">
      <label>
        <span className="field-label">{label}</span>
        <input
          className="field"
          dir="auto"
          defaultValue={defaultValue}
          aria-invalid={error !== undefined}
          aria-describedby={error === undefined ? undefined : errorId}
          onChange={(event) => onTextChange?.(event.target.value)}
        />
      </label>
      {error !== undefined && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </div>
  )
}
