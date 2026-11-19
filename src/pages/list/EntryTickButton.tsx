import { TickRing } from '../../components/TickRing'

type EntryTickButtonProps = {
  isTaken: boolean
  label: string
  onTap: () => void
}

export function EntryTickButton({ isTaken, label, onTap }: EntryTickButtonProps) {
  return (
    <button type="button" className="entry-tick-button" aria-label={label} aria-pressed={isTaken} onClick={onTap}>
      <TickRing isTicked={isTaken} />
    </button>
  )
}
