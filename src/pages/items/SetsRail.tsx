import { useId } from 'react'
import { Link } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { setsInOrder } from '../../domain/setEntries'
import type { SavedSet } from '../../domain/types'
import { setPath } from '../../navigation/paths'

export function SetsRail({ sets }: { sets: SavedSet[] }) {
  const headingId = useId()

  return (
    <>
      <h2 id={headingId} className="section-heading">
        {COMMON_COPY.sets}
      </h2>
      <ul className="sets-rail" aria-labelledby={headingId}>
        {setsInOrder(sets).map((savedSet) => (
          <li key={savedSet.id}>
            <Link className="set-card" to={setPath(savedSet.id)}>
              <span className="set-card-name" dir="auto">
                {savedSet.name}
              </span>
              <span className="set-card-count">{COMMON_COPY.itemCount(savedSet.entries.length)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
