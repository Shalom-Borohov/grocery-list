import { PlusIcon } from '../../components/icons'
import { COMMON_COPY } from '../../copy/common'
import { joinParts } from '../../copy/joinParts'
import type { EntryState } from '../../domain/types'
import { LIST_COPY } from './copy'

function AddButton({ onAdd }: { onAdd: () => void }) {
  return (
    <button type="button" className="round-button" aria-label={COMMON_COPY.add} onClick={onAdd}>
      <PlusIcon />
    </button>
  )
}

type HomeHeaderProps = {
  count: number
  onAdd: () => void
}

export function HomeHeader({ count, onAdd }: HomeHeaderProps) {
  return (
    <header className="home-header">
      <div className="home-header-text">
        <h1 className="page-title">{LIST_COPY.title}</h1>
        {count > 0 && <p className="quiet-text list-count">{COMMON_COPY.itemCount(count)}</p>}
      </div>
      <AddButton onAdd={onAdd} />
    </header>
  )
}

type ShopHeaderProps = {
  counts: Record<EntryState, number>
  onFinish: () => void
  onAdd: () => void
}

const countPart = (count: number, text: (count: number) => string) => (count > 0 ? text(count) : undefined)

export function ShopHeader({ counts, onFinish, onAdd }: ShopHeaderProps) {
  const detail = joinParts([countPart(counts.taken, LIST_COPY.inCart), countPart(counts.missing, LIST_COPY.missingCount)])

  return (
    <header className="shop-header">
      <span className="shop-count-tile num" aria-hidden="true">
        {counts.waiting}
      </span>
      <div className="shop-count-text">
        <h1 className="shop-count-title" aria-label={LIST_COPY.leftHeading(counts.waiting)}>
          {LIST_COPY.left}
        </h1>
        {detail && <p className="shop-count-detail">{detail}</p>}
      </div>
      <div className="shop-header-actions">
        <button type="button" className="outline-button" onClick={onFinish}>
          {COMMON_COPY.done}
        </button>
        <AddButton onAdd={onAdd} />
      </div>
    </header>
  )
}
