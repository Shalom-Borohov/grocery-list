import { useRef, useState } from 'react'
import { COMMON_COPY } from '../copy/common'
import { NoteField } from './NoteField'

type AddableNoteProps = {
  note: string | undefined
  addButtonClassName: string
  onSave: (note: string | undefined) => void
}

export function AddableNote({ note, addButtonClassName, onSave }: AddableNoteProps) {
  const [isNoteOpen, setNoteOpen] = useState(note !== undefined)
  const lastSavedNote = useRef(note)

  function saveNote(typed: string) {
    const trimmed = typed.trim() || undefined

    if (trimmed !== lastSavedNote.current) {
      lastSavedNote.current = trimmed
      onSave(trimmed)
    }
  }

  return isNoteOpen ? (
    <NoteField
      label={COMMON_COPY.note}
      defaultValue={note}
      autoFocus={note === undefined}
      onChange={(event) => saveNote(event.target.value)}
    />
  ) : (
    <button type="button" className={`quiet-button ${addButtonClassName}`} onClick={() => setNoteOpen(true)}>
      {COMMON_COPY.addNote}
    </button>
  )
}
