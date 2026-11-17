import { IonContent, IonPage } from '@ionic/react'
import { useMemo, useState } from 'react'
import { ChoiceGroup } from '../../components/ChoiceGroup'
import { useToday } from '../../components/useToday'
import { monthName } from '../../copy/formats'
import { useRecords } from '../../data/hooks'
import { dayMonth, dayYear } from '../../domain/dayDate'
import { type Period, PERIODS, periodSpending } from '../../domain/spending'
import type { Trip } from '../../domain/types'
import { newestFirst } from '../../domain/usualHints'
import { TRIPS_COPY } from './copy'
import { SpendingBlock } from './SpendingBlock'
import { TripList } from './TripList'
import './trips.css'

const PERIOD_NAMES: Record<Period, (today: string) => string> = {
  month: (today) => monthName(dayMonth(today)),
  year: (today) => String(dayYear(today)),
}

type TripsHistoryProps = {
  trips: Trip[]
  today: string
  period: Period
}

function TripsHistory({ trips, today, period }: TripsHistoryProps) {
  const tripsNewestFirst = useMemo(() => newestFirst(trips), [trips])

  if (trips.length === 0) {
    return <p className="empty-note">{TRIPS_COPY.empty}</p>
  }

  return (
    <>
      <SpendingBlock periodName={PERIOD_NAMES[period](today)} spending={periodSpending(tripsNewestFirst, period, today)} />
      <TripList tripsNewestFirst={tripsNewestFirst} today={today} />
    </>
  )
}

export function TripsPage() {
  const records = useRecords()
  const today = useToday()
  const [period, setPeriod] = useState<Period>('month')

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="page-body">
          <div className="trips-title-row">
            <h1 className="page-title">{TRIPS_COPY.title}</h1>
            {records && records.trips.length > 0 && (
              <ChoiceGroup
                className="segmented"
                label={TRIPS_COPY.period}
                choices={PERIODS}
                chosen={period}
                labelOf={TRIPS_COPY.periodLabel}
                onChoose={setPeriod}
              />
            )}
          </div>
          {records && <TripsHistory trips={records.trips} today={today} period={period} />}
        </div>
      </IonContent>
    </IonPage>
  )
}
