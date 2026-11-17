import { TickIcon } from './icons'
import './TickRing.css'

const RING_TICK_SIZE = 18

export function TickRing({ isTicked }: { isTicked: boolean }) {
  return (
    <span className={isTicked ? 'tick-ring is-ticked' : 'tick-ring'} aria-hidden="true">
      {isTicked && <TickIcon size={RING_TICK_SIZE} />}
    </span>
  )
}
