import { IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { Navigate, Route } from 'react-router-dom'
import { ItemsIcon, ListIcon, SettingsIcon, TripsIcon } from './components/icons'
import { COMMON_COPY } from './copy/common'
import { ITEMS_PATH, LIST_PATH, SETTINGS_PATH, TRIPS_PATH } from './navigation/paths'
import { ItemPage } from './pages/item/ItemPage'
import { ItemsPage } from './pages/items/ItemsPage'
import { SetPage } from './pages/items/SetPage'
import { ListPage } from './pages/list/ListPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { TripPage } from './pages/trips/TripPage'
import { TripsPage } from './pages/trips/TripsPage'

export function Tabs() {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="list" element={<ListPage />} />
        <Route path="list/item/:itemId" element={<ItemPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/item/:itemId" element={<ItemPage />} />
        <Route path="trips/:tripId" element={<TripPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="items/item/:itemId" element={<ItemPage />} />
        <Route path="items/sets/:setId" element={<SetPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route index element={<Navigate to="list" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom" className="shelf-tab-bar">
        <IonTabButton tab="list" href={LIST_PATH}>
          <ListIcon />
          <IonLabel>{COMMON_COPY.list}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="trips" href={TRIPS_PATH}>
          <TripsIcon />
          <IonLabel>{COMMON_COPY.trips}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="items" href={ITEMS_PATH}>
          <ItemsIcon />
          <IonLabel>{COMMON_COPY.items}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href={SETTINGS_PATH}>
          <SettingsIcon />
          <IonLabel>{COMMON_COPY.settings}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}
