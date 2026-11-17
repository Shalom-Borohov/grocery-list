import { LabelRow } from '../../components/LabelRow'
import { SecondaryText } from '../../components/SecondaryText'
import { COMMON_COPY } from '../../copy/common'
import { type SecondaryLine, secondaryLine } from '../../domain/secondaryLine'
import { type IndexedLine, lineName } from './indexedLines'

type TripLinesProps = {
  lines: IndexedLine[]
  onOpen: (lineIndex: number) => void
}

const MISSING_LINE: SecondaryLine = { kind: 'missing' }

const lineSecondary = ({ tripLine, item }: IndexedLine) =>
  tripLine.state === 'missing' ? MISSING_LINE : item && secondaryLine(item)

function TripLineRow({ indexed, onOpen }: { indexed: IndexedLine; onOpen: () => void }) {
  const { tripLine, item } = indexed
  const secondary = lineSecondary(indexed)

  return (
    <LabelRow
      name={lineName(indexed)}
      amount={tripLine.amount}
      secondary={secondary && <SecondaryText line={secondary} />}
      photoId={item?.photoId}
      trailing={
        tripLine.price !== undefined && <span className="trip-line-price num">{COMMON_COPY.shekels(tripLine.price)}</span>
      }
      onTap={onOpen}
    />
  )
}

export function TripLines({ lines, onOpen }: TripLinesProps) {
  return (
    <ul className="label-list trip-lines">
      {lines.map((indexed) => (
        <li key={indexed.lineIndex}>
          <TripLineRow indexed={indexed} onOpen={() => onOpen(indexed.lineIndex)} />
        </li>
      ))}
    </ul>
  )
}
