import type { ComponentProps } from 'react'
import './NoteField.css'

type NoteFieldProps = Omit<ComponentProps<'textarea'>, 'className' | 'dir'> & {
  label: string
}

export function NoteField({ label, ...textareaProps }: NoteFieldProps) {
  return (
    <label className="note-field">
      <span className="field-label">{label}</span>
      <textarea className="field note-field-text" dir="auto" {...textareaProps} />
    </label>
  )
}
