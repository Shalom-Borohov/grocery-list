import { COMMON_COPY } from '../../../copy/common'
import { setsInOrder } from '../../../domain/setEntries'
import type { SavedSet } from '../../../domain/types'
import { PICKER_COPY } from './copy'

type SetButtonsProps = {
  sets: SavedSet[]
  onPour: (setId: string) => void
}

export function SetButtons({ sets, onPour }: SetButtonsProps) {
  return (
    <section>
      <h2 className="section-heading">{COMMON_COPY.sets}</h2>
      <div className="picker-sets">
        {setsInOrder(sets).map((savedSet) => (
          <button key={savedSet.id} type="button" className="outline-button picker-set" onClick={() => onPour(savedSet.id)}>
            {PICKER_COPY.setButton(savedSet.name, savedSet.entries.length)}
          </button>
        ))}
      </div>
    </section>
  )
}
