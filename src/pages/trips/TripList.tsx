import { Fragment } from 'react'
import { monthAndYear, monthName } from '../../copy/formats'
import { dayMonth, dayYear } from '../../domain/dayDate'
import type { Trip } from '../../domain/types'
import { groupByMonth } from './tripGroups'
import { TripRow } from './TripRow'

type TripListProps = {
  tripsNewestFirst: Trip[]
  today: string
}

const monthHeading = (month: string, today: string) =>
  dayYear(month) === dayYear(today) ? monthName(month) : monthAndYear(month)

export function TripList({ tripsNewestFirst, today }: TripListProps) {
  return (
    <ul className="label-list trips-list">
      {groupByMonth(tripsNewestFirst).map(({ month, trips: monthTrips }) => (
        <Fragment key={month}>
          {month !== dayMonth(today) && (
            <li>
              <h2 className="section-heading trips-month">{monthHeading(month, today)}</h2>
            </li>
          )}
          {monthTrips.map((trip) => (
            <li key={trip.id}>
              <TripRow trip={trip} />
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
  )
}
