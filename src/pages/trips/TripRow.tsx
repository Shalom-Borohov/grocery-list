import { Link } from 'react-router-dom'
import { AmountColumn, LabelRow } from '../../components/LabelRow'
import { COMMON_COPY } from '../../copy/common'
import { dayOfMonth, weekdayLetter } from '../../copy/formats'
import type { Trip, TripLine } from '../../domain/types'
import { tripPath } from '../../navigation/paths'
import { TRIPS_COPY } from './copy'

type TripSecondaryProps = {
  missingCount: number
  hasReceipt: boolean
}

const countInState = (lines: TripLine[], wanted: TripLine['state']) => lines.filter(({ state }) => state === wanted).length

function TripSecondary({ missingCount, hasReceipt }: TripSecondaryProps) {
  return (
    <>
      {missingCount > 0 && <span className="warning-word">{TRIPS_COPY.missingCount(missingCount)}</span>}
      {missingCount > 0 && hasReceipt && COMMON_COPY.separator}
      {hasReceipt && TRIPS_COPY.receipt}
    </>
  )
}

function TripTotal({ total }: { total: number | undefined }) {
  return total === undefined ? (
    <span className="trip-total is-missing">{TRIPS_COPY.noTotal}</span>
  ) : (
    <span className="trip-total num">{COMMON_COPY.shekels(total)}</span>
  )
}

export function TripRow({ trip }: { trip: Trip }) {
  const missingCount = countInState(trip.lines, 'missing')
  const hasReceipt = trip.receiptPhotoIds.length > 0

  return (
    <Link className="trip-link" to={tripPath(trip.id)}>
      <LabelRow
        name={COMMON_COPY.itemCount(countInState(trip.lines, 'taken'))}
        column={
          <AmountColumn numeral={dayOfMonth(trip.finishedAt)} unitLabel={weekdayLetter(trip.finishedAt)} size="row" />
        }
        secondary={(missingCount > 0 || hasReceipt) && <TripSecondary missingCount={missingCount} hasReceipt={hasReceipt} />}
        trailing={<TripTotal total={trip.total} />}
      />
    </Link>
  )
}
