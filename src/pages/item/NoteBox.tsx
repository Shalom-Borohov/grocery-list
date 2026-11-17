import { COMMON_COPY } from '../../copy/common'

type NoteBoxProps = {
  note: string | undefined
  onOpen: () => void
}

export function NoteBox({ note, onOpen }: NoteBoxProps) {
  return (
    <button type="button" className="item-note" onClick={onOpen}>
      {note ? (
        <>
          <span className="item-note-label">{COMMON_COPY.note}</span>
          <span className="item-note-text" dir="auto">
            {note}
          </span>
        </>
      ) : (
        <span className="item-note-add">{COMMON_COPY.addNote}</span>
      )}
    </button>
  )
}
