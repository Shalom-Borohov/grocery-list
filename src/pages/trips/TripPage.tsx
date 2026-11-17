import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react'
import { useParams } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { useRecords } from '../../data/hooks'
import { TRIPS_PATH } from '../../navigation/paths'
import { TRIPS_COPY } from './copy'
import { TripView } from './TripView'
import './trip.css'

export function TripPage() {
  const { tripId } = useParams()
  const records = useRecords()
  const trip = records?.trips.find(({ id }) => id === tripId)

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={TRIPS_PATH} text={COMMON_COPY.trips} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {records && (trip ? <TripView trip={trip} items={records.items} /> : <p className="empty-note">{TRIPS_COPY.notFound}</p>)}
      </IonContent>
    </IonPage>
  )
}
