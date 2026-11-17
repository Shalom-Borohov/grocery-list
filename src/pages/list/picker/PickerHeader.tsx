import { COMMON_COPY } from '../../../copy/common'
import { PICKER_COPY } from './copy'

type PickerHeaderProps = {
  addedCount: number
  onDone: () => void
}

export function PickerHeader({ addedCount, onDone }: PickerHeaderProps) {
  return (
    <div className="picker-header">
      <h1 className="picker-title">{PICKER_COPY.title}</h1>
      {addedCount > 0 && (
        <span className="quiet-text" role="status">
          {PICKER_COPY.addedCount(addedCount)}
        </span>
      )}
      <button type="button" className="picker-done" onClick={onDone}>
        {COMMON_COPY.done}
      </button>
    </div>
  )
}
